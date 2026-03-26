import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();


// ✅ GET ALL TRANSACTIONS
router.get("/", protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ CREATE TRANSACTION
router.post("/", protect, async (req, res) => {
  try {
    const { description, amount, account, date } = req.body;

    const tx = await Transaction.create({
      user: req.user._id,
      description,
      amount,
      account,
      date
    });

    res.status(201).json(tx);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ DELETE TRANSACTION
router.delete("/:id", protect, async (req, res) => {
  const { id } = req.params;

  // 🔥 THIS STOPS THE ERROR FOREVER
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    console.log("❌ Invalid delete ID:", id);
    return res.status(400).json({ message: "Invalid transaction ID" });
  }

  try {
    const tx = await Transaction.findById(id);

    if (!tx) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (tx.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await tx.deleteOne();

    res.json({ message: "Transaction deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;