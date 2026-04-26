const express = require('express');
const router = express.Router();
const Watchlist = require('../models/Watchlist');

// ✅ Add coin
router.post("/add", async (req, res) => {
  try {
    const { userId, coinName, coinId, buyPrice } = req.body;

    const newItem = new Watchlist({
      userId,
      coinName,
      coinId,
      buyPrice
    });

    await newItem.save();

    res.json({ message: "Added ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});;
// ✅ Get watchlist
router.get('/:userId', async (req, res) => {
  const data = await Watchlist.find({ userId: req.params.userId });
  res.json(data);
});

// ✅ Remove coin
router.delete('/remove/:id', async (req, res) => {
  await Watchlist.findByIdAndDelete(req.params.id);
  res.json({ message: "Removed ❌" });
});

module.exports = router;