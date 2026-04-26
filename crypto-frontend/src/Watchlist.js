import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Watchlist() {
  const [coins, setCoins] = useState([]);

  const API = "http://localhost:5000/api/watchlist";

  // 🔥 FETCH WATCHLIST
  const fetchWatchlist = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      toast.error("Login required ❌");
      return;
    }

    try {
      const res = await fetch(`${API}/${userId}`);
      const data = await res.json();

      console.log("WATCHLIST DATA:", data); // 🔍 DEBUG

      const updated = await Promise.all(
        data.map(async (item) => {
          try {
            const priceRes = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${item.coinId}&vs_currencies=usd`
            );
            const priceData = await priceRes.json();

            return {
              ...item,
              currentPrice:
                priceData[item.coinId]?.usd || item.buyPrice,
            };
          } catch {
            return {
              ...item,
              currentPrice: item.buyPrice,
            };
          }
        })
      );

      setCoins(updated);
    } catch (err) {
      console.log(err);
      toast.error("Error loading watchlist ❌");
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // ❌ DELETE (SUPER SAFE VERSION)
  const deleteCoin = async (coin) => {
    try {
      if (!coin?._id) {
        toast.error("Invalid ID ❌");
        console.log("INVALID COIN:", coin);
        return;
      }

      console.log("Deleting:", coin._id);

      const res = await fetch(`${API}/${coin._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      console.log("DELETE RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      // 🔥 UI UPDATE FIRST
      setCoins((prev) => prev.filter((c) => c._id !== coin._id));

      toast.success("Removed successfully ❌");

    } catch (err) {
      console.log("DELETE ERROR:", err);
      toast.error("Delete failed ❌");
    }
  };

  // 🚀 MOVE TO PORTFOLIO
  const moveToPortfolio = async (coin) => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) return toast.error("Login required ❌");

      await fetch("http://localhost:5000/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coin: coin.coinId,
          price: coin.buyPrice,
          quantity: coin.amount,
          image: "",
          userId,
        }),
      });

      // 🔥 DELETE AFTER ADD
      await deleteCoin(coin);

      toast.success("Moved to Portfolio 🚀");

    } catch (err) {
      console.log(err);
      toast.error("Move failed ❌");
    }
  };

  // 💰 TOTAL
  const total = coins.reduce(
    (acc, c) => acc + (c.currentPrice || 0) * (c.amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-100 p-6">

      <h1 className="text-4xl font-bold text-center mb-8">
        📌 Watchlist
      </h1>

      <div className="bg-white p-5 rounded shadow text-center mb-8">
        <h3>Total Value</h3>
        <p className="text-2xl font-bold text-blue-600">
          ${total.toFixed(2)}
        </p>
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {coins.map((coin) => {
          const profit =
            (coin.currentPrice - coin.buyPrice) * coin.amount;

          return (
            <div key={coin._id} className="bg-white p-5 rounded shadow">

              <h2 className="font-bold text-lg">
                {coin.coinName}
              </h2>

              <p>Buy: ${coin.buyPrice}</p>
              <p>Current: ${coin.currentPrice.toFixed(2)}</p>
              <p>Qty: {coin.amount}</p>

              <p className={profit > 0 ? "text-green-600" : "text-red-500"}>
                P/L: ${profit.toFixed(2)}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => moveToPortfolio(coin)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Move
                </button>

                <button
                  onClick={() => deleteCoin(coin)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {coins.length === 0 && (
        <p className="text-center mt-10 text-gray-500">
          No coins in watchlist 😢
        </p>
      )}
    </div>
  );
}