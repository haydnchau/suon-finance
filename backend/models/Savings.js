import mongoose from "mongoose";

const savingsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  interest: Number,
  maturity: Date,
  accountNumber: String
});

export default mongoose.model("Savings", savingsSchema);