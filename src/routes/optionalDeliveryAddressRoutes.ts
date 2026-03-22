import { Router } from 'express';
import { saveOptionalDeliveryAddress, getOptionalDeliveryAddress } from '../controllers/optionalDeliveryAddressController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/optional-delivery-address:
 *   post:
 *     summary: Save or update optional delivery address
 *     tags: [OptionalDeliveryAddress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - submissionId
 *               - submissionType
 *               - fullName
 *               - countryCode
 *               - mobileNumber
 *               - email
 *               - addressLine1
 *               - city
 *               - state
 *               - postalCode
 *               - country
 *             properties:
 *               submissionId:
 *                 type: integer
 *               submissionType:
 *                 type: string
 *                 enum: [textbook, chapter]
 *               fullName:
 *                 type: string
 *               companyName:
 *                 type: string
 *               contactPersonName:
 *                 type: string
 *               countryCode:
 *                 type: string
 *               mobileNumber:
 *                 type: string
 *               altCountryCode:
 *                 type: string
 *               altMobileNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               buildingName:
 *                 type: string
 *               streetName:
 *                 type: string
 *               area:
 *                 type: string
 *               landmark:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isResidential:
 *                 type: string
 *                 enum: [residential, commercial]
 *               deliveryInstructions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Optional delivery address updated successfully
 *       201:
 *         description: Optional delivery address saved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, saveOptionalDeliveryAddress);

/**
 * @swagger
 * /api/optional-delivery-address/{type}/{id}:
 *   get:
 *     summary: Get optional delivery address for a submission
 *     tags: [OptionalDeliveryAddress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [textbook, chapter]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Optional delivery address retrieved successfully
 *       404:
 *         description: Optional delivery address not found
 *       500:
 *         description: Internal server error
 */
router.get('/:type/:id', authenticate, getOptionalDeliveryAddress);

export default router;
