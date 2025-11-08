// backend/routes/paymentRoutes.js
const express = require("express");
const Razorpay = require("razorpay");
const router = express.Router();

// ✅ Initialize Razorpay after dotenv.config() has already run in server.js
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("❌ Razorpay Error:", err);
    res.status(500).send("Error creating Razorpay order");
  }
});

module.exports = router;
