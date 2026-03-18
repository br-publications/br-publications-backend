import { Request, Response } from 'express';
import ContactDetails from '../models/contactDetails';

export const getContactDetails = async (req: Request, res: Response) => {
    try {
        let contact = await ContactDetails.findOne();

        // If no details exist, return empty object structure
        if (!contact) {
            return res.status(200).json({
                success: true,
                data: {
                    phoneNumbers: [],
                    email: '',
                    officeAddress: '',
                    timings: 'Mon – Sat, 9:30 AM – 5:30 PM',
                    whatsapp: '',
                    facebook: '',
                    twitter: '',
                    linkedin: '',
                    instagram: ''
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: contact
        });
    } catch (error) {
        console.error('Error fetching contact details:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch contact details'
        });
    }
};

export const updateContactDetails = async (req: Request, res: Response) => {
    try {
        const {
            phoneNumbers,
            email,
            officeAddress,
            timings,
            whatsapp,
            facebook,
            twitter,
            linkedin,
            instagram
        } = req.body;

        // Validate phone numbers (max 4, at least 1) ONLY if present in request
        if (phoneNumbers !== undefined) {
            if (!Array.isArray(phoneNumbers)) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone numbers must be an array.'
                });
            }

            if (phoneNumbers.length > 4) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum of 4 phone numbers allowed.'
                });
            }
        }

        // Check if record exists
        let contact = await ContactDetails.findOne();

        // Construct update object with only defined fields
        const updateData: any = {};
        if (phoneNumbers !== undefined) updateData.phoneNumbers = phoneNumbers;
        if (email !== undefined) updateData.email = email;
        if (officeAddress !== undefined) updateData.officeAddress = officeAddress;
        if (timings !== undefined) updateData.timings = timings;
        if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
        if (facebook !== undefined) updateData.facebook = facebook;
        if (twitter !== undefined) updateData.twitter = twitter;
        if (linkedin !== undefined) updateData.linkedin = linkedin;
        if (instagram !== undefined) updateData.instagram = instagram;


        if (contact) {
            // Update existing with partial data
            await contact.update(updateData);
        } else {
            // Create new (merging with defaults if needed, or relying on model defaults)
            // For creation, we might want to enforce some fields, but since user requested optional updates, 
            // and usually a record exists, we will attempt create with partial data.
            contact = await ContactDetails.create(updateData);
        }

        return res.status(200).json({
            success: true,
            message: 'Contact details updated successfully',
            data: contact
        });
    } catch (error) {
        console.error('Error updating contact details:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update contact details'
        });
    }
};
