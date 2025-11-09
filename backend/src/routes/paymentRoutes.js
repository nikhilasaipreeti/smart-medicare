// backend/src/routes/paymentRoutes.js
const express = require("express");
const Razorpay = require("razorpay");
const router = express.Router();

console.log("🔑 Razorpay Key ID:", process.env.RAZORPAY_KEY_ID ? "Set" : "Missing");
console.log("🔑 Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET ? "Set" : "Missing");

// ✅ Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {
    console.log("💰 Payment request received:", req.body);
    
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    console.log("🔄 Creating Razorpay order with options:", options);
    
    const order = await razorpay.orders.create(options);
    
    console.log("✅ Razorpay order created:", order.id);
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("❌ Razorpay Error:", err);
    console.error("❌ Error details:", err.error);
    res.status(500).json({ 
      error: "Error creating Razorpay order",
      details: err.error ? err.error.description : err.message 
    });
  }
});

module.exports = router;
