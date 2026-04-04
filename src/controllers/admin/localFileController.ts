import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendError } from '../../utils/responseHandler';
import LocalFile from '../../models/localFile';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const LOCAL_UPLOAD_DIR = path.resolve('uploads/local_files');

/**
 * Controller for managing locally saved files (Admin/Super Admin only)
 * These files are stored on disk and tracked in the database metadata.
 */
export const uploadLocalFile = async (req: AuthRequest, res: Response) => {
    try {
        const { submissionId, expiresAt, extraMetadata } = req.body;
        const file = req.file;

        if (!file) {
            return sendError(res, 'No file uploaded', 400);
        }

        const user = req.authenticatedUser;
        if (!user) return sendError(res, 'Unauthorized', 401);

        // Ensure directory exists
        if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
            fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
        }

        const fileExt = path.extname(file.originalname);
        const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExt}`;
        const filePath = path.join(LOCAL_UPLOAD_DIR, fileName);

        // Save to disk
        fs.writeFileSync(filePath, file.buffer);

        // Create database record
        const localFile = await LocalFile.create({
            submissionId: submissionId ? parseInt(submissionId) : null,
            fileName: fileName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            extraMetadata: extraMetadata ? (typeof extraMetadata === 'string' ? JSON.parse(extraMetadata) : extraMetadata) : null,
            filePath: `/uploads/local_files/${fileName}`,
            uploadedBy: user.id
        });

        return sendSuccess(res, localFile, 'File uploaded and saved locally successfully');
    } catch (error: any) {
        console.error('Error in uploadLocalFile:', error);
        return sendError(res, error.message || 'Failed to upload local file', 500);
    }
};

export const listAllLocalFiles = async (req: AuthRequest, res: Response) => {
    try {
        const { submissionId } = req.query;
        const where: any = {};
        if (submissionId) where.submissionId = parseInt(submissionId as string);

        const files = await LocalFile.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });
        return sendSuccess(res, files, 'Local files retrieved successfully');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

export const getLocalFile = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const localFile = await LocalFile.findByPk(id);
        if (!localFile) return sendError(res, 'File not found', 404);

        return sendSuccess(res, localFile, 'File metadata retrieved');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

/**
 * Update a local file (metadata or content)
 */
export const updateLocalFile = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { expiresAt, extraMetadata } = req.body;
        const file = req.file;

        const localFile = await LocalFile.findByPk(id);
        if (!localFile) return sendError(res, 'File not found', 404);

        if (file) {
            // Remove old file from disk
            const oldPath = path.join(process.cwd(), localFile.filePath.startsWith('/') ? localFile.filePath.substring(1) : localFile.filePath);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

            const fileExt = path.extname(file.originalname);
            const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExt}`;
            const filePath = path.join(LOCAL_UPLOAD_DIR, fileName);

            fs.writeFileSync(filePath, file.buffer);

            localFile.fileName = fileName;
            localFile.originalName = file.originalname;
            localFile.mimeType = file.mimetype;
            localFile.fileSize = file.size;
            localFile.filePath = `/uploads/local_files/${fileName}`;
        }

        if (expiresAt !== undefined) localFile.expiresAt = expiresAt ? new Date(expiresAt) : null;
        if (extraMetadata !== undefined) {
            localFile.extraMetadata = typeof extraMetadata === 'string' ? JSON.parse(extraMetadata) : extraMetadata;
        }

        await localFile.save();
        return sendSuccess(res, localFile, 'Local file updated successfully');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

/**
 * Delete a local file by its ID
 */
export const deleteLocalFile = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const localFile = await LocalFile.findByPk(id);
        if (!localFile) return sendError(res, 'File not found', 404);

        const filePath = path.join(process.cwd(), localFile.filePath.startsWith('/') ? localFile.filePath.substring(1) : localFile.filePath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await localFile.destroy();
        return sendSuccess(res, null, 'Local file deleted successfully from disk and database');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};

/**
 * Delete a local file based on submission ID and original filename
 */
export const deleteLocalFileByDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { submissionId, fileName } = req.params;
        const localFile = await LocalFile.findOne({
            where: {
                submissionId: parseInt(submissionId),
                originalName: fileName
            }
        });

        if (!localFile) return sendError(res, 'No such file found for this submission', 404);

        const filePath = path.join(process.cwd(), localFile.filePath.startsWith('/') ? localFile.filePath.substring(1) : localFile.filePath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await localFile.destroy();
        return sendSuccess(res, null, 'File matching submission details deleted from disk');
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
};
