import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
router.post('/create-order', async (req, res) => {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount required' });
    try {
        const order = await razorpay.orders.create({ amount: Math.round(amount * 100), currency, receipt });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/payments/verify
router.post('/verify', async (req, res) => {
    const { order_id, payment_id, signature } = req.body;
    if (!order_id || !payment_id || !signature) return res.status(400).json({ error: 'Missing params' });
    const body = order_id + '|' + payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');
    if (expectedSignature === signature) {
        res.json({ valid: true });
    } else {
        res.status(400).json({ valid: false });
    }
});

export default router;
