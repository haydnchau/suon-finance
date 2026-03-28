import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checking: { type: Number, default: 0 },
  savings: { type: Number, default: 0 },
  cash: { type: Number, default: 0 },
  savingsList: [
    {
      amount: Number,
      accountNumber: String,
      interest: Number,
      maturity: Date
    }
  ],
  investments: { type: Number, default: 0 }
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);

export default Account;