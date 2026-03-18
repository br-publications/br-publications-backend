import express from 'express';
import { saveDeliveryAddress } from '../controllers/deliveryAddressController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, saveDeliveryAddress);

export default router;
