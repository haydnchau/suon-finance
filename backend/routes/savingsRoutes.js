import express from 'express';
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const saving = await Savings.create(req.body);
    res.json(saving);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating saving' });
  }
});

export default router;