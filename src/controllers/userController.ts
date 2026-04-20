import { Response } from 'express';
import { Op } from 'sequelize';
import { randomInt } from 'crypto';
import User, { UserRole } from '../models/user';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { AuthRequest } from '../middleware/auth';
import { sendOTPEmail, sendEmail, sendProfileEmailUpdateOTP } from '../utils/emailService';
import templateService from '../services/templateService';
import { CommunicationType } from '../models/communicationTemplate';
import { generateToken } from '../utils/jwt';
// import sequelize from '../config/database'; // Removed due to instance mismatch
import Notification from '../models/notification';
import BookChapterSubmission from '../models/bookChapterSubmission';
import TextBookSubmission from '../models/textBookSubmission';
import ProjectInternshipSubmission from '../models/projectInternshipSubmission';
import RecruitmentSubmission from '../models/recruitmentSubmission';
import BookChapterReviewerAssignment from '../models/bookChapterReviewerAssignment';
import ChapterReviewerAssignment, { ReviewerAssignmentStatus } from '../models/chapterReviewerAssignment';
import BookEditor from '../models/bookEditor';
import IndividualChapter, { ChapterStatus } from '../models/individualChapter';
import BookChapterFile from '../models/bookChapterFile';
import TextBookFile from '../models/textBookFile';
import TextBookRevision from '../models/textBookRevision';
import ChapterRevision from '../models/chapterRevision';
import TokenBlacklist from '../models/tokenBlacklist';
import BookChapterDiscussion from '../models/bookChapterDiscussion';
import TextBookDiscussion from '../models/textBookDiscussion';
import ChapterDiscussion from '../models/chapterDiscussion';
import BookChapterStatusHistory from '../models/bookChapterStatusHistory';
import ChapterStatusHistory from '../models/chapterStatusHistory';
import TextBookStatusHistory from '../models/textBookStatusHistory';
import BookTitle from '../models/bookTitle';
import { BookChapterStatus } from '../models/bookChapterSubmission';
import { TextBookStatus } from '../models/textBookSubmission';
import { RecruitmentStatus } from '../models/recruitmentSubmission';
import { SubmissionStatus } from '../models/projectInternshipSubmission';


const OTP_EXPIRY_MINUTES = 10;

/**
 * Helper function to generate OTP expiry time
 */
const getOTPExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

/**
 * Get all users (Admin/Developer functionality)
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      isActive = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build search conditions
    const whereConditions: any = {};

    // Search by name, email, or username
    if (search) {
      whereConditions[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } },
        { userId: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by role
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      whereConditions.role = role as UserRole;
    }

    // Filter by active status
    if (isActive !== '') {
      whereConditions.isActive = isActive === 'true';
    }

    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      attributes: {
        exclude: [
          'password',
          'emailOtp',
          'resetPasswordToken',
          'emailOtpExpiry',
          'resetPasswordExpiry',
          'otpAttempts',
        ],
      },
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    return sendSuccess(
      res,
      {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers: count,
          usersPerPage: limitNum,
        },
      },
      'Users retrieved successfully'
    );
  } catch (error) {
    console.error('Get all users error:', error);
    return sendError(res, 'Failed to retrieve users', 500);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return sendError(res, 'Invalid user ID', 400);
    }

    const userId = Number(id);
    const requestingUser = req.authenticatedUser;

    // Check if user is viewing their own profile or has permission
    if (
      requestingUser?.id !== userId &&
      !requestingUser?.hasPermission('user:read')
    ) {
      return sendError(
        res,
        'You can only view your own profile or need appropriate permissions',
        403
      );
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { id: Number(id) },
          { userId: id }
        ]
      },
      attributes: {
        exclude: [
          'password',
          'emailOtp',
          'resetPasswordToken',
          'emailOtpExpiry',
          'resetPasswordExpiry',
          'otpAttempts',
        ],
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    console.error('Get user by ID error:', error);
    return sendError(res, 'Failed to retrieve user', 500);
  }
};

/**
 * Get user by Role
 */
/**
 * Get users by Role (returns all users with the specified role)
 */
export const getUsersByRole = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.params;

    // Validate role
    if (!role || !Object.values(UserRole).includes(role as UserRole)) {
      return sendError(res, 'Invalid user role', 400);
    }

    const userRole = role as UserRole;
    const requestingUser = req.authenticatedUser;

    // Check permissions - only admin/developer can view users by role
    if (!requestingUser?.hasPermission('user:read')) {
      return sendError(
        res,
        'You need appropriate permissions to view users by role',
        403
      );
    }

    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Find all users with the specified role
    const { count, rows: users } = await User.findAndCountAll({
      where: { role: userRole },
      attributes: {
        exclude: [
          'password',
          'emailOtp',
          'resetPasswordToken',
          'emailOtpExpiry',
          'resetPasswordExpiry',
          'otpAttempts',
        ],
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    if (count === 0) {
      return sendError(res, `No users found with role: ${role}`, 404);
    }

    const totalPages = Math.ceil(count / limit);

    return sendSuccess(
      res,
      {
        users,
        role: userRole,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: count,
          usersPerPage: limit,
        },
      },
      `Users with role ${role} retrieved successfully`
    );
  } catch (error) {
    console.error('Get users by role error:', error);
    return sendError(res, 'Failed to retrieve users by role', 500);
  }
};

/**
 * Get reviewers (Specific endpoint for Editors)
 * Editors need to assign reviewers but don't have user:view-all permission
 */
export const getReviewers = async (req: AuthRequest, res: Response) => {
  try {
    const requestingUser = req.authenticatedUser;
    const { search, isActive } = req.query;

    // Check permissions - Editor needs submission:assign-reviewer
    if (!requestingUser?.hasPermission('submission:assign-reviewer')) {
      return sendError(
        res,
        'You need permission to assign reviewers to view the reviewer list',
        403
      );
    }

    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100; // Default higher limit for dropdowns
    const offset = (page - 1) * limit;

    // Build query conditions
    const whereConditions: any = {
      role: UserRole.REVIEWER
    };

    // Filter by status if provided (default to returning all if not specified or 'all')
    if (isActive === 'true') {
      whereConditions.isActive = true;
    } else if (isActive === 'false') {
      whereConditions.isActive = false;
    }
    // If isActive is 'all' or undefined, we don't filter by isActive, returning both.
    // NOTE: The previous hardcoded 'isActive: true' is REMOVED to allow seeing inactive users.

    // Add search filter if provided
    if (search) {
      whereConditions[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } },
        { userId: { [Op.like]: `%${search}%` } },
      ];
    }

    // Find all users with REVIEWER role
    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      attributes: {
        exclude: [
          'password',
          'emailOtp',
          'resetPasswordToken',
          'emailOtpExpiry',
          'resetPasswordExpiry',
          'otpAttempts',
        ],
      },
      order: [['fullName', 'ASC']],
      limit,
      offset,
    });

    return sendSuccess(
      res,
      {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalUsers: count,
          usersPerPage: limit,
        },
      },
      'Reviewers retrieved successfully'
    );
  } catch (error) {
    console.error('Get reviewers error:', error);
    return sendError(res, 'Failed to retrieve reviewers', 500);
  }
};
/**
 * Get user by Email
 */
export const getUserByEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.params;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return sendError(res, 'Invalid email address', 400);
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
      attributes: {
        exclude: [
          'password',
          'emailOtp',
          'resetPasswordToken',
          'emailOtpExpiry',
          'resetPasswordExpiry',
          'otpAttempts',
        ],
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    console.error('Get user by email error:', error);
    return sendError(res, 'Failed to retrieve user', 500);
  }
};

/**
 * Update user profile (by authenticated user or admin)
 * Enhanced with email OTP verification
 */
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      username,
      email,
      profilePicture,
      phoneNumber,
      gender,
      nationality,
      dateOfBirth,
      streetAddress,
      city,
      state,
      country,
      zipCode,
      bio,
      designation,
      organization,
      department,
      orcidId,
      experienceYears,
      qualification,
      specialization,
      researchInterests,
      linkedinProfile,
      twitterProfile,
      website,
      scopusLink
    } = req.body;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return sendError(res, 'Invalid user ID', 400);
    }

    const userId = Number(id);
    const requestingUser = req.authenticatedUser;

    // Check if user is updating their own profile or has permission
    if (
      requestingUser?.id !== userId &&
      !requestingUser?.hasPermission('user:update')
    ) {
      return sendError(
        res,
        'You can only update your own profile or need appropriate permissions',
        403
      );
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { id: Number(id) },
          { userId: id }
        ]
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Validate and update fields
    const errors: any = {};
    let emailChanged = false;

    // Full Name validation
    if (fullName !== undefined) {
      if (!fullName || fullName.trim().length === 0) {
        errors.fullName = 'Full name cannot be empty';
      } else if (fullName.trim().length < 2 || fullName.trim().length > 100) {
        errors.fullName = 'Full name must be between 2 and 100 characters';
      } else {
        user.fullName = fullName.trim();
      }
    }

    // Username validation
    if (username !== undefined && username !== user.username) {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!username || username.trim().length < 3 || username.trim().length > 50) {
        errors.username = 'Username must be between 3 and 50 characters';
      } else if (!usernameRegex.test(username)) {
        errors.username = 'Username can only contain letters, numbers, and underscores';
      } else {
        // Check if username already exists
        const existingUser = await User.findOne({
          where: { username: username.toLowerCase().trim(), id: { [Op.ne]: userId } },
        });
        if (existingUser) {
          errors.username = 'Username already taken';
        } else {
          user.username = username.toLowerCase().trim();
        }
      }
    }

    // Email validation (if changing email, require re-verification)
    if (email !== undefined && email.toLowerCase().trim() !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Please provide a valid email address';
      } else {
        // Check if email already exists
        const existingUser = await User.findOne({
          where: { email: email.toLowerCase().trim(), id: { [Op.ne]: userId } },
        });
        if (existingUser) {
          errors.email = 'Email address already in use';
        } else {
          // Generate OTP for email verification
          const emailOtp = user.generateOTP();

          user.email = email.toLowerCase().trim();
          user.emailVerified = false;
          user.emailOtp = emailOtp;
          user.emailOtpExpiry = getOTPExpiry();
          user.otpAttempts = 0;

          emailChanged = true;

          // Send OTP to new email
          try {
            await sendProfileEmailUpdateOTP(user.email, emailOtp, user.fullName);
          } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            errors.email = 'Failed to send verification email. Please try again.';
          }
        }
      }
    }

    // Profile Picture validation
    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture || null;
    }

    // Update other profile fields if provided
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber || null;
    if (gender !== undefined) user.gender = gender || null;
    if (nationality !== undefined) user.nationality = nationality || null;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (streetAddress !== undefined) user.streetAddress = streetAddress || null;
    if (city !== undefined) user.city = city || null;
    if (state !== undefined) user.state = state || null;
    if (country !== undefined) user.country = country || null;
    if (zipCode !== undefined) user.zipCode = zipCode || null;
    if (bio !== undefined) user.bio = bio || null;
    if (designation !== undefined) user.designation = designation || null;
    if (organization !== undefined) user.organization = organization || null;
    if (department !== undefined) user.department = department || null;
    if (orcidId !== undefined) user.orcidId = orcidId || null;
    if (experienceYears !== undefined) user.experienceYears = experienceYears !== null ? Number(experienceYears) : null;
    if (qualification !== undefined) user.qualification = qualification || null;
    if (specialization !== undefined) user.specialization = specialization || null;
    if (researchInterests !== undefined) user.researchInterests = researchInterests || null;
    if (linkedinProfile !== undefined) user.linkedinProfile = linkedinProfile || null;
    if (twitterProfile !== undefined) user.twitterProfile = twitterProfile || null;
    if (website !== undefined) user.website = website || null;
    if (scopusLink !== undefined) user.scopusLink = scopusLink || null;

    if (Object.keys(errors).length > 0) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    await user.save();

    const userData = {
      id: user.id,
      userId: user.userId,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      profilePicture: user.profilePicture,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      nationality: user.nationality,
      dateOfBirth: user.dateOfBirth,
      streetAddress: user.streetAddress,
      city: user.city,
      state: user.state,
      country: user.country,
      zipCode: user.zipCode,
      bio: user.bio,
      designation: user.designation,
      organization: user.organization,
      department: user.department,
      orcidId: user.orcidId,
      experienceYears: user.experienceYears,
      qualification: user.qualification,
      specialization: user.specialization,
      researchInterests: user.researchInterests,
      linkedinProfile: user.linkedinProfile,
      twitterProfile: user.twitterProfile,
      website: user.website,
      scopusLink: user.scopusLink,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      permissions: user.getPermissions(),
    };

    let message = 'Profile updated successfully';
    if (emailChanged) {
      message = 'Profile updated successfully. A verification OTP has been sent to your new email address. Please verify to complete the email change.';
    }

    return sendSuccess(res, userData, message);
  } catch (error: any) {
    console.error('Update user profile error:', error);

    if (error.name === 'SequelizeValidationError') {
      const errors: any = {};
      error.errors.forEach((err: any) => {
        errors[err.path] = err.message;
      });
      return sendError(res, 'Validation failed', 400, errors);
    }

    return sendError(res, 'Failed to update profile', 500);
  }
};

/**
 * Verify new email with OTP
 */
export const verifyEmailChange = async (req: AuthRequest, res: Response) => {
  try {
    const { otp } = req.body;
    const requestingUser = req.authenticatedUser;

    if (!requestingUser) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!otp || otp.trim().length === 0) {
      return sendError(res, 'OTP is required', 400);
    }

    if (!/^\d{6}$/.test(otp)) {
      return sendError(res, 'OTP must be a 6-digit number', 400);
    }

    // Fetch user with OTP data
    const user = await User.findOne({ where: { id: requestingUser.id } });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return sendError(res, 'Email is already verified', 400);
    }

    // Check if OTP exists
    if (!user.emailOtp || !user.emailOtpExpiry) {
      return sendError(res, 'No OTP found. Please request a new one.', 400);
    }

    // Check if OTP is expired
    if (new Date() > user.emailOtpExpiry) {
      return sendError(res, 'OTP has expired. Please request a new one.', 400);
    }

    // Check OTP attempts
    if (user.otpAttempts >= 5) {
      return sendError(
        res,
        'Too many failed attempts. Please request a new OTP.',
        429
      );
    }

    // Verify OTP
    if (user.emailOtp !== otp.trim()) {
      user.otpAttempts += 1;
      await user.save();

      return sendError(
        res,
        `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.`,
        400
      );
    }

    // OTP is valid - mark email as verified
    user.emailVerified = true;
    user.emailOtp = null;
    user.emailOtpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    const userData = {
      id: user.id,
      userId: user.userId,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      profilePicture: user.profilePicture,
    };

    return sendSuccess(res, userData, 'Email verified successfully!');
  } catch (error) {
    console.error('Verify email change error:', error);
    return sendError(res, 'Failed to verify email', 500);
  }
};

/**
 * Resend OTP for email verification
 */
export const resendEmailVerificationOTP = async (req: AuthRequest, res: Response) => {
  try {
    const requestingUser = req.authenticatedUser;

    if (!requestingUser) {
      return sendError(res, 'User not authenticated', 401);
    }

    const user = await User.findOne({ where: { id: requestingUser.id } });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.emailVerified) {
      return sendError(res, 'Email is already verified', 400);
    }

    // Check if last OTP was sent recently (rate limiting)
    if (user.emailOtpExpiry) {
      const timeSinceLastOTP = Date.now() - (user.emailOtpExpiry.getTime() - OTP_EXPIRY_MINUTES * 60 * 1000);
      const cooldownMs = 60 * 1000; // 1 minute cooldown

      if (timeSinceLastOTP < cooldownMs) {
        const waitTime = Math.ceil((cooldownMs - timeSinceLastOTP) / 1000);
        return sendError(
          res,
          `Please wait ${waitTime} seconds before requesting a new OTP.`,
          429
        );
      }
    }

    // Generate new OTP (cryptographically secure)
    const emailOtp = randomInt(100000, 999999).toString();
    user.emailOtp = emailOtp;
    user.emailOtpExpiry = getOTPExpiry();
    user.otpAttempts = 0;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(user.email, emailOtp, user.fullName);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return sendError(res, 'Failed to send verification email. Please try again.', 500);
    }

    return sendSuccess(
      res,
      { email: user.email },
      'Verification OTP has been sent to your email address.'
    );
  } catch (error) {
    console.error('Resend email verification OTP error:', error);
    return sendError(res, 'Failed to resend OTP', 500);
  }
};

/**
 * Update user role (Admin/Developer functionality)
 */
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return sendError(res, 'Invalid user ID', 400);
    }

    const userId = Number(id);
    const requestingUser = req.authenticatedUser;

    // Validate role
    if (!role || !Object.values(UserRole).includes(role as UserRole)) {
      return sendError(res, 'Invalid role', 400);
    }

    const targetUser = await User.findOne({
      where: {
        [Op.or]: [
          { id: Number(id) },
          { userId: id }
        ]
      },
    });

    if (!targetUser) {
      return sendError(res, 'User not found', 404);
    }

    // Check if requesting user can manage target user
    if (!requestingUser?.canManageUser(targetUser)) {
      return sendError(
        res,
        'You do not have permission to change this user\'s role',
        403
      );
    }

    // Prevent admins from assigning developer role
    if (
      role === UserRole.DEVELOPER &&
      requestingUser.role === UserRole.ADMIN
    ) {
      return sendError(
        res,
        'Only developers can assign the developer role',
        403
      );
    }

    // Update role
    targetUser.role = role as UserRole;
    await targetUser.save();

    const userData = {
      id: targetUser.id,
      userId: targetUser.userId,
      username: targetUser.username,
      fullName: targetUser.fullName,
      email: targetUser.email,
      role: targetUser.role,
      emailVerified: targetUser.emailVerified,
      isActive: targetUser.isActive,
      updatedAt: targetUser.updatedAt,
    };

    return sendSuccess(res, userData, 'User role updated successfully');
  } catch (error) {
    console.error('Update user role error:', error);
    return sendError(res, 'Failed to update user status', 500);
  }
};

/**
 * Helper function to check if a user has any active work (submissions or assignments)
 * used before deactivation.
 */
const getActiveWorkStatus = async (userId: number): Promise<{ hasActive: boolean; reason: string }> => {
  try {
    // 1. Check Book Chapter Submissions (Author)
    try {
      const activeBookChapters = await BookChapterSubmission.count({
        where: {
          submittedBy: userId,
          status: { [Op.notIn]: [BookChapterStatus.PUBLISHED, BookChapterStatus.REJECTED] }
        }
      });
      if (activeBookChapters > 0) return { hasActive: true, reason: `${activeBookChapters} active book chapter submission(s)` };
    } catch (e: any) {
      console.error('Error checking active book chapters:', e);
      throw new Error(`Book Chapter check failed: ${e.message}`);
    }

    // 2. Check Text Book Submissions (Author)
    try {
      const activeTextBooks = await TextBookSubmission.count({
        where: {
          submittedBy: userId,
          status: { [Op.notIn]: [TextBookStatus.PUBLISHED, TextBookStatus.PROPOSAL_REJECTED, TextBookStatus.SUBMISSION_REJECTED] }
        }
      });
      if (activeTextBooks > 0) return { hasActive: true, reason: `${activeTextBooks} active text book submission(s)` };
    } catch (e: any) {
      console.error('Error checking active text books:', e);
      throw new Error(`Text Book check failed: ${e.message}`);
    }

    // 3. Check Recruitment Submissions (Applicant)
    try {
      const activeRecruitments = await RecruitmentSubmission.count({
        where: {
          submittedBy: userId,
          status: RecruitmentStatus.PENDING
        }
      });
      if (activeRecruitments > 0) return { hasActive: true, reason: `${activeRecruitments} pending recruitment application(s)` };
    } catch (e: any) {
      console.error('Error checking active recruitments:', e);
      throw new Error(`Recruitment check failed: ${e.message}`);
    }

    // 4. Check Project/Internship Submissions (Applicant)
    try {
      const activeInternships = await ProjectInternshipSubmission.count({
        where: {
          submittedBy: userId,
          status: SubmissionStatus.PENDING
        }
      });
      if (activeInternships > 0) return { hasActive: true, reason: `${activeInternships} pending project/internship application(s)` };
    } catch (e: any) {
      console.error('Error checking active internships:', e);
      throw new Error(`Internship check failed: ${e.message}`);
    }

    // 5. Check Editor Assignments
    try {
      const activeEditorAssignments = await BookChapterSubmission.count({
        where: {
          assignedEditorId: userId,
          status: { [Op.notIn]: [BookChapterStatus.PUBLISHED, BookChapterStatus.REJECTED] }
        }
      });
      if (activeEditorAssignments > 0) return { hasActive: true, reason: `${activeEditorAssignments} active editor assignment(s)` };
    } catch (e: any) {
      console.error('Error checking editor assignments:', e);
      throw new Error(`Editor assignment check failed: ${e.message}`);
    }

    // 6. Check Reviewer Assignments
    try {
      // Find all chapters where user is a reviewer
      const reviewerAssignments = await ChapterReviewerAssignment.findAll({
        where: {
          reviewerId: userId,
          status: { [Op.notIn]: [ReviewerAssignmentStatus.COMPLETED, ReviewerAssignmentStatus.REJECTED] }
        },
        include: [{
          model: IndividualChapter,
          as: 'chapter',
          attributes: ['status']
        }]
      });

      const activeAssignments = reviewerAssignments.filter(assignment => {
        const chapter = (assignment as any).chapter;
        if (!chapter) return false;
        return ![ChapterStatus.CHAPTER_APPROVED, ChapterStatus.CHAPTER_REJECTED].includes(chapter.status);
      });

      if (activeAssignments.length > 0) {
        return { hasActive: true, reason: `${activeAssignments.length} active reviewer assignment(s)` };
      }
    } catch (e: any) {
      console.error('Error checking reviewer assignments:', e);
      throw new Error(`Reviewer assignment check failed: ${e.message}`);
    }

    return { hasActive: false, reason: '' };
  } catch (error: any) {
    console.error('getActiveWorkStatus helper error:', error);
    throw error;
  }
};


/**
 * Delete user by ID (Soft delete - deactivate account)
 */
export const deleteUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return sendError(res, 'Invalid user ID', 400);
    }

    const userId = Number(id);
    const requestingUser = req.authenticatedUser;

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { id: Number(id) },
          { userId: id }
        ]
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check if user is deleting their own account or has permission
    const isSelf = requestingUser?.id === user.id; // Use user.id from fetched user
    const hasDeletePermission = requestingUser?.hasPermission('user:delete');

    // Allow Editors to deactivate Reviewers
    const isEditorManagingReviewer =
      requestingUser?.role === UserRole.EDITOR &&
      user.role === UserRole.REVIEWER;

    if (!isSelf && !hasDeletePermission && !isEditorManagingReviewer) {
      return sendError(
        res,
        'You can only delete your own account or need appropriate permissions',
        403
      );
    }

    if (!user.isActive) {
      return sendError(res, 'User account is already deactivated', 400);
    }

    // Deactivation Guard: Check for active work
    const activeWork = await getActiveWorkStatus(user.id);
    if (activeWork.hasActive) {
      return sendError(
        res,
        `Cannot deactivate account: User has active ${activeWork.reason}. All submissions and assignments must be in terminal states (Published, Accepted, or Rejected) before deactivation.`,
        400
      );
    }


    // Prevent deletion of developer accounts by non-developers
    if (user.isDeveloper() && !requestingUser?.isDeveloper()) {
      return sendError(
        res,
        'Developer accounts can only be deactivated by other developers',
        403
      );
    }

    // Soft delete - deactivate account instead of deleting
    user.isActive = false;
    await user.save();

    // Send email notification if deactivated by someone else
    if (!isSelf) {
      try {
        const template = await templateService.getTemplate('ACCOUNT_DEACTIVATED', CommunicationType.EMAIL, {
          name: user.fullName
        });
        if (template) {
          await sendEmail(user.email, template.subject, template.content);
        }
      } catch (emailError) {
        console.error('Failed to send deactivation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return sendSuccess(
      res,
      { id: user.id, userId: user.userId, isActive: user.isActive },
      'Account deactivated successfully'
    );
  } catch (error: any) {
    console.error('Delete user error (deactivation failed):', error);
    // Log more details to help debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    return sendError(res, `Failed to delete user account: ${errorMessage}`, 500);
  }
};

/**
 * Permanently delete user by ID (Hard delete - use with caution)
 */
export const permanentlyDeleteUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return sendError(res, 'Invalid user ID', 400);
    }

    const userId = Number(id);
    const requestingUser = req.authenticatedUser;

    // Only allow developers and admins to permanently delete
    if (!requestingUser?.isDeveloper() && !requestingUser?.hasRole(UserRole.ADMIN)) {
      return sendError(res, 'Only developers and admins can permanently delete users', 403);
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { id: Number(id) },
          { userId: id }
        ]
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Prevent developers from deleting themselves
    if (user.id === requestingUser.id) {
      return sendError(res, 'You cannot delete your own account', 400);
    }

    // Send email notification before deletion
    try {
      await sendEmail(
        user.email,
        'Account Permanently Deleted - ResNova',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d32f2f;">Account Permanently Deleted</h2>
            <p>Dear ${user.fullName},</p>
            <p>Your account on <strong>ResNova</strong> has been <strong>permanently deleted</strong> by an administrator.</p>
            <div style="background-color: #ffebee; border: 1px solid #ffcdd2; color: #b71c1c; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <strong>Note:</strong> This action is irreversible. All your data has been removed from our system.
            </div>
            <p>If you believe this is a mistake, please contact support immediately, although data recovery may not be possible.</p>
            <p>Best regards,<br>ResNova Team</p>
          </div>
        `
      );
    } catch (emailError) {
      console.error('Failed to send deletion email:', emailError);
    }

    // Execute permanent deletion in a transaction using the model's sequelize instance
    if (!User.sequelize) {
      throw new Error('Database connection not available');
    }

    await User.sequelize.transaction(async (t) => {
      const transactionOptions = { transaction: t };

      // 1. Delete Notifications
      await Notification.destroy({
        where: { [Op.or]: [{ recipientId: user.id }, { senderId: user.id }] },
        ...transactionOptions
      });

      // 2. Clear Token Blacklist (if any references exist)
      await TokenBlacklist.destroy({
        where: { [Op.or]: [{ token: user.email }, { token: { [Op.like]: `%${user.email}%` } }] },
        ...transactionOptions
      });

      // 3. Handle Discussions & Status History (Independent of submission ownership)
      // Delete all comments/discussions by this user across all submission types
      await BookChapterDiscussion.destroy({ where: { userId: user.id }, ...transactionOptions });
      await TextBookDiscussion.destroy({ where: { senderId: user.id }, ...transactionOptions });
      await ChapterDiscussion.destroy({ where: { userId: user.id }, ...transactionOptions });

      // Delete status history entries by this user
      await BookChapterStatusHistory.destroy({ where: { changedBy: user.id }, ...transactionOptions });
      await ChapterStatusHistory.destroy({ where: { changedBy: user.id }, ...transactionOptions });
      await TextBookStatusHistory.destroy({ where: { changedBy: user.id }, ...transactionOptions });

      // 4. Handle Book Chapter Submissions (Owner cleanup)
      const bookSubmissions = await BookChapterSubmission.findAll({
        where: { submittedBy: user.id },
        ...transactionOptions
      });

      for (const sub of bookSubmissions) {
        // Delete related chapters, files, history
        await IndividualChapter.destroy({ where: { submissionId: sub.id }, ...transactionOptions });
        await BookChapterFile.destroy({ where: { submissionId: sub.id }, ...transactionOptions });
        await BookChapterStatusHistory.destroy({ where: { submissionId: sub.id }, ...transactionOptions });
        await BookChapterDiscussion.destroy({ where: { submissionId: sub.id }, ...transactionOptions });
        await sub.destroy(transactionOptions);
      }

      // Nullify references where user was NOT owner
      await BookChapterSubmission.update(
        { assignedEditorId: null, lastUpdatedBy: null },
        {
          where: { [Op.or]: [{ assignedEditorId: user.id }, { lastUpdatedBy: user.id }] },
          ...transactionOptions
        }
      );

      // 5. Handle Text Book Submissions (Owner cleanup)
      const textBookSubmissions = await TextBookSubmission.findAll({
        where: { submittedBy: user.id },
        ...transactionOptions
      });

      for (const sub of textBookSubmissions) {
        await TextBookFile.destroy({ where: { submissionId: sub.id }, ...transactionOptions });
        await TextBookRevision.destroy({ where: { submissionId: sub.id }, ...transactionOptions });
        await TextBookStatusHistory.destroy({ where: { submissionId: sub.id }, ...transactionOptions });
        await TextBookDiscussion.destroy({ where: { submissionId: sub.id }, ...transactionOptions });
        await sub.destroy(transactionOptions);
      }

      await TextBookSubmission.update(
        { lastUpdatedBy: null },
        { where: { lastUpdatedBy: user.id }, ...transactionOptions }
      );

      // 6. Handle Files uploaded by user (outside their own submissions)
      await BookChapterFile.destroy({ where: { uploadedBy: user.id }, ...transactionOptions });
      await TextBookFile.destroy({ where: { uploadedBy: user.id }, ...transactionOptions });

      // 7. Handle Other Submissions
      await ProjectInternshipSubmission.destroy({ where: { submittedBy: user.id }, ...transactionOptions });
      await RecruitmentSubmission.destroy({ where: { submittedBy: user.id }, ...transactionOptions });

      // 8. Handle Assignments & Roles
      await ChapterReviewerAssignment.destroy({
        where: { [Op.or]: [{ reviewerId: user.id }, { assignedBy: user.id }] },
        ...transactionOptions
      });

      await BookChapterReviewerAssignment.destroy({
        where: { [Op.or]: [{ reviewerId: user.id }, { assignedBy: user.id }] },
        ...transactionOptions
      });

      await BookEditor.destroy({
        where: { [Op.or]: [{ editorId: user.id }, { assignedBy: user.id }] },
        ...transactionOptions
      });

      // 9. Handle Chapters & Titles
      // Note: ChapterReviewerAssignment already handles assignments where user was reviewer or assigner.
      // IndividualChapter doesn't have a direct 'assignedBy' field based on model definition.

      // Delete book titles created by this user if they don't have other dependencies
      // For safety, we'll try to delete them. If they have chapters, it might fail, 
      // but we handled most chapter stuff above.
      await BookTitle.destroy({ where: { createdBy: user.id }, ...transactionOptions });

      // 10. Finally delete the user
      await user.destroy(transactionOptions);
    });

    return sendSuccess(res, null, 'User and all associated data permanently deleted');
  } catch (error: any) {
    console.error('Delete user permanent error:', error);
    // Log detailed error for debugging
    const errorMessage = error.name === 'SequelizeForeignKeyConstraintError'
      ? `Database constraint violation on table: ${error.table}`
      : error.message;
    return sendError(res, `Failed to permanently delete user: ${errorMessage}`, 500);
  }
};

/**
 * Impersonate a user (Admin/Developer only)
 * Generates a login token for the target user without password
 */
export const impersonateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = req.authenticatedUser;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return sendError(res, 'Invalid user ID', 400);
    }

    const targetUserId = Number(id);

    // Security Check: Admins, Developers, and Editors can impersonate
    if (!requestingUser?.hasRole(UserRole.ADMIN) &&
      !requestingUser?.hasRole(UserRole.DEVELOPER) &&
      !requestingUser?.hasRole(UserRole.EDITOR)) {
      return sendError(res, 'Unauthorized to impersonate users', 403);
    }

    // Find target user
    const targetUser = await User.findByPk(targetUserId);

    if (!targetUser) {
      return sendError(res, 'User not found', 404);
    }

    // Prevent impersonating a Developer (unless you are a Developer)
    if (targetUser.isDeveloper() && !requestingUser.isDeveloper()) {
      return sendError(res, 'Cannot impersonate a Developer account', 403);
    }

    // For Editors: only allow impersonating Reviewers
    if (requestingUser.role === UserRole.EDITOR &&
      targetUser.role !== UserRole.REVIEWER) {
      return sendError(res, 'Editors can only impersonate Reviewer accounts', 403);
    }

    // Prevent impersonating yourself (reduntant but safe)
    if (targetUser.id === requestingUser.id) {
      return sendError(res, 'You are already logged in as yourself', 400);
    }

    // Generate JWT token for the target user
    // We import generateToken from ../utils/jwt. It is NOT exported from authController.
    // Ensure you have: import { generateToken } from '../utils/jwt'; at the top
    const token = generateToken({
      userId: targetUser.id,
      email: targetUser.email,
      isVerified: targetUser.emailVerified,
    });

    const userData = {
      id: targetUser.id,
      userId: targetUser.userId,
      fullName: targetUser.fullName,
      username: targetUser.username,
      email: targetUser.email,
      emailVerified: targetUser.emailVerified,
      role: targetUser.role,
      // Removed profilePicture to avoid 414 Request-URI Too Large errors on redirect
    };



    return sendSuccess(
      res,
      { user: userData, token },
      `Successfully logged in as ${targetUser.fullName}`
    );

  } catch (error) {
    console.error('Impersonate user error:', error);
    return sendError(res, 'Failed to impersonate user', 500);
  }
};


/**
 * Reactivate user account
 */
export const reactivateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return sendError(res, 'Invalid user ID', 400);
    }

    const userId = Number(id);
    const requestingUser = req.authenticatedUser;

    // Check if user is reactivating their own account or has permission
    const isSelf = requestingUser?.id === userId;
    const hasUpdatePermission = requestingUser?.hasPermission('user:update');

    // We need to fetch user FIRST to check role for Editor permission
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { id: Number(id) },
          { userId: id }
        ]
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Allow Editors to reactivate Reviewers
    const isEditorManagingReviewer =
      requestingUser?.role === UserRole.EDITOR &&
      user.role === UserRole.REVIEWER;


    if (!isSelf && !hasUpdatePermission && !isEditorManagingReviewer) {
      return sendError(
        res,
        'You can only reactivate your own account or need appropriate permissions',
        403
      );
    }

    if (user.isActive) {
      return sendError(res, 'User account is already active', 400);
    }

    user.isActive = true;
    await user.save();

    // Send email notification if reactivated by someone else
    if (!isSelf) {
      try {
        const template = await templateService.getTemplate('ACCOUNT_REACTIVATED', CommunicationType.EMAIL, {
          name: user.fullName,
          loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
        });
        if (template) {
          await sendEmail(user.email, template.subject, template.content);
        }
      } catch (emailError) {
        console.error('Failed to send reactivation email:', emailError);
      }
    }

    return sendSuccess(
      res,
      { id: user.id, userId: user.userId, isActive: user.isActive },
      'Account reactivated successfully'
    );
  } catch (error) {
    console.error('Reactivate user error:', error);
    return sendError(res, 'Failed to reactivate account', 500);
  }
};

/**
 * Get user permissions
 */
export const getUserPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return sendError(res, 'Invalid user ID', 400);
    }

    const userId = Number(id);
    const requestingUser = req.authenticatedUser;

    // Check if user is viewing their own permissions or has permission
    if (
      requestingUser?.id !== userId &&
      !requestingUser?.hasPermission('user:read')
    ) {
      return sendError(
        res,
        'You can only view your own permissions or need appropriate permissions',
        403
      );
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { id: Number(id) },
          { userId: id }
        ]
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const permissions = user.getPermissions();

    return sendSuccess(
      res,
      {
        userId: user.userId,
        role: user.role,
        permissions,
      },
      'User permissions retrieved successfully'
    );
  } catch (error) {
    console.error('Get user permissions error:', error);
    return sendError(res, 'Failed to retrieve user permissions', 500);
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.authenticatedUser) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Use the authenticated user instance directly (no extra query needed)
    const user = req.authenticatedUser;

    // Format response data
    const userData = {
      id: user.id,
      userId: user.userId,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      profilePicture: user.profilePicture,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      nationality: user.nationality,
      dateOfBirth: user.dateOfBirth,
      streetAddress: user.streetAddress,
      city: user.city,
      state: user.state,
      country: user.country,
      zipCode: user.zipCode,
      bio: user.bio,
      designation: user.designation,
      organization: user.organization,
      department: user.department,
      orcidId: user.orcidId,
      experienceYears: user.experienceYears,
      qualification: user.qualification,
      specialization: user.specialization,
      researchInterests: user.researchInterests,
      linkedinProfile: user.linkedinProfile,
      twitterProfile: user.twitterProfile,
      website: user.website,
      scopusLink: user.scopusLink,
      lastLogin: user.lastLogin,
      googleId: user.googleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      permissions: user.getPermissions(),
    };

    return sendSuccess(res, userData, 'Current user retrieved successfully');
  } catch (error) {
    console.error('Get current user error:', error);
    return sendError(res, 'Failed to retrieve current user', 500);
  }
};

/**
 * Get Reviewer Statistics (Editor only)
 */
export const getReviewerStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = req.authenticatedUser;

    // Permission check
    if (!requestingUser?.hasPermission('submission:assign-reviewer')) { // Using a safe permission or role check
      return sendError(res, 'Unauthorized to view reviewer stats', 403);
    }

    const reviewerId = Number(id);
    const reviewer = await User.findByPk(reviewerId);
    if (!reviewer) {
      return sendError(res, 'Reviewer not found', 404);
    }

    // Fetch assignments from both models
    const BookChapterReviewerAssignment = require('../models/bookChapterReviewerAssignment').default;
    const ChapterReviewerAssignment = require('../models/chapterReviewerAssignment').default;

    const [bookChapterAssignments, chapterAssignments] = await Promise.all([
      BookChapterReviewerAssignment.findAll({ where: { reviewerId } }),
      ChapterReviewerAssignment.findAll({ where: { reviewerId } })
    ]);

    // Normalize and combine assignments
    const assignments = [
      ...bookChapterAssignments.map((a: any) => ({
        ...a.toJSON(),
        source: 'book_chapter',
        normalizedStatus: a.status,
        completionDate: a.completedDate // Normalize field name
      })),
      ...chapterAssignments.map((a: any) => ({
        ...a.toJSON(),
        source: 'chapter',
        normalizedStatus: a.status === 'REJECTED' ? 'DECLINED' : a.status, // Normalize status
        completionDate: a.completionDate
      }))
    ];

    const totalAssigned = assignments.length;
    const completed = assignments.filter((a: any) => a.normalizedStatus === 'COMPLETED').length;
    const pending = assignments.filter((a: any) => ['PENDING', 'IN_PROGRESS', 'ACCEPTED'].includes(a.normalizedStatus)).length;

    // Calculate stats
    let totalDays = 0;
    let completedCountForAvg = 0;
    let lateSubmissions = 0;
    let acceptedAssignments = 0;
    let declinedAssignments = 0;

    assignments.forEach((a: any) => {
      // Avg Completion Time
      if (a.completionDate && a.assignedDate) {
        const days = (new Date(a.completionDate).getTime() - new Date(a.assignedDate).getTime()) / (1000 * 3600 * 24);
        totalDays += days;
        completedCountForAvg++;
      }

      // Late Submissions
      if (a.deadline) {
        const deadlineDate = new Date(a.deadline);
        if (a.completionDate) {
          if (new Date(a.completionDate) > deadlineDate) lateSubmissions++;
        } else if (['PENDING', 'IN_PROGRESS', 'ACCEPTED'].includes(a.normalizedStatus)) {
          if (new Date() > deadlineDate) lateSubmissions++;
        }
      }

      // Acceptance Rate
      if (['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(a.normalizedStatus)) acceptedAssignments++;
      if (a.normalizedStatus === 'DECLINED' || a.normalizedStatus === 'REJECTED' || a.normalizedStatus === 'EXPIRED') declinedAssignments++;
    });

    const avgCompletionDays = completedCountForAvg > 0 ? Math.round(totalDays / completedCountForAvg) : 0;
    const acceptanceRate = (acceptedAssignments + declinedAssignments) > 0
      ? Math.round((acceptedAssignments / (acceptedAssignments + declinedAssignments)) * 100)
      : 0;

    return sendSuccess(res, {
      totalAssigned,
      completed,
      pending,
      avgCompletionDays,
      lateSubmissions,
      acceptanceRate,
      bookChaptersAssigned: bookChapterAssignments.length,
      individualChaptersAssigned: chapterAssignments.length,
    }, 'Reviewer stats retrieved successfully');

  } catch (error) {
    console.error('Get reviewer stats error:', error);
    return sendError(res, 'Failed to retrieve reviewer stats', 500);
  }
};

/**
 * Email Reviewer (Editor only)
 */
export const emailReviewer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { subject, message } = req.body;
    const requestingUser = req.authenticatedUser;

    if (!requestingUser?.hasPermission('user:update')) { // Using a safe permission or role check
      // Ideally specific permission, defaulting to role check logic inside permission
    }
    // Double check role if permission is generic
    if (requestingUser?.role !== UserRole.EDITOR && requestingUser?.role !== UserRole.ADMIN) {
      return sendError(res, 'Unauthorized to email reviewers', 403);
    }

    const reviewer = await User.findByPk(id);
    if (!reviewer) {
      return sendError(res, 'Reviewer not found', 404);
    }

    if (!subject || !message) {
      return sendError(res, 'Subject and message are required', 400);
    }

    // Construct HTML email with sender details
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${reviewer.fullName},</h2>
        <p>You have received a new message from <strong>${requestingUser.fullName}</strong> (<a href="mailto:${requestingUser.email}">${requestingUser.email}</a>):</p>
        
        <div style="background: #f9f9f9; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${subject}</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This is an automated notification from the Book Submission System.
        </p>
      </div>
    `;

    // Send email
    await sendEmail(reviewer.email, `Message from Editor: ${subject}`, html);

    // Notify Reviewer (Recipient)
    const notificationService = require('../services/notificationService').default;
    const { NotificationType, NotificationCategory } = require('../models/notification');

    await notificationService.createNotification({
      recipientId: reviewer.id,
      senderId: requestingUser.id,
      type: NotificationType.INFO,
      category: NotificationCategory.SYSTEM,
      title: `Message from Editor: ${requestingUser.fullName}`,
      message: `Subject: ${subject}`,
      relatedEntityId: requestingUser.id,
      relatedEntityType: 'User'
    });

    // Notify Editor (Sender) - Confirmation log
    await notificationService.createNotification({
      recipientId: requestingUser?.id,
      senderId: requestingUser?.id, // Self-notification
      type: NotificationType.INFO,
      category: NotificationCategory.SYSTEM,
      title: 'Email Sent to Reviewer',
      message: `You sent an email to ${reviewer.fullName} with subject: "${subject}"`,
      relatedEntityId: reviewer.id,
      relatedEntityType: 'User'
    });

    return sendSuccess(res, null, 'Email sent successfully');

  } catch (error) {
    console.error('Email reviewer error:', error);
    return sendError(res, 'Failed to send email', 500);
  }
};

/**
 * Update profile picture (Base64 conversion)
 */
export const updateProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    const requestingUser = req.authenticatedUser;
    if (!requestingUser) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!req.file) {
      return sendError(res, 'No image file provided', 400);
    }

    const user = await User.findByPk(requestingUser.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Convert uploaded file to base64
    const coverImageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    await user.update({ profilePicture: coverImageBase64 });

    return sendSuccess(res, { profilePicture: coverImageBase64 }, 'Profile picture updated successfully');
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return sendError(res, 'Failed to update profile picture', 500);
  }
};
