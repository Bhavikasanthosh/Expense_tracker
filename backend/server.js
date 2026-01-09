const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Transaction = require('./models/Transaction');

dotenv.config();
const app = express();

// 1. THE PORT FIX: Explicitly allow the frontend port
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// 2. CONNECTION CHECK: Log every time a request hits the port
app.use((req, res, next) => {
  console.log(`Port 5000 received: ${req.method} ${req.url}`);
  next();
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// 3. ROUTES
app.get('/api/transactions', async (req, res) => {
  const t = await Transaction.find().sort({ date: -1 });
  res.status(200).json(t);
});

app.post('/api/transactions', async (req, res) => {
  try {
    const saved = await new Transaction(req.body).save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Deleted" });
});

// 4. BIND TO THE PORT
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend listening on Port ${PORT}`);
});