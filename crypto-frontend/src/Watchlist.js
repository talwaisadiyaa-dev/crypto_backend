import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, ArrowRightLeft, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";

const BASE_URL = "https://crypto-backend-2ryf.onrender.com";

export default function Watchlist() {
  const [coins,     setCoins]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [refreshing,setRefreshing]= useState(false);

  /* ── FETCH ── */
  const fetchWatchlist = async (isRefresh = false) => {
    const userId = localStorage.getItem("userId");
    if (!userId) { toast.error("Login required ❌"); return; }
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/watchlist/${userId}`);
      const data = await res.json();

      const updated = await Promise.all(
        data.map(async (item) => {
          try {
            const priceRes  = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${item.coinId}&vs_currencies=usd&include_24hr_change=true`
            );
            const priceData = await priceRes.json();
            return {
              ...item,
              currentPrice: priceData[item.coinId]?.usd         || item.buyPrice,
              change24h:    priceData[item.coinId]?.usd_24h_change ?? 0,
            };
          } catch {
            return { ...item, currentPrice: item.buyPrice, change24h: 0 };
          }
        })
      );
      setCoins(updated);
    } catch (err) {
      console.log(err);
      toast.error("Error loading watchlist ❌");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchWatchlist(); }, []);

  /* ── DELETE ── */
  const deleteCoin = async (coin) => {
    if (!coin?._id) { toast.error("Invalid ID ❌"); return; }
    try {
      const res = await fetch(`${BASE_URL}/api/watchlist/${coin._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setCoins(prev => prev.filter(c => c._id !== coin._id));
      toast.success("Removed ✅");
    } catch (err) {
      console.log(err);
      toast.error("Delete failed ❌");
    }
  };

  /* ── MOVE TO PORTFOLIO ── */
  const moveToPortfolio = async (coin) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return toast.error("Login required ❌");
    try {
      await fetch(`${BASE_URL}/api/portfolio/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coin:     coin.coinId,
          price:    coin.buyPrice,
          quantity: coin.amount,
          image:    "",
          userId,
        }),
      });
      await deleteCoin(coin);
      toast.success("Moved to Portfolio 🚀");
    } catch (err) {
      console.log(err);
      toast.error("Move failed ❌");
    }
  };

  /* ── STATS ── */
  const totalValue  = coins.reduce((a, c) => a + (c.currentPrice || 0) * (c.amount || 0), 0);
  const totalCost   = coins.reduce((a, c) => a + (c.buyPrice     || 0) * (c.amount || 0), 0);
  const totalPL     = totalValue - totalCost;
  const gainers     = coins.filter(c => c.currentPrice > c.buyPrice).length;
  const losers      = coins.filter(c => c.currentPrice < c.buyPrice).length;

  /* ── RENDER ── */
  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 30%, #f0fdf4 60%, #fef9f0 100%)" }}>

      {/* Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-transparent bg-clip-text">
              📌 Watchlist
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Track your favourite coins</p>
          </div>
          <button
            onClick={() => fetchWatchlist(true)}
            className={`p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-500 transition text-gray-400 ${refreshing ? "animate-spin" : ""}`}
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: "💼", label: "Total Value",  value: `$${totalValue.toFixed(2)}`,             gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600" },
            { icon: "📊", label: "Total P/L",    value: `${totalPL >= 0 ? "+" : ""}$${totalPL.toFixed(2)}`, gradient: totalPL >= 0 ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-red-500 to-rose-600" },
            { icon: "📈", label: "Gainers",      value: `${gainers} coins`,                      gradient: "bg-gradient-to-br from-blue-500 to-cyan-600"     },
            { icon: "📉", label: "Losers",       value: `${losers} coins`,                       gradient: "bg-gradient-to-br from-rose-500 to-pink-600"     },
          ].map((s, i) => (
            <div key={i} className={`${s.gradient} rounded-2xl p-4 shadow-sm border border-white/60 flex items-center gap-3`}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">{s.label}</p>
                <p className="text-base font-extrabold text-white truncate">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── LOADING ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-xl">📌</span>
            </div>
            <p className="text-gray-400 text-sm font-semibold">Loading watchlist...</p>
          </div>
        ) : coins.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">📭</p>
            <p className="font-semibold text-gray-500">No coins in watchlist yet</p>
            <p className="text-sm text-gray-400 mt-1">Go to Home and pin coins you want to track</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {coins.map(coin => {
              const pl      = (coin.currentPrice - coin.buyPrice) * coin.amount;
              const plPct   = coin.buyPrice > 0 ? ((coin.currentPrice - coin.buyPrice) / coin.buyPrice * 100).toFixed(2) : 0;
              const isUp    = pl >= 0;
              const ch24    = coin.change24h ?? 0;
              const isUp24  = ch24 >= 0;

              return (
                <div key={coin._id}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">

                  {/* Top accent */}
                  <div className={`h-1 w-full ${isUp ? "bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500" : "bg-gradient-to-r from-red-400 to-pink-500"}`} />

                  {/* Card body */}
                  <div className="p-4 flex flex-col gap-3 flex-1">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-extrabold text-gray-800 text-base leading-tight">{coin.coinName}</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{coin.coinId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-gray-900">${coin.currentPrice?.toFixed(2)}</p>
                        <span className={`flex items-center justify-end gap-0.5 text-[10px] font-extrabold ${isUp24 ? "text-green-500" : "text-red-500"}`}>
                          {isUp24 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {isUp24 ? "+" : ""}{ch24.toFixed(2)}% 24h
                        </span>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Buy Price", val: `$${coin.buyPrice?.toFixed(2)}` },
                        { label: "Quantity",  val: coin.amount },
                        { label: "Value",     val: `$${(coin.currentPrice * coin.amount).toFixed(2)}` },
                      ].map(s => (
                        <div key={s.label} className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
                          <p className="text-xs font-extrabold text-gray-700 mt-0.5">{s.val}</p>
                        </div>
                      ))}
                    </div>

                    {/* P/L bar */}
                    <div className={`rounded-xl px-3 py-2 flex items-center justify-between ${isUp ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"}`}>
                      <span className="text-xs font-bold text-gray-500">P/L</span>
                      <div className="text-right">
                        <span className={`text-sm font-extrabold ${isUp ? "text-green-600" : "text-red-500"}`}>
                          {isUp ? "+" : ""}${pl.toFixed(2)}
                        </span>
                        <span className={`text-[10px] font-bold ml-1.5 ${isUp ? "text-green-500" : "text-red-400"}`}>
                          ({isUp ? "+" : ""}{plPct}%)
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 px-4 pb-4">
                    <button
                      onClick={() => moveToPortfolio(coin)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-2.5 rounded-xl text-xs font-extrabold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-indigo-200/50"
                    >
                      <ArrowRightLeft size={11} /> Move
                    </button>
                    <button
                      onClick={() => deleteCoin(coin)}
                      className="flex items-center justify-center gap-1.5 bg-red-50 text-red-500 border border-red-200 px-4 py-2.5 rounded-xl text-xs font-extrabold hover:bg-red-500 hover:text-white active:scale-95 transition-all"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
