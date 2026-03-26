import express from "express";
import Account from "../models/Account.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// 🔥 GET user accounts
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

// 🔥 CREATE / UPDATE accounts
router.post("/", protect, async (req, res) => {
  try {
    let account = await Account.findOne({ user: req.user._id });

    if (account) {
      // update
      account.checking = req.body.checking;
      account.savings = req.body.savings;
      account.cash = req.body.cash;
      account.investments = req.body.investments;

      await account.save();
    } else {
      // create
      account = await Account.create({
        user: req.user._id,
        ...req.body
      });
    }

    res.json(account);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;