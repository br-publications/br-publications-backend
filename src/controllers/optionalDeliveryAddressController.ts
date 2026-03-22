import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import OptionalDeliveryAddress from '../models/optionalDeliveryAddress';
import TextBookSubmission from '../models/textBookSubmission';
import BookChapterSubmission from '../models/bookChapterSubmission';
import { sendSuccess, sendError } from '../utils/responseHandler';

/**
 * @route POST /api/optional-delivery-address
 * @desc Save optional delivery address for a textbook or book chapter submission
 * @access Private (Author)
 */
export const saveOptionalDeliveryAddress = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const {
            submissionId,
            submissionType, // 'textbook' or 'chapter'
            fullName,
            companyName,
            contactPersonName,
            countryCode,
            mobileNumber,
            altCountryCode,
            altMobileNumber,
            email,
            addressLine1,
            buildingName,
            streetName,
            area,
            landmark,
            city,
            state,
            postalCode,
            country,
            isResidential, // string from frontend: 'residential' | 'commercial'
            deliveryInstructions
        } = req.body;

        if (!submissionId || !submissionType) {
            return sendError(res, 'Submission ID and type are required', 400);
        }

        if (submissionType !== 'textbook' && submissionType !== 'chapter') {
            return sendError(res, 'Invalid submission type. Must be textbook or chapter', 400);
        }

        // Map isResidential string to boolean
        const isResidentialBool = isResidential === 'residential';

        // Authorization check
        if (submissionType === 'textbook') {
            const submission = await TextBookSubmission.findByPk(submissionId);
            if (!submission) return sendError(res, 'Textbook submission not found', 404);
            
            const correspondingAuthor = submission.getCorrespondingAuthor();
            const isCorresponding = correspondingAuthor && correspondingAuthor.email === user.email;
            if (submission.submittedBy !== user.id && !isCorresponding) {
                return sendError(res, 'Unauthorized', 403);
            }
        } else if (submissionType === 'chapter') {
            const submission = await BookChapterSubmission.findByPk(submissionId);
            if (!submission) return sendError(res, 'Book chapter submission not found', 404);
            
            const correspondingAuthor = submission.getCorrespondingAuthor();
            const isCorresponding = correspondingAuthor && correspondingAuthor.email === user.email;
            if (submission.submittedBy !== user.id && !isCorresponding) {
                return sendError(res, 'Unauthorized', 403);
            }
        }

        const addressData = {
            fullName,
            companyName,
            contactPersonName,
            countryCode,
            mobileNumber,
            altCountryCode: altCountryCode || null,
            altMobileNumber: altMobileNumber || null,
            email,
            addressLine1,
            buildingName,
            streetName,
            area,
            landmark,
            city,
            state,
            postalCode,
            country,
            isResidential: isResidentialBool,
            deliveryInstructions
        };

        // Check if optional address already exists
        let optionalAddress = await OptionalDeliveryAddress.findOne({
            where: {
                [submissionType === 'textbook' ? 'textBookSubmissionId' : 'bookChapterSubmissionId']: submissionId
            }
        });

        if (optionalAddress) {
            // Update existing optional address
            await optionalAddress.update(addressData);
            return sendSuccess(res, optionalAddress, 'Optional delivery address updated successfully');
        }

        // Create new optional address
        optionalAddress = await OptionalDeliveryAddress.create({
            ...addressData,
            textBookSubmissionId: submissionType === 'textbook' ? submissionId : null,
            bookChapterSubmissionId: submissionType === 'chapter' ? submissionId : null,
        });

        return sendSuccess(res, optionalAddress, 'Optional delivery address saved successfully', 201);
    } catch (error: any) {
        console.error('❌ Save optional delivery address error:', error);
        return sendError(res, 'Failed to save optional delivery address: ' + (error.message || 'Unknown error'), 500);
    }
};

/**
 * @route GET /api/optional-delivery-address/:type/:id
 * @desc Get optional delivery address for a submission
 * @access Private
 */
export const getOptionalDeliveryAddress = async (req: AuthRequest, res: Response) => {
    try {
        const { type, id } = req.params;
        
        if (type !== 'textbook' && type !== 'chapter') {
            return sendError(res, 'Invalid submission type', 400);
        }

        const optionalAddress = await OptionalDeliveryAddress.findOne({
            where: {
                [type === 'textbook' ? 'textBookSubmissionId' : 'bookChapterSubmissionId']: id
            }
        });

        if (!optionalAddress) {
            return sendError(res, 'Optional delivery address not found', 404);
        }

        return sendSuccess(res, optionalAddress);
    } catch (error: any) {
        console.error('❌ Get optional delivery address error:', error);
        return sendError(res, 'Failed to fetch optional delivery address', 500);
    }
};
