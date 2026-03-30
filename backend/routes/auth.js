import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

const router = express.Router();

router.post('/verify-password', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  const isMatch = await bcrypt.compare(req.body.password, user.password);

  if (isMatch) {
    res.json({ success: true });
  } else {
    res.status(401).json({ message: "Incorrect password" });
  }
});

// Register
router.post("/register", async (req, res) => {
    try {   
      const { firstName, lastName, username, email, password, dob } = req.body;
      if (!username || !email || !password) {
          return res.status(400).json({ message: "Please fill all the fields" });
      }

      const userExists = await User.findOne({
          $or: [{ email }, { username }]
      });

      if (userExists) {
          console.log("User already exists");
          return res.status(400).json({ message: "User already exists" });
      }
      console.log("creating")
      const user = await User.create({
          firstName,
          lastName,
          username,
          email,
          password,
          dob: dob || undefined
      });

      const token = generateToken(user._id);
      res.status(201).json({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          dob: user.dob,
          token
      });
      console.log("user created")
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      dob: user.dob,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Me
router.get("/me", protect, async (req, res) => {
  res.status(200).json(req.user);
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export default router;