import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';

// Enum for user roles
export enum UserRole {
  USER = 'user',
  AUTHOR = 'author',
  STUDENT = 'student',
  ADMIN = 'admin',
  EDITOR = 'editor',
  REVIEWER = 'reviewer',
  DEVELOPER = 'developer',
}

// Role hierarchy for permission inheritance
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.DEVELOPER]: 100,
  [UserRole.ADMIN]: 80,
  [UserRole.EDITOR]: 60,
  [UserRole.REVIEWER]: 40,
  [UserRole.AUTHOR]: 20,
  [UserRole.STUDENT]: 10,
  [UserRole.USER]: 5,
};

// Permissions by role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.DEVELOPER]: [
    // Developer-specific capabilities
    'system:view-logs',
    'system:view-metrics',
    'debug:enable',
    'analytics:view-api-usage',
    'bulk:import-users',
    'database:view-schema',
    // Full wildcard access for every permission namespace
    'admin:all',
    'user:all',
    'submission:all',
    'discussion:all',
    'assignment:all',
    'revision:all',
    'file:all',
    'status-history:all',
    'profile:all',
    'settings:all',
    'reports:all',
    'notification:all',
  ],

  [UserRole.ADMIN]: [
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'user:assign-roles',
    'user:view-all',
    'submission:view-assigned',
    'submission:view-all',
    'submission:update-status',
    'submission:delete',
    'submission:accept',
    'submission:reject',
    'submission:assign-reviewer',
    'discussion:create',
    'discussion:read',
    'settings:read',
    'settings:update',
    'reports:generate',
    'reports:export',
  ],

  [UserRole.EDITOR]: [
    'submission:view-assigned',
    'submission:view-all',
    'submission:accept',
    'submission:reject',
    'submission:assign-reviewer',
    'assignment:accept',
    'assignment:decline',
    'discussion:create',
    'discussion:read',
    'status-history:view',
  ],

  [UserRole.REVIEWER]: [
    'submission:view-assigned',
    'submission:review',
    'revision:create',
    'revision:view',
    'assignment:accept',
    'assignment:decline',
    'discussion:create',
    'discussion:read',
    'file:view-assigned',
  ],

  [UserRole.AUTHOR]: [
    'submission:create',
    'submission:view-own',
    'submission:update-own',
    'file:upload',
    'file:view-own',
    'file:delete-own',
    'revision:view-own',
    'revision:respond',
    'discussion:create-on-own',
    'discussion:read-own',
    'notification:view-own',
    'notification:mark-read',
  ],

  [UserRole.STUDENT]: [
    'submission:create',
    'submission:view-own',
    'file:upload',
    'file:view-own',
    'notification:view-own',
    'profile:view-own',
    'profile:update-own',
  ],

  [UserRole.USER]: [
    'profile:view-own',
    'profile:update-own',
    'notification:view-own',
  ],
};

interface UserAttributes {
  id: number;
  userId: string; // Auto-generated unique ID (6-8 digits based on timestamp)
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  emailVerified: boolean;
  emailOtp: string | null;
  emailOtpExpiry: Date | null;
  otpAttempts: number;
  isActive: boolean;
  lastLogin: Date | null;
  resetPasswordToken: string | null;
  resetPasswordExpiry: Date | null;
  googleId: string | null;
  profilePicture: string | null;
  // Detailed Profile Fields
  phoneNumber: string | null;
  gender: string | null;
  nationality: string | null;
  dateOfBirth: Date | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  bio: string | null;
  designation: string | null;
  organization: string | null;
  department: string | null;
  orcidId: string | null;
  experienceYears: number | null;
  qualification: string | null;
  specialization: string | null;
  researchInterests: string[] | null;
  linkedinProfile: string | null;
  twitterProfile: string | null;
  website: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<
  UserAttributes,
  | 'id'
  | 'userId'
  | 'role'
  | 'emailVerified'
  | 'emailOtp'
  | 'emailOtpExpiry'
  | 'otpAttempts'
  | 'isActive'
  | 'lastLogin'
  | 'resetPasswordToken'
  | 'resetPasswordExpiry'
  | 'googleId'
  | 'profilePicture'
  | 'phoneNumber'
  | 'gender'
  | 'nationality'
  | 'dateOfBirth'
  | 'streetAddress'
  | 'city'
  | 'state'
  | 'country'
  | 'zipCode'
  | 'bio'
  | 'designation'
  | 'organization'
  | 'department'
  | 'orcidId'
  | 'experienceYears'
  | 'qualification'
  | 'specialization'
  | 'researchInterests'
  | 'linkedinProfile'
  | 'twitterProfile'
  | 'website'
> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public userId!: string;
  public username!: string;
  public fullName!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public emailVerified!: boolean;
  public emailOtp!: string | null;
  public emailOtpExpiry!: Date | null;
  public otpAttempts!: number;
  public isActive!: boolean;
  public lastLogin!: Date | null;
  public resetPasswordToken!: string | null;
  public resetPasswordExpiry!: Date | null;
  public googleId!: string | null;
  public profilePicture!: string | null;
  // Detailed Profile Fields
  public phoneNumber!: string | null;
  public gender!: string | null;
  public nationality!: string | null;
  public dateOfBirth!: Date | null;
  public streetAddress!: string | null;
  public city!: string | null;
  public state!: string | null;
  public country!: string | null;
  public zipCode!: string | null;
  public bio!: string | null;
  public designation!: string | null;
  public organization!: string | null;
  public department!: string | null;
  public orcidId!: string | null;
  public experienceYears!: number | null;
  public qualification!: string | null;
  public specialization!: string | null;
  public researchInterests!: string[] | null;
  public linkedinProfile!: string | null;
  public twitterProfile!: string | null;
  public website!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance method to check password
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Instance method to generate OTP
  public generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  }

  // Instance method to check if user has permission
  public hasPermission(permission: string): boolean {
    const rolePermissions = ROLE_PERMISSIONS[this.role] || [];

    // Check for wildcard permissions (e.g., 'admin:all')
    const hasWildcard = rolePermissions.some(perm => {
      if (perm.endsWith(':all')) {
        const prefix = perm.split(':')[0];
        return permission.startsWith(prefix + ':');
      }
      return false;
    });

    return rolePermissions.includes(permission) || hasWildcard;
  }

  // Instance method to check if user has any of the permissions
  public hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Instance method to check if user has all permissions
  public hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Instance method to get all permissions for the user
  public getPermissions(): string[] {
    return ROLE_PERMISSIONS[this.role] || [];
  }

  // Instance method to check if user has role
  public hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  // Instance method to check if user has any of the roles
  public hasAnyRole(roles: UserRole[]): boolean {
    return roles.includes(this.role);
  }

  // Instance method to check if user's role is higher than or equal to given role
  public hasRoleLevel(role: UserRole): boolean {
    return ROLE_HIERARCHY[this.role] >= ROLE_HIERARCHY[role];
  }

  // Instance method to check if user is admin or developer
  public isAdminOrDeveloper(): boolean {
    return this.hasAnyRole([UserRole.ADMIN, UserRole.DEVELOPER]);
  }

  // Instance method to check if user is developer
  public isDeveloper(): boolean {
    return this.role === UserRole.DEVELOPER;
  }

  // Instance method to check if user can manage other user
  public canManageUser(targetUser: User): boolean {
    // Users can't manage themselves through this check
    if (this.id === targetUser.id) return false;

    // Developers can manage anyone
    if (this.isDeveloper()) return true;

    // Admins can manage everyone except developers
    if (this.hasRole(UserRole.ADMIN)) {
      return !targetUser.isDeveloper();
    }

    return false;
  }

  // Static method to generate unique userId based on timestamp
  public static generateUserId(): string {
    const timestamp = Date.now(); // Get current timestamp in milliseconds
    const random = Math.floor(Math.random() * 1000); // Add random component

    // Combine timestamp and random to create 6-8 digit userId
    const userId = `${timestamp}${random}`.slice(-8); // Take last 8 digits

    return userId;
  }

  // Static method to initialize the model
  static initialize(sequelize: any) {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.STRING(8),
          allowNull: true, // Allow null temporarily, will be set in beforeValidate hook
          unique: {
            name: 'unique_user_id',
            msg: 'User ID already exists',
          },
        },
        username: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: {
            name: 'unique_username',
            msg: 'Username already taken',
          },
          validate: {
            notEmpty: { msg: 'Username is required' },
            len: {
              args: [3, 50],
              msg: 'Username must be between 3 and 50 characters',
            },
            is: {
              args: /^[a-zA-Z0-9_]+$/,
              msg: 'Username can only contain letters, numbers, and underscores',
            },
          },
        },
        fullName: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Full name is required' },
            len: {
              args: [2, 100],
              msg: 'Full name must be between 2 and 100 characters',
            },
          },
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: {
            name: 'unique_email',
            msg: 'Email address already registered',
          },
          validate: {
            isEmail: { msg: 'Please provide a valid email address' },
            notEmpty: { msg: 'Email is required' },
          },
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Password is required' },
            // Password validation is done in the controller before hashing
            // We don't validate here because the hashed password won't match the regex
          },
        },
        role: {
          type: DataTypes.ENUM(...Object.values(UserRole)),
          defaultValue: UserRole.USER,
          allowNull: false,
          validate: {
            isIn: {
              args: [Object.values(UserRole)],
              msg: 'Invalid role',
            },
          },
        },
        emailVerified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        emailOtp: {
          type: DataTypes.STRING(8),
          allowNull: true,
        },
        emailOtpExpiry: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        otpAttempts: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        lastLogin: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        resetPasswordToken: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        resetPasswordExpiry: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        googleId: {
          type: DataTypes.STRING(255),
          allowNull: true,
          unique: {
            name: 'unique_google_id',
            msg: 'Google account already linked',
          },
        },
        profilePicture: {
          type: DataTypes.TEXT('long'),
          allowNull: true,
        },
        phoneNumber: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        gender: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        nationality: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        dateOfBirth: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        streetAddress: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        city: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        state: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        country: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        zipCode: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        bio: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        designation: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        organization: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        department: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        orcidId: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        experienceYears: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        qualification: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        specialization: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        researchInterests: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        linkedinProfile: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        twitterProfile: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        website: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'users',
        timestamps: true,
        hooks: {
          beforeValidate: async (user: User) => {
            // Generate unique userId if not provided (happens before validation)
            if (!user.userId) {
              user.userId = User.generateUserId();
            }
          },
          beforeCreate: async (user: User) => {
            // Hash password
            if (user.password) {
              const salt = await bcrypt.genSalt(10);
              user.password = await bcrypt.hash(user.password, salt);
            }

            // Normalize email and username
            user.email = user.email.toLowerCase().trim();
            user.username = user.username.toLowerCase().trim();
          },
          beforeUpdate: async (user: User) => {
            // Hash password if changed
            if (user.changed('password')) {
              const salt = await bcrypt.genSalt(10);
              user.password = await bcrypt.hash(user.password, salt);
            }

            // Normalize email and username if changed
            if (user.changed('email')) {
              user.email = user.email.toLowerCase().trim();
            }
            if (user.changed('username')) {
              user.username = user.username.toLowerCase().trim();
            }
          },
        },
      }
    );

    return User;
  }
}

export default User;
