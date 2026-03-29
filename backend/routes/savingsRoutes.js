import express from 'express';
import Savings from '../models/Savings.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET all savings for user
router.get('/', protect, async (req, res) => {
  try {
    const savings = await Savings.find({ user: req.user._id });
    res.json(savings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching savings' });
  }
});

// CREATE SAVING
router.post('/', protect, async (req, res) => {
  try {
    const saving = await Savings.create({
      ...req.body,
      user: req.user._id
    });

    res.status(201).json(saving);
  } catch (err) {
    console.error("CREATE SAVING ERROR:", err);
    res.status(500).json({ message: 'Error creating saving' });
  }
});

// GET ALL SAVINGS (needed later)
router.get('/', protect, async (req, res) => {
  try {
    const savings = await Savings.find({ user: req.user._id });
    res.json(savings);
  } catch (err) {
    console.error("GET SAVINGS ERROR:", err);
    res.status(500).json({ message: 'Error fetching savings' });
  }
});

// DELETE saving
router.delete('/:id', protect, async (req, res) => {
  try {
    const saving = await Savings.findById(req.params.id);

    if (!saving) {
      return res.status(404).json({ message: 'Saving not found' });
    }

    // ensure user owns it
    if (saving.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await saving.deleteOne();

    res.json({ message: 'Saving removed' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting saving' });
  }
});

export default router;