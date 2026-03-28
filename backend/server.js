import express from 'express';
import dotenv from 'dotenv';
import router from './routes/router.js';
import { connectDB } from './config/db.js';
import cors from 'cors';
import accountRoutes from './routes/accountRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import savingsRoutes from './routes/savingsRoutes.js'

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://suon-finance.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({ message: 'API is running' });
});

app.use("/api/users", router);

app.use("/api/accounts", accountRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/savings", savingsRoutes);

connectDB();

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});