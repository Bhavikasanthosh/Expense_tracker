const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Transaction = require('./models/Transaction');

dotenv.config();
const app = express();

// --- THE NUCLEAR CORS FIX ---
// This tells the browser to allow ANY website to talk to this backend.
app.use(cors()); 
app.use(express.json());

// This will print in your terminal every time the button is clicked
app.use((req, res, next) => {
  console.log(`📩 Request received: ${req.method} ${req.url}`);
  next();
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

app.get('/api/transactions', async (req, res) => {
  const t = await Transaction.find().sort({ date: -1 });
  res.json(t);
});

app.post('/api/transactions', async (req, res) => {
  try {
    const newT = new Transaction(req.body);
    const saved = await newT.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(5000, '0.0.0.0', () => {
  console.log('🚀 BACKEND IS LIVE ON PORT 5000');
});