import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function CoinDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coin, setCoin] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH COIN DETAILS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}`
        );
        const data = await res.json();
        setCoin(data);
      } catch {
        toast.error("Error loading coin ❌");
      }
    };

    fetchData();
  }, [id]);

  // 📊 FETCH CHART
  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`
        );
        const data = await res.json();

        const formatted = data.prices?.map((p) => ({
          time: new Date(p[0]).toLocaleDateString(),
          price: p[1],
        })) || [];

        setChartData(formatted);
      } catch {
        console.log("Chart error");
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [id]);

  // 🚀 ADD TO PORTFOLIO
  const addToPortfolio = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) return toast.error("Login required ❌");

    try {
      await fetch("http://localhost:5000/api/portfolio", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          coin: coin.id,
          price: coin.market_data?.current_price?.usd || 0,
          quantity: 1,
          image: coin.image?.small,
          userId,
        }),
      });

      toast.success("Added to Portfolio 🚀");
    } catch {
      toast.error("Error ❌");
    }
  };

  if (loading || !coin) {
    return (
      <p className="text-center mt-10 text-gray-500 animate-pulse">
        Loading...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-100 p-6">

      {/* 🔙 BACK */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
      >
        ⬅ Back
      </button>

      {/* 🔥 HEADER */}
      <div className="text-center mb-8">
        <img
          src={coin.image?.large}
          alt={coin.name}
          className="w-16 mx-auto mb-2 animate-bounce"
        />
        <h1 className="text-3xl font-bold">{coin.name}</h1>
        <p className="text-gray-500 uppercase">{coin.symbol}</p>
      </div>

      {/* 💰 MAIN CARD */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">

        {/* PRICE STATS */}
        <div className="grid md:grid-cols-3 gap-6 text-center mb-6">

          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-gray-500">Price</p>
            <h2 className="text-xl font-bold">
              ${coin.market_data?.current_price?.usd
                ? coin.market_data.current_price.usd.toFixed(2)
                : "0.00"}
            </h2>
          </div>

          <div className="bg-green-50 p-4 rounded-xl">
            <p className="text-gray-500">Market Cap</p>
            <h2 className="text-xl font-bold">
              ${coin.market_data?.market_cap?.usd
                ? coin.market_data.market_cap.usd.toLocaleString()
                : "0"}
            </h2>
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl">
            <p className="text-gray-500">Rank</p>
            <h2 className="text-xl font-bold">
              #{coin.market_cap_rank || "N/A"}
            </h2>
          </div>

        </div>

        {/* 📊 CHART */}
        <div className="bg-gray-50 p-4 rounded-xl mb-6">
          <h3 className="font-bold mb-3 text-center">
            📈 7 Day Price Chart
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#6366F1"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* EXTRA DETAILS */}
        <div className="grid md:grid-cols-2 gap-4 text-sm">

          <div className="bg-gray-100 p-3 rounded">
            📈 High 24h: $
            {coin.market_data?.high_24h?.usd
              ? coin.market_data.high_24h.usd.toFixed(2)
              : "0.00"}
          </div>

          <div className="bg-gray-100 p-3 rounded">
            📉 Low 24h: $
            {coin.market_data?.low_24h?.usd
              ? coin.market_data.low_24h.usd.toFixed(2)
              : "0.00"}
          </div>

          <div className="bg-gray-100 p-3 rounded">
            🔄 Supply:{" "}
            {coin.market_data?.circulating_supply
              ? coin.market_data.circulating_supply.toLocaleString()
              : "N/A"}
          </div>

          <div className="bg-gray-100 p-3 rounded">
            💎 ATH: $
            {coin.market_data?.ath?.usd
              ? coin.market_data.ath.usd.toFixed(2)
              : "0.00"}
          </div>

        </div>

        {/* 🚀 ADD BUTTON */}
        <button
          onClick={addToPortfolio}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:scale-105 transition"
        >
          Add to Portfolio 🚀
        </button>

        {/* 🧠 DESCRIPTION */}
        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-bold mb-2">About</h3>
          <p>
            {coin.description?.en
              ? coin.description.en.slice(0, 250) + "..."
              : "No description available"}
          </p>
        </div>

      </div>
    </div>
  );
}