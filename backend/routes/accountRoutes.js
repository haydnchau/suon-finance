import express from "express";
import Account from "../models/Account.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const account = await Account.findOne({ user: req.user._id });

    if (!account) {
      return res.status(200).json({
        checking: 0,
        savings: 0,
        cash: 0,
        investments: 0
      });
    }

    res.json(account);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/', protect, async (req, res) => {
  const { checking, savings, cash, savingsList } = req.body;

  let account = await Account.findOne({ user: req.user._id });

  if (account) {
    account.checking = checking;
    account.savings = savings;
    account.cash = cash;
    account.savingsList = savingsList || [];

    await account.save();
    res.json(account);
  } else {
    account = await Account.create({
      user: req.user._id,
      checking,
      savings,
      cash,
      savingsList
    });

    res.json(account);
  }
});

export default router;