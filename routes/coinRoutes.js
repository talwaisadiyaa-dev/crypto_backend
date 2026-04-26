const express = require('express');
const router = express.Router();
const axios = require('axios');

// real API call
router.get('/', async (req, res) => {
    try {
        const response = await axios.get(
            'https://api.coingecko.com/api/v3/coins/markets',
            {
                params: {
                    vs_currency: 'usd'
                }
            }
        );

        res.json(response.data.slice(0, 10));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coins' });
    }
});

module.exports = router;