const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "secret123";

/* =========================
   ✅ MONGODB CONNECTION
========================= */
require("dotenv").config();

console.log("MONGO_URL:", process.env.MONGO_URL);

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch(err => console.log("MongoDB error:", err));

const User = mongoose.model(
  "User",
  new mongoose.Schema({ email: String, password: String })
);

/* =========================
   💰 WATCHLIST SCHEMA
========================= */
const Watch = mongoose.model(
  "Watch",
  new mongoose.Schema({
    coinName: String,
    coinId:   String,
    amount:   Number,
    buyPrice: Number,
    userId:   String,
  })
);

/* =========================
   💼 PORTFOLIO SCHEMA
========================= */
const Portfolio = mongoose.model(
  "Portfolio",
  new mongoose.Schema({
    coin:     String,
    price:    Number,
    quantity: Number,
    userId:   String,
  })
);

/* =========================
   📜 TRANSACTION SCHEMA
========================= */
const Transaction = mongoose.model(
  "Transaction",
  new mongoose.Schema({
    coin:      String,
    type:      String,
    price:     Number,
    quantity:  Number,
    userId:    String,
    orderType: String,
    date:      { type: Date, default: Date.now },
  })
);

/* =========================
   🔐 AUTH
========================= */
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.json({ message: "User exists ❌" });
    const hashed = await bcrypt.hash(password, 10);
    const user   = new User({ email, password: hashed });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, userId: user._id });
  } catch {
    res.status(500).json({ message: "Signup error ❌" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "User not found ❌" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)  return res.json({ message: "Wrong password ❌" });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, userId: user._id });
  } catch {
    res.status(500).json({ message: "Login error ❌" });
  }
});

/* =========================
   ⭐ WATCHLIST
========================= */
app.post("/api/watchlist/add", async (req, res) => {
  try {
    const { coinName, coinId, amount, buyPrice, userId } = req.body;
    const exists = await Watch.findOne({ coinId, userId });
    if (exists) return res.json({ message: "Already added ⚠️" });
    await Watch.create({ coinName, coinId, amount, buyPrice, userId });
    res.json({ message: "Added ✅" });
  } catch {
    res.status(500).json({ message: "Error ❌" });
  }
});

app.get("/api/watchlist/:userId", async (req, res) => {
  const data = await Watch.find({ userId: req.params.userId });
  res.json(data);
});

app.delete("/api/watchlist/:id", async (req, res) => {
  await Watch.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted ✅" });
});

/* =========================
   💼 PORTFOLIO
========================= */
app.get("/api/portfolio/:userId", async (req, res) => {
  const data = await Portfolio.find({ userId: req.params.userId });
  res.json(data);
});

app.post("/api/portfolio/buy", async (req, res) => {
  const { coin, price, quantity, userId, orderType } = req.body;
  try {
    const existing = await Portfolio.findOne({ coin, userId });
    if (existing) {
      const totalQty = existing.quantity + quantity;
      const avgPrice = (existing.price * existing.quantity + price * quantity) / totalQty;
      existing.quantity = totalQty;
      existing.price    = avgPrice;
      await existing.save();
    } else {
      await Portfolio.create({ coin, price, quantity, userId });
    }
    await Transaction.create({ coin, type: "BUY", price, quantity, userId, orderType: orderType || "market" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Buy failed ❌" });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: messages.map(m => ({
          role: m.role === "model" ? "assistant" : m.role,
          content: m.parts[0].text
        })),
      }),
    });

    const data = await response.json();
    console.log("Groq:", data);

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: "No reply ❌" });
    }

    res.json({ reply });

  } catch (err) {
    console.log("AI ERROR:", err);
    res.status(500).json({ error: "AI error ❌" });
  }
});
app.delete("/api/portfolio/:id", async (req, res) => {
  await Portfolio.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted ✅" });
});

/* =========================
   📜 TRANSACTIONS
========================= */
app.get("/api/transactions/:userId", async (req, res) => {
  const data = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
  res.json(data);
});

/* =========================
   🤖 AI CHAT (Gemini)
========================= */
app.post("/api/ai/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages ❌" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: `You are CryptoAI — an expert cryptocurrency assistant for CryptoTrack Pro app.
You help users with:
- Crypto price analysis and market trends
- Portfolio management advice (buy/sell/hold)
- Explanation of blockchain concepts
- DeFi, NFT, and Web3 questions
- Risk assessment and investment strategies
- Understanding crypto terms and indicators

Keep responses concise, friendly, and actionable.
Use emojis occasionally to make responses engaging.
Format important points with bullet points when needed.
Always remind users that crypto is volatile and to do their own research (DYOR).`
            }]
          },
          contents: messages,
          generationConfig: {
            temperature:     0.7,
            maxOutputTokens: 600,
          },
        }),
      }
    );

    const data  = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.log("Gemini error:", JSON.stringify(data));
      return res.status(500).json({ error: "No reply from AI" });
    }

    res.json({ reply });

  } catch (err) {
    console.log("AI route error:", err);
    res.status(500).json({ error: "AI error ❌" });
  }
});

/* =========================
   🚀 START SERVER
========================= */
app.listen(process.env.PORT || 5000, () => {
  console.log("Server running 🚀");
});