const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema({
  userId: String,
  coinName: String,
  coinId: String,
  buyPrice: Number // 🔥 IMPORTANT
});

module.exports = mongoose.model("Watchlist", watchlistSchema);