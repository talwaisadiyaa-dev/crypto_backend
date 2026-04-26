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

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, positive ? "rgba(99,102,241,0.18)" : "rgba(239,68,68,0.18)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    data.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.strokeStyle = positive ? "#6366f1" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // End dot
    const lx = toX(data.length - 1), ly = toY(data[data.length - 1]);
    ctx.beginPath();
    ctx.arc(lx, ly, 3, 0, Math.PI * 2);
    ctx.fillStyle = positive ? "#6366f1" : "#ef4444";
    ctx.fill();
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
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden relative cursor-pointer">

      {/* Top accent bar */}
      <div className={`h-1 w-full ${isUp ? "bg-gradient-to-r from-indigo-400 via-violet-500 to-purple-400" : "bg-gradient-to-r from-red-400 to-pink-400"}`} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-0">
        <div className="flex items-center gap-2.5 flex-1 min-w-0" onClick={() => onNavigate(coin.id)}>
          <div className="relative flex-shrink-0">
            <img src={coin.image} alt={coin.name} className="w-9 h-9 rounded-full ring-2 ring-gray-100 group-hover:ring-indigo-100 transition-all" />
            <span className="absolute -bottom-1 -right-1 text-[8px] bg-white border border-gray-200 text-gray-500 font-bold px-1 rounded-full leading-4 shadow-sm">
              #{coin.market_cap_rank}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-gray-800 text-sm leading-tight truncate group-hover:text-indigo-600 transition-colors">{coin.name}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{coin.symbol}</p>
          </div>
        </div>

        {/* Pin */}
        <button
          onClick={() => onWatchlist(coin)}
          disabled={isSaved}
          className={`flex-shrink-0 p-1.5 rounded-xl transition-all ${isSaved ? "text-indigo-500 bg-indigo-50" : "text-gray-200 hover:text-indigo-400 hover:bg-indigo-50"}`}
        >
          <Pin size={12} fill={isSaved ? "#6366f1" : "none"} />
        </button>
      </div>

      {/* Sparkline */}
      <div className="px-2 pt-2 pb-0" onClick={() => onNavigate(coin.id)}>
        <Sparkline data={spark} positive={isUp} />
      </div>

      {/* Price */}
      <div className="px-4 pb-2 pt-1" onClick={() => onNavigate(coin.id)}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Price</p>
            <p className="text-lg font-extrabold text-gray-900 leading-none">
              {symbol}{coin.current_price
                ? Number(coin.current_price).toLocaleString(undefined, { maximumFractionDigits: 4 })
                : "0.00"}
            </p>
          </div>
          <div className={`flex items-center gap-0.5 text-xs font-extrabold px-2.5 py-1 rounded-xl ${
            isUp ? "bg-indigo-50 text-indigo-600" : "bg-red-50 text-red-500"
          }`}>
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
          </div>
        </div>

        {/* MCap + Vol */}
        <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-gray-50">
          <div className="flex-1 text-center bg-gray-50 rounded-lg py-1.5">
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">MCap</p>
            <p className="text-[11px] font-extrabold text-gray-600">{symbol}{mcap}</p>
          </div>
          <div className="flex-1 text-center bg-gray-50 rounded-lg py-1.5">
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Vol 24h</p>
            <p className="text-[11px] font-extrabold text-gray-600">{symbol}{vol}</p>
          </div>
        </div>
      </div>

      {/* Smart Buy button */}
      <button
        onClick={() => onBuy(coin)}
        className={`mx-3 mb-3 py-2.5 text-white text-xs font-extrabold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm ${
          isUp
            ? "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-indigo-200"
            : "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700"
        }`}
      >
        <Zap size={11} /> Smart Buy
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
      className="flex items-center gap-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-xl px-3 py-2 transition-all"
    >
      <img src={coin.small} alt={coin.name} className="w-5 h-5 rounded-full flex-shrink-0" />
      <div className="text-left min-w-0">
        <p className="text-xs font-bold text-gray-700 truncate max-w-[70px]">{coin.name}</p>
        <p className="text-[9px] text-gray-400 uppercase font-semibold">{coin.symbol}</p>
      </div>
      <span className={`text-[10px] font-extrabold flex-shrink-0 ${isUp ? "text-indigo-500" : "text-red-500"}`}>
        {isUp ? "▲" : "▼"}{Math.abs(coin.data?.price_change_percentage_24h?.usd ?? 0).toFixed(1)}%
      </span>
    </button>
  );
}

/* ========================= STAT CARD ========================= */
function StatCard({ icon, label, value, bg }) {
  return (
    <div className={`${bg} rounded-2xl border border-white shadow-sm p-4 flex items-center gap-3`}>
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">{label}</p>
        <p className="text-base font-extrabold text-gray-800 truncate">{value}</p>
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
  const API = "http://localhost:5000/api/watchlist";

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

  /* ── FETCH ── */
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
      const res  = await fetch(`${API}/${userId}`);
      const data = await res.json();
      setWatchlistIds(Array.isArray(data) ? data.map(c => c.coinId) : []);
    } catch {}
  };

  useEffect(() => {
    fetchCoins(); fetchTrending(); fetchWatchlist();
    const iv = setInterval(() => fetchCoins(true), 30000);
    return () => clearInterval(iv);
  }, [fetchCoins]);

  /* ── FILTER + SORT ── */
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

  /* ── MARKET STATS ── */
  const stats = useMemo(() => {
    if (!coins.length) return null;
    const gainers   = coins.filter(c => (c.price_change_percentage_24h ?? 0) > 0).length;
    const losers    = coins.filter(c => (c.price_change_percentage_24h ?? 0) < 0).length;
    const totalVol  = coins.reduce((a, c) => a + (c.total_volume || 0), 0);
    const topGainer = [...coins].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0))[0];
    return { gainers, losers, totalVol, topGainer };
  }, [coins]);

  /* ── CURRENCY ── */
  const changeCurrency = (e) => {
    const s = currencyOptions.find(c => c.code === e.target.value);
    setCurrency(s.code); setSymbol(s.symbol);
  };

  /* ── WATCHLIST ── */
  const addToWatchlist = async (coin) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return toast.error("Login required ❌");
    try {
      await fetch(`${API}/add`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinName: coin.name, coinId: coin.id.toLowerCase(), amount: 1, buyPrice: Number(coin.current_price) || 0, userId }),
      });
      toast.success("Saved 📌"); fetchWatchlist();
    } catch { toast.error("Error ❌"); }
  };

  /* ── BUY ── */
  const confirmBuy = async () => {
    const userId = localStorage.getItem("userId");
    const qty = Number(quantity), price = Number(selectedCoin?.current_price);
    if (!userId)        return toast.error("Login required ❌");
    if (!qty || qty<=0) return toast.error("Enter valid quantity");
    if (!price)         return toast.error("Invalid price");
    try {
      await fetch("http://localhost:5000/api/portfolio/buy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin: selectedCoin.id.toLowerCase(), price, quantity: qty, image: selectedCoin.image, userId }),
      });
      toast.success("Added to Portfolio 🚀");
      setSelectedCoin(null); setQuantity("");
    } catch { toast.error("Error ❌"); }
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

  /* ========================= RENDER ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text leading-tight">
              CryptoTrack 🚀
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Live prices · Portfolio tracker · Smart Buy</p>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                🕐 {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchCoins(true)}
              className={`p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-500 transition text-gray-400 ${refreshing ? "animate-spin" : ""}`}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* ── MARKET STAT CARDS ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard icon="📈" label="Gainers"    value={`${stats.gainers} coins`}                                     bg="bg-indigo-50" />
            <StatCard icon="📉" label="Losers"     value={`${stats.losers} coins`}                                      bg="bg-red-50"    />
            <StatCard icon="💹" label="24h Volume" value={`${symbol}${(stats.totalVol / 1e9).toFixed(1)}B`}             bg="bg-blue-50"   />
            <StatCard icon="🏆" label="Top Gainer" value={stats.topGainer ? `${stats.topGainer.symbol?.toUpperCase()} +${(stats.topGainer.price_change_percentage_24h ?? 0).toFixed(1)}%` : "—"} bg="bg-violet-50" />
          </div>
        )}

        {/* ── TRENDING ── */}
        {trending.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 mb-4">
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-5">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search coin name or symbol..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white text-sm transition"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Currency */}
            <select value={currency} onChange={changeCurrency}
              className="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
              {currencyOptions.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.label}</option>)}
            </select>

            {/* Sort */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm">
              {[
                { key: "market_cap_rank", label: "Rank",    icon: <BarChart2 size={12} /> },
                { key: "price_change",    label: "Gainers", icon: <TrendingUp size={12} /> },
                { key: "volume",          label: "Volume",  icon: <BarChart2 size={12} /> },
              ].map(s => (
                <button key={s.key} onClick={() => setSortBy(s.key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 font-bold transition ${
                    sortBy === s.key
                      ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white"
                      : "bg-white text-gray-400 hover:bg-gray-50"
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
            <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm font-semibold">Fetching live prices...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-extrabold text-gray-600">
                {filteredCoins.length} <span className="font-normal text-gray-400">coins</span>
              </p>
              {refreshing && (
                <span className="flex items-center gap-1.5 text-xs text-indigo-500 font-bold">
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 px-5 pt-5 pb-5 text-white relative">
                <button onClick={() => { setSelectedCoin(null); setQuantity(""); }}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition">
                  <X size={14} />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <img src={selectedCoin.image} alt={selectedCoin.name} className="w-11 h-11 rounded-full ring-2 ring-white/30 flex-shrink-0" />
                  <div>
                    <h2 className="text-lg font-extrabold leading-tight">{selectedCoin.name}</h2>
                    <p className="text-white/60 text-xs uppercase tracking-wider font-bold">{selectedCoin.symbol}</p>
                  </div>
                  <span className="ml-auto text-[10px] bg-white/20 px-2 py-1 rounded-lg font-bold">
                    #{selectedCoin.market_cap_rank}
                  </span>
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

              {/* Body */}
              <div className="p-5">
                {/* AI Suggestion */}
                <div className={`${sugg.bg} border ${sugg.border} rounded-xl px-4 py-2.5 mb-4`}>
                  <p className={`text-sm font-semibold ${sugg.color}`}>{sugg.text}</p>
                </div>

                {/* Quantity */}
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wide mb-1.5">Quantity</label>
                <input
                  type="number"
                  placeholder="Enter quantity..."
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  min="0" step="any"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-gray-50 focus:bg-white transition"
                />

                {/* Quick qty */}
                <div className="flex gap-2 mb-4">
                  {[0.1, 0.5, 1, 5].map(v => (
                    <button key={v} onClick={() => setQuantity(v.toString())}
                      className="flex-1 text-xs border border-gray-200 rounded-xl py-2 font-bold text-gray-500 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition">
                      {v}
                    </button>
                  ))}
                </div>

                {/* Order Summary */}
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
                  className="w-full bg-gradient-to-r from-blue-500 to-violet-600 text-white py-3 rounded-xl font-extrabold mb-2 hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
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
