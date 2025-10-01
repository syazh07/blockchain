// server.js
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for tourists
const tourists = new Map(); // wallet => { wallet, tripDays, tripDetails }

app.post("/tourists", (req, res) => {
  const { wallet, tripDays, tripDetails } = req.body;
  if (!wallet) return res.status(400).json({ error: "Wallet required" });

  tourists.set(wallet.toLowerCase(), {
    wallet: wallet.toLowerCase(),
    tripDays: tripDays || 0,
    tripDetails: tripDetails || [],
  });

  res.status(201).json({ message: "Wallet registered successfully" });
});

app.get("/tourists", (req, res) => {
  const { wallet } = req.query;
  if (wallet) {
    const t = tourists.get(wallet.toLowerCase());
    return res.json(t ? [t] : []);
  }
  // Return all tourists
  res.json(Array.from(tourists.values()));
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
