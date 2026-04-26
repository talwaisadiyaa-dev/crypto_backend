import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { Pin, TrendingUp, BarChart2, Search, X, RefreshCw, Flame, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ========================= SPARKLINE ========================= */
function Sparkline({ data = [], positive }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    ctx.clearRect(0, 0, w, h);
    const toX = (i) => (i / (data.length - 1)) * w;
    const toY = (v) => h - ((v - min) / range) * (h - 8) - 4;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, positive ? "rgba(99,102,241,0.25)" : "rgba(239,68,68,0.25)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    data.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();
    data.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = positive ? "#6366f1" : "#ef4444";
    ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();

    const lx = toX(data.length - 1), ly = toY(data[data.length - 1]);
    ctx.beginPath(); ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = positive ? "#6366f1" : "#ef4444"; ctx.fill();

    // Glow dot
    ctx.beginPath(); ctx.arc(lx, ly, 6, 0, Math.PI * 2);
    ctx.fillStyle = positive ? "rgba(99,102,241,0.15)" : "rgba(239,68,68,0.15)"; ctx.fill();
  }, [data, positive]);
  return <canvas ref={canvasRef} width={160} height={50} className="w-full" />;
}

/* ========================= COIN CARD ========================= */
function CoinCard({ coin, symbol, isSaved, onWatchlist, onBuy, onNavigate }) {
  const isUp  = (coin.price_change_percentage_24h ?? 0) >= 0;
  const spark = coin.sparkline_in_7d?.price ?? [];
  const mcap  = coin.market_cap ? (coin.market_cap / 1e9).toFixed(1) + "B" : "—";
  const vol   = coin.total_volume ? (coin.total_volume / 1e6).toFixed(0) + "M" : "—";

  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden">

      {/* Glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none ${isUp ? "bg-gradient-to-br from-indigo-50/80 to-violet-50/40" : "bg-gradient-to-br from-red-50/60 to-pink-50/30"}`} />

      {/* Top accent bar */}
      <div className={`h-1 w-full rounded-t-2xl ${isUp ? "bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500" : "bg-gradient-to-r from-red-400 via-pink-500 to-rose-400"}`} />

      {/* Header */}
      <div className="relative flex items-center justify-between px-4 pt-3 pb-0">
        <div className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer" onClick={() => onNavigate(coin.id)}>
          <div className="relative flex-shrink-0">
            <div className={`absolute inset-0 rounded-full blur-sm opacity-30 ${isUp ? "bg-indigo-400" : "bg-red-400"}`} />
            <img src={coin.image} alt={coin.name} className="relative w-9 h-9 rounded-full ring-2 ring-white shadow-sm" />
            <span className="absolute -bottom-1.5 -right-1.5 text-[8px] bg-gray-800 text-white font-extrabold px-1 rounded-full leading-4 shadow">
              #{coin.market_cap_rank}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-gray-800 text-sm leading-tight truncate group-hover:text-indigo-600 transition-colors">{coin.name}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{coin.symbol}</p>
          </div>
        </div>

        <button
          onClick={() => onWatchlist(coin)}
          disabled={isSaved}
          className={`relative flex-shrink-0 p-1.5 rounded-xl transition-all ${isSaved ? "text-indigo-500 bg-indigo-100" : "text-gray-300 hover:text-indigo-400 hover:bg-indigo-50"}`}
        >
          <Pin size={12} fill={isSaved ? "#6366f1" : "none"} />
        </button>
      </div>

      {/* Sparkline */}
      <div className="relative px-2 pt-2 pb-0 cursor-pointer" onClick={() => onNavigate(coin.id)}>
        <Sparkline data={spark} positive={isUp} />
      </div>

      {/* Price */}
      <div className="relative px-4 pb-2 pt-1 cursor-pointer" onClick={() => onNavigate(coin.id)}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Price</p>
            <p className="text-lg font-extrabold text-gray-900 leading-none">
              {symbol}{coin.current_price
                ? Number(coin.current_price).toLocaleString(undefined, { maximumFractionDigits: 4 })
                : "0.00"}
            </p>
          </div>
          <span className={`flex items-center gap-0.5 text-xs font-extrabold px-2.5 py-1.5 rounded-xl ${
            isUp ? "bg-indigo-100 text-indigo-600" : "bg-red-100 text-red-500"
          }`}>
            {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-2 mt-2.5">
          <div className="flex-1 bg-gray-50 rounded-xl py-1.5 px-2 text-center border border-gray-100">
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">MCap</p>
            <p className="text-[11px] font-extrabold text-gray-700">{symbol}{mcap}</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl py-1.5 px-2 text-center border border-gray-100">
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Vol 24h</p>
            <p className="text-[11px] font-extrabold text-gray-700">{symbol}{vol}</p>
          </div>
        </div>
      </div>

      {/* Buy button */}
      <button
        onClick={() => onBuy(coin)}
        className={`relative mx-3 mb-3 py-2.5 text-white text-xs font-extrabold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md ${
          isUp
            ? "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-indigo-200/60"
            : "bg-gradient-to-r from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800 shadow-slate-200/60"
        }`}
      >
        <Zap size={11} />Smart Buy
      </button>
    </div>
  );
}

/* ========================= TRENDING PILL ========================= */
function TrendingPill({ coin, onClick }) {
  const isUp = (coin.data?.price_change_percentage_24h?.usd ?? 0) >= 0;
  return (
    <button
      onClick={() => onClick(coin)}
      className="flex items-center gap-2 bg-white/70 hover:bg-white border border-gray-200 hover:border-indigo-200 hover:shadow-md rounded-xl px-3 py-2 transition-all group"
    >
      <img src={coin.small} alt={coin.name} className="w-5 h-5 rounded-full flex-shrink-0" />
      <div className="text-left min-w-0">
        <p className="text-xs font-bold text-gray-700 truncate max-w-[68px] group-hover:text-indigo-600 transition-colors">{coin.name}</p>
        <p className="text-[9px] text-gray-400 uppercase font-bold">{coin.symbol}</p>
      </div>
      <span className={`text-[10px] font-extrabold flex-shrink-0 ${isUp ? "text-indigo-500" : "text-red-500"}`}>
        {isUp ? "▲" : "▼"}{Math.abs(coin.data?.price_change_percentage_24h?.usd ?? 0).toFixed(1)}%
      </span>
    </button>
  );
}

/* ========================= STAT CARD ========================= */
function StatCard({ icon, label, value, gradient }) {
  return (
    <div className={`${gradient} rounded-2xl p-4 shadow-sm border border-white/60 backdrop-blur-sm flex items-center gap-3`}>
      <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">{label}</p>
        <p className="text-base font-extrabold text-white truncate leading-tight">{value}</p>
      </div>
    </div>
  );
}

/* ========================= MAIN HOME ========================= */
export default function Home() {
  const [coins,        setCoins]        = useState([]);
  const [trending,     setTrending]     = useState([]);
  const [search,       setSearch]       = useState("");
  const [currency,     setCurrency]     = useState("usd");
  const [symbol,       setSymbol]       = useState("$");
  const [loading,      setLoading]      = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [quantity,     setQuantity]     = useState("");
  const [sortBy,       setSortBy]       = useState("market_cap_rank");
  const [lastUpdated,  setLastUpdated]  = useState(null);

  const navigate = useNavigate();
  const API ="https://crypto-backend-2ryf.onrender.com/api";


  const currencyOptions = [
    { code: "usd", symbol: "$",   label: "USD" },
    { code: "inr", symbol: "₹",   label: "INR" },
    { code: "eur", symbol: "€",   label: "EUR" },
    { code: "gbp", symbol: "£",   label: "GBP" },
    { code: "jpy", symbol: "¥",   label: "JPY" },
    { code: "aud", symbol: "A$",  label: "AUD" },
    { code: "cad", symbol: "C$",  label: "CAD" },
    { code: "aed", symbol: "د.إ", label: "AED" },
    { code: "sgd", symbol: "S$",  label: "SGD" },
  ];

  const fetchCoins = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res  = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&per_page=50&page=1&sparkline=true&price_change_percentage=24h`);
      const data = await res.json();
      setCoins(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch { toast.error("Error fetching coins"); }
    finally { setLoading(false); setRefreshing(false); }
  }, [currency]);

  const fetchTrending = async () => {
    try {
      const res  = await fetch("https://api.coingecko.com/api/v3/search/trending");
      const data = await res.json();
      setTrending(data?.coins?.map(c => c.item)?.slice(0, 8) ?? []);
    } catch {}
  };

  const fetchWatchlist = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
const res = await fetch(`${API}/watchlist/${userId}`);
const data = await res.json();
console.log("Watchlist:", data);
    } catch {}
  };

  useEffect(() => {
    fetchCoins(); fetchTrending(); fetchWatchlist();
    const iv = setInterval(() => fetchCoins(true), 30000);
    return () => clearInterval(iv);
  }, [fetchCoins]);

  const filteredCoins = useMemo(() => {
    let list = coins.filter(c =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol?.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === "price_change") list = [...list].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));
    else if (sortBy === "volume")  list = [...list].sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0));
    else                           list = [...list].sort((a, b) => (a.market_cap_rank ?? 999) - (b.market_cap_rank ?? 999));
    return list;
  }, [coins, search, sortBy]);

  const stats = useMemo(() => {
    if (!coins.length) return null;
    const gainers   = coins.filter(c => (c.price_change_percentage_24h ?? 0) > 0).length;
    const losers    = coins.filter(c => (c.price_change_percentage_24h ?? 0) < 0).length;
    const totalVol  = coins.reduce((a, c) => a + (c.total_volume || 0), 0);
    const topGainer = [...coins].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0))[0];
    return { gainers, losers, totalVol, topGainer };
  }, [coins]);

  const changeCurrency = (e) => {
    const s = currencyOptions.find(c => c.code === e.target.value);
    setCurrency(s.code); setSymbol(s.symbol);
  };

  const addToWatchlist = async (coin) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return toast.error("Login required ❌");
    try {
      await fetch(`${API}/watchlist/add`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinName: coin.name, coinId: coin.id.toLowerCase(), amount: 1, buyPrice: Number(coin.current_price) || 0, userId }),
      });
      toast.success("Saved 📌"); fetchWatchlist();
    } catch { toast.error("Error ❌"); }
  };

  const confirmBuy = async () => {
  const userId = localStorage.getItem("userId");
  const qty = Number(quantity);
  const price = Number(selectedCoin?.current_price);

  if (!userId) return toast.error("Login required ❌");
  if (!qty || qty <= 0) return toast.error("Enter valid quantity");
  if (!price) return toast.error("Invalid price");

  try {
    const res = await fetch("https://crypto-backend-2ryf.onrender.com/api/portfolio/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coin: selectedCoin.id.toLowerCase(),
        price,
        quantity: qty,
        image: selectedCoin.image,
        userId
      }),
    });

    const data = await res.json();
    console.log("BUY:", data);

    toast.success("Added to Portfolio 🚀");
    setSelectedCoin(null);
    setQuantity("");

  } catch (err) {
    console.error(err);
    toast.error("Error ❌");
  }
};

  const total = selectedCoin && quantity ? Number(selectedCoin.current_price || 0) * Number(quantity) : 0;
  const sugg  = (selectedCoin?.price_change_percentage_24h ?? 0) > 2
    ? { text: "📈 Strong Uptrend — Good time to buy",     color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" }
    : (selectedCoin?.price_change_percentage_24h ?? 0) < -2
    ? { text: "⚠️ Downtrend — Higher risk right now",      color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"    }
    : { text: "〰️ Sideways market — Watch before buying",  color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200"  };

  const handleTrendingClick = (tc) => {
    const m = coins.find(c => c.id === tc.id);
    if (m) setSelectedCoin(m); else toast("Open coin page for details 👉");
  };

  return (
    /* ══ BACKGROUND — mesh gradient + subtle pattern ══ */
    <div className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 30%, #f0fdf4 60%, #fef9f0 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl" />
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-transparent bg-clip-text">
                CryptoTrack
              </h1>
              <span className="text-2xl">🚀</span>
              <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
                LIVE
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium">Real-time prices · Portfolio tracker · Smart Buy</p>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/60 shadow-sm font-medium">
                🕐 {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchCoins(true)}
              className={`p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-500 transition text-gray-400 ${refreshing ? "animate-spin" : ""}`}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard icon="📈" label="Gainers"    value={`${stats.gainers} coins`}                                       gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" />
            <StatCard icon="📉" label="Losers"     value={`${stats.losers} coins`}                                        gradient="bg-gradient-to-br from-rose-500 to-pink-600"    />
            <StatCard icon="💹" label="24h Volume" value={`${symbol}${(stats.totalVol / 1e9).toFixed(1)}B`}               gradient="bg-gradient-to-br from-blue-500 to-cyan-600"     />
            <StatCard icon="🏆" label="Top Gainer" value={stats.topGainer ? `${stats.topGainer.symbol?.toUpperCase()} +${(stats.topGainer.price_change_percentage_24h ?? 0).toFixed(1)}%` : "—"} gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
          </div>
        )}

        {/* ── TRENDING ── */}
        {trending.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md px-4 py-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 bg-gradient-to-r from-orange-400 to-pink-500 text-white px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wide shadow-sm">
                <Flame size={10} /> Trending
              </span>
              <span className="text-xs text-gray-400 font-medium">Most searched in last 24h</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trending.map(coin => (
                <TrendingPill key={coin.id} coin={coin} onClick={handleTrendingClick} />
              ))}
            </div>
          </div>
        )}

        {/* ── SEARCH + CONTROLS ── */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md px-4 py-3 mb-5">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search coin name or symbol..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white text-sm transition shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  <X size={13} />
                </button>
              )}
            </div>

            <select value={currency} onChange={changeCurrency}
              className="px-3 py-2.5 rounded-xl bg-white/80 border border-gray-200 text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer shadow-sm">
              {currencyOptions.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.label}</option>)}
            </select>

            <div className="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm text-sm">
              {[
                { key: "market_cap_rank", label: "Rank",    icon: <BarChart2 size={12} /> },
                { key: "price_change",    label: "Gainers", icon: <TrendingUp size={12} /> },
                { key: "volume",          label: "Volume",  icon: <BarChart2 size={12} /> },
              ].map(s => (
                <button key={s.key} onClick={() => setSortBy(s.key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 font-bold transition ${
                    sortBy === s.key
                      ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white"
                      : "bg-white/80 text-gray-500 hover:bg-indigo-50"
                  }`}>
                  {s.icon}{s.label}
                </button>
              ))}
            </div>
          </div>
          {search && (
            <p className="text-xs text-gray-400 mt-2">
              {filteredCoins.length} result{filteredCoins.length !== 1 ? "s" : ""} for <strong>"{search}"</strong>
            </p>
          )}
        </div>

        {/* ── COIN GRID ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-xl">🪙</span>
            </div>
            <p className="text-gray-500 text-sm font-semibold">Fetching live prices...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-extrabold text-gray-600">
                {filteredCoins.length} <span className="font-normal text-gray-400">coins listed</span>
              </p>
              {refreshing && (
                <span className="flex items-center gap-1.5 text-xs text-indigo-500 font-bold bg-indigo-50 px-3 py-1 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Live updating
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredCoins.map(coin => (
                <CoinCard
                  key={coin.id}
                  coin={coin}
                  symbol={symbol}
                  isSaved={watchlistIds.includes(coin.id)}
                  onWatchlist={addToWatchlist}
                  onBuy={setSelectedCoin}
                  onNavigate={id => navigate(`/coin/${id}`)}
                />
              ))}
              {filteredCoins.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <p className="text-5xl mb-3">🔍</p>
                  <p className="font-semibold text-gray-500">No coins found for "{search}"</p>
                  <button onClick={() => setSearch("")} className="mt-2 text-sm text-indigo-500 hover:underline">Clear search</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── SMART BUY MODAL ── */}
        {selectedCoin && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100">

              <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 px-5 pt-5 pb-5 text-white relative">
                <button onClick={() => { setSelectedCoin(null); setQuantity(""); }}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition">
                  <X size={14} />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <img src={selectedCoin.image} alt={selectedCoin.name} className="w-11 h-11 rounded-full ring-2 ring-white/40 shadow-lg flex-shrink-0" />
                  <div>
                    <h2 className="text-lg font-extrabold leading-tight">{selectedCoin.name}</h2>
                    <p className="text-white/60 text-xs uppercase tracking-widest font-bold">{selectedCoin.symbol}</p>
                  </div>
                  <span className="ml-auto text-[10px] bg-white/20 px-2 py-1 rounded-lg font-bold">#{selectedCoin.market_cap_rank}</span>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-extrabold leading-none">
                    {symbol}{Number(selectedCoin.current_price || 0).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </p>
                  <span className={`text-sm font-extrabold ${(selectedCoin.price_change_percentage_24h ?? 0) >= 0 ? "text-green-300" : "text-red-300"}`}>
                    {(selectedCoin.price_change_percentage_24h ?? 0) >= 0 ? "+" : ""}
                    {(selectedCoin.price_change_percentage_24h ?? 0).toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className={`${sugg.bg} border ${sugg.border} rounded-xl px-4 py-2.5 mb-4`}>
                  <p className={`text-sm font-semibold ${sugg.color}`}>{sugg.text}</p>
                </div>

                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">Quantity</label>
                <input
                  type="number" placeholder="Enter quantity..."
                  value={quantity} onChange={e => setQuantity(e.target.value)}
                  min="0" step="any"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-gray-50 focus:bg-white transition"
                />

                <div className="flex gap-2 mb-4">
                  {[0.1, 0.5, 1, 5].map(v => (
                    <button key={v} onClick={() => setQuantity(v.toString())}
                      className="flex-1 text-xs border border-gray-200 rounded-xl py-2 font-bold text-gray-500 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition">
                      {v}
                    </button>
                  ))}
                </div>

                {quantity && Number(quantity) > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 border border-gray-100">
                    {[
                      { label: "Price / coin", val: `${symbol}${Number(selectedCoin.current_price).toLocaleString()}` },
                      { label: "Quantity",     val: quantity },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between text-sm">
                        <span className="text-gray-400">{r.label}</span>
                        <span className="font-semibold text-gray-700">{r.val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="font-bold text-gray-700">Total</span>
                      <span className="font-extrabold text-indigo-600 text-lg">{symbol}{total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button onClick={confirmBuy}
                  className="w-full bg-gradient-to-r from-blue-500 to-violet-600 text-white py-3 rounded-xl font-extrabold mb-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-indigo-200/50 flex items-center justify-center gap-2">
                  <Zap size={15} /> Confirm Buy
                </button>
                <button onClick={() => { setSelectedCoin(null); setQuantity(""); }}
                  className="w-full bg-gray-100 text-gray-500 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
