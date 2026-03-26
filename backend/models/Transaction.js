import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 100
  },
  amount: {
    type: Number,
    required: true
  },
  account: {
    type: String,
    enum: ['checking', 'savings', 'cash', 'investments'],
    required: true
  },
  date: {
    type: Date,
    required: true
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;