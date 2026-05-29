const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

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

  const normalizedCoin = coin.toLowerCase();

  try {
    const existing = await Portfolio.findOne({
      coin: normalizedCoin,
      userId
    });

    if (existing) {
      const totalQty = existing.quantity + quantity;

      const avgPrice =
        (existing.price * existing.quantity + price * quantity) / totalQty;

      existing.quantity = totalQty;
      existing.price = avgPrice;

      await existing.save();

    } else {

      await Portfolio.create({
        coin: normalizedCoin,
        price,
        quantity,
        userId
      });
    }

    await Transaction.create({
      coin: normalizedCoin,
      type: "buy",
      price,
      quantity,
      userId,
      orderType: orderType || "market"
    });

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Buy failed ❌" });
  }
});
app.post("/api/portfolio/sell", async (req, res) => {

  const { coin, price, quantity, userId, orderType } = req.body;

  const normalizedCoin = coin.toLowerCase();

  try {

    const existing = await Portfolio.findOne({
      coin: normalizedCoin,
      userId
    });

    if (!existing) {
      return res.status(400).json({
        error: "Coin not in portfolio ❌"
      });
    }

    if (existing.quantity < quantity) {
      return res.status(400).json({
        error: "Insufficient quantity ❌"
      });
    }

    existing.quantity -= quantity;

    if (existing.quantity === 0) {
      await Portfolio.findByIdAndDelete(existing._id);
    } else {
      await existing.save();
    }

    console.log("Before transaction save");

    await Transaction.create({
      coin: coin.toLowerCase(),
      type: "sell",
      price,
      quantity,
      userId,
      orderType: orderType || "market"
    });

    console.log("Transaction saved");

    res.json({ success: true });

  } catch (err) {

    console.log("SELL ERROR:", err);

    res.status(500).json({
      error: err.message
    });
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
  try {
    const data = await Transaction.find({
      userId: req.params.userId
    }).sort({ date: -1 });

    console.log("Transactions:", data);

    res.json(data);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Transaction fetch failed ❌" });
  }
});

/* =========================
   🤖 AI CHAT (Gemini)
========================= */


/* =========================
   🚀 START SERVER
========================= */
app.listen(process.env.PORT || 5000, () => {
  console.log("Server running 🚀");
});