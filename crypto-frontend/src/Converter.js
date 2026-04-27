import React, { useEffect, useState, useCallback } from "react";
import { ArrowLeftRight, RefreshCw, TrendingUp, TrendingDown, Zap } from "lucide-react";
import toast from "react-hot-toast";

/* ========================= POPULAR COINS ========================= */
const POPULAR_COINS = [
  { id: "bitcoin",       symbol: "BTC",  name: "Bitcoin",   icon: "₿" },
  { id: "ethereum",      symbol: "ETH",  name: "Ethereum",  icon: "Ξ" },
  { id: "solana",        symbol: "SOL",  name: "Solana",    icon: "◎" },
  { id: "binancecoin",   symbol: "BNB",  name: "BNB",       icon: "B" },
  { id: "ripple",        symbol: "XRP",  name: "XRP",       icon: "✕" },
  { id: "cardano",       symbol: "ADA",  name: "Cardano",   icon: "A" },
  { id: "dogecoin",      symbol: "DOGE", name: "Dogecoin",  icon: "Ð" },
  { id: "polkadot",      symbol: "DOT",  name: "Polkadot",  icon: "●" },
  { id: "avalanche-2",   symbol: "AVAX", name: "Avalanche", icon: "A" },
  { id: "chainlink",     symbol: "LINK", name: "Chainlink", icon: "⬡" },
  { id: "matic-network", symbol: "MATIC",name: "Polygon",   icon: "◈" },
  { id: "litecoin",      symbol: "LTC",  name: "Litecoin",  icon: "Ł" },
];

const FIAT = [
  { id: "usd", symbol: "USD", name: "US Dollar",      sign: "$"    },
  { id: "inr", symbol: "INR", name: "Indian Rupee",   sign: "₹"    },
  { id: "eur", symbol: "EUR", name: "Euro",           sign: "€"    },
  { id: "gbp", symbol: "GBP", name: "British Pound",  sign: "£"    },
  { id: "jpy", symbol: "JPY", name: "Japanese Yen",   sign: "¥"    },
  { id: "aud", symbol: "AUD", name: "Australian Dollar", sign: "A$" },
];

const ALL_OPTIONS = [
  ...POPULAR_COINS.map(c => ({ ...c, type: "crypto" })),
  ...FIAT.map(f => ({ ...f, type: "fiat" })),
];

/* ========================= QUICK PAIRS ========================= */
const QUICK_PAIRS = [
  { from: "bitcoin",  to: "usd",      label: "BTC → USD" },
  { from: "ethereum", to: "usd",      label: "ETH → USD" },
  { from: "bitcoin",  to: "ethereum", label: "BTC → ETH" },
  { from: "solana",   to: "usd",      label: "SOL → USD" },
  { from: "bitcoin",  to: "inr",      label: "BTC → INR" },
  { from: "ethereum", to: "inr",      label: "ETH → INR" },
];

/* ========================= HELPERS ========================= */
function formatNumber(num) {
  if (!num && num !== 0) return "—";
  if (num >= 1e9)  return (num / 1e9).toFixed(2)  + "B";
  if (num >= 1e6)  return (num / 1e6).toFixed(2)  + "M";
  if (num >= 1e3)  return (num / 1e3).toFixed(2)  + "K";
  if (num >= 1)    return num.toFixed(4);
  if (num >= 0.01) return num.toFixed(6);
  return num.toFixed(8);
}

function getOption(id) {
  return ALL_OPTIONS.find(o => o.id === id);
}

/* ========================= MAIN CONVERTER ========================= */
export default function Converter() {
  const [fromId,      setFromId]      = useState("bitcoin");
  const [toId,        setToId]        = useState("usd");
  const [amount,      setAmount]      = useState("1");
  const [prices,      setPrices]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [flipped,     setFlipped]     = useState(false);
  const [coinDetails, setCoinDetails] = useState({});

  /* ── Fetch all prices from CoinGecko ── */
  const fetchPrices = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const coinIds  = POPULAR_COINS.map(c => c.id).join(",");
      const fiatList = FIAT.map(f => f.id).join(",");

      // Get all crypto prices in all fiat currencies
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=${fiatList}&include_24hr_change=true&include_market_cap=true`
      );
      const data = await res.json();
      setPrices(data);
      setLastUpdated(new Date());
    } catch {
      toast.error("Error fetching prices ❌");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* ── Fetch coin details for from/to ── */
  const fetchCoinDetails = useCallback(async () => {
    const cryptoIds = [fromId, toId].filter(id => POPULAR_COINS.find(c => c.id === id));
    if (!cryptoIds.length) return;
    try {
      const res  = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds.join(",")}&sparkline=false`
      );
      const data = await res.json();
      const map  = {};
      data.forEach(c => { map[c.id] = c; });
      setCoinDetails(prev => ({ ...prev, ...map }));
    } catch {}
  }, [fromId, toId]);

  useEffect(() => {
    fetchPrices();
    const iv = setInterval(() => fetchPrices(true), 30000);
    return () => clearInterval(iv);
  }, [fetchPrices]);

  useEffect(() => { fetchCoinDetails(); }, [fetchCoinDetails]);

  /* ── CONVERSION LOGIC ── */
  const getUSDPrice = (id) => {
    if (id === "usd") return 1;
    const fiat = FIAT.find(f => f.id === id);
    if (fiat) {
      // Get USD to fiat rate via bitcoin as bridge
      const btcUsd  = prices["bitcoin"]?.usd  || 1;
      const btcFiat = prices["bitcoin"]?.[id] || 1;
      return btcUsd / btcFiat; // 1 fiat in USD
    }
    return prices[id]?.usd || 0;
  };

  const fromUSD  = getUSDPrice(fromId);
  const toUSD    = getUSDPrice(toId);
  const rate     = toUSD > 0 ? fromUSD / toUSD : 0;
  const result   = (Number(amount) || 0) * rate;

  // 24h change for from coin
  const fromOption  = getOption(fromId);
  const toOption    = getOption(toId);
  const fromCrypto  = POPULAR_COINS.find(c => c.id === fromId);
  const fromChange  = fromCrypto ? (prices[fromId]?.usd_24h_change ?? 0) : 0;
  const isUp        = fromChange >= 0;

  /* ── SWAP ── */
  const handleSwap = () => {
    setFlipped(f => !f);
    setFromId(toId);
    setToId(fromId);
  };

  /* ── QUICK PAIR ── */
  const applyQuickPair = (pair) => {
    setFromId(pair.from);
    setToId(pair.to);
    setAmount("1");
  };

  /* ── COPY RESULT ── */
  const copyResult = () => {
    navigator.clipboard?.writeText(formatNumber(result));
    toast.success("Copied! 📋");
  };

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

      <div className="relative max-w-2xl mx-auto px-6 py-6">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-transparent bg-clip-text">
                Crypto Converter
              </h1>
              <span className="text-2xl">💱</span>
            </div>
            <p className="text-gray-500 text-sm font-medium">Real-time rates · CoinGecko powered</p>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-gray-400 bg-white/80 px-3 py-1.5 rounded-xl border border-white/60 shadow-sm">
                🕐 {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button onClick={() => fetchPrices(true)}
              className={`p-2.5 rounded-xl bg-white/80 border border-white/60 shadow-sm hover:bg-indigo-50 hover:text-indigo-500 transition text-gray-400 ${refreshing ? "animate-spin" : ""}`}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* QUICK PAIRS */}
        <div className="flex flex-wrap gap-2 mb-5">
          {QUICK_PAIRS.map(pair => (
            <button key={pair.label} onClick={() => applyQuickPair(pair)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                fromId === pair.from && toId === pair.to
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-md"
                  : "bg-white/70 text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
              }`}>
              {pair.label}
            </button>
          ))}
        </div>

        {/* MAIN CONVERTER CARD */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl p-6 mb-5">

          {/* FROM */}
          <div className="mb-3">
            <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2 block">From</label>
            <div className="flex gap-3">
              <select
                value={fromId}
                onChange={e => setFromId(e.target.value)}
                className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
              >
                <optgroup label="🪙 Crypto">
                  {POPULAR_COINS.map(c => <option key={c.id} value={c.id}>{c.symbol} — {c.name}</option>)}
                </optgroup>
                <optgroup label="💵 Fiat">
                  {FIAT.map(f => <option key={f.id} value={f.id}>{f.symbol} — {f.name}</option>)}
                </optgroup>
              </select>

              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="0"
                step="any"
                placeholder="Enter amount..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition"
              />
            </div>

            {/* From coin info */}
            {fromCrypto && prices[fromId] && (
              <div className="flex items-center gap-2 mt-2 ml-1">
                <span className="text-xs text-gray-400">
                  1 {fromOption?.symbol} = ${prices[fromId]?.usd?.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
                <span className={`flex items-center gap-0.5 text-xs font-bold ${isUp ? "text-green-500" : "text-red-500"}`}>
                  {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {isUp ? "+" : ""}{fromChange.toFixed(2)}% 24h
                </span>
              </div>
            )}
          </div>

          {/* SWAP BUTTON */}
          <div className="flex items-center justify-center my-4">
            <button
              onClick={handleSwap}
              className={`w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg hover:shadow-indigo-200 hover:scale-110 active:scale-95 transition-all duration-200 ${flipped ? "rotate-180" : ""}`}
              style={{ transition: "transform 0.3s ease" }}
            >
              <ArrowLeftRight size={18} />
            </button>
          </div>

          {/* TO */}
          <div className="mb-5">
            <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2 block">To</label>
            <div className="flex gap-3">
              <select
                value={toId}
                onChange={e => setToId(e.target.value)}
                className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
              >
                <optgroup label="🪙 Crypto">
                  {POPULAR_COINS.map(c => <option key={c.id} value={c.id}>{c.symbol} — {c.name}</option>)}
                </optgroup>
                <optgroup label="💵 Fiat">
                  {FIAT.map(f => <option key={f.id} value={f.id}>{f.symbol} — {f.name}</option>)}
                </optgroup>
              </select>

              {/* Result */}
              <button
                onClick={copyResult}
                title="Click to copy"
                className="flex-1 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl px-4 py-3 text-left hover:from-indigo-100 hover:to-violet-100 transition group"
              >
                {loading ? (
                  <div className="h-7 bg-gray-200 rounded animate-pulse w-3/4" />
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-extrabold text-indigo-700">
                      {formatNumber(result)}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition">
                      Copy 📋
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* RATE DISPLAY */}
          {!loading && rate > 0 && (
            <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70 font-bold uppercase tracking-widest mb-0.5">Exchange Rate</p>
                  <p className="text-lg font-extrabold">
                    1 {fromOption?.symbol} = {formatNumber(rate)} {toOption?.symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70 font-bold uppercase tracking-widest mb-0.5">Inverse</p>
                  <p className="text-sm font-bold text-white/90">
                    1 {toOption?.symbol} = {formatNumber(1 / rate)} {fromOption?.symbol}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QUICK AMOUNT BUTTONS */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-4 mb-5">
          <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3">Quick Amounts</p>
          <div className="flex flex-wrap gap-2">
            {[0.001, 0.01, 0.1, 0.5, 1, 5, 10, 100].map(v => (
              <button key={v} onClick={() => setAmount(v.toString())}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  amount === v.toString()
                    ? "bg-indigo-500 text-white border-transparent shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* MULTI CURRENCY TABLE */}
        {fromCrypto && Object.keys(prices).length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={13} className="text-indigo-500" />
              <p className="text-xs font-extrabold text-gray-600 uppercase tracking-widest">
                {fromOption?.symbol} in All Currencies
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {FIAT.map(fiat => {
                const val = prices[fromId]?.[fiat.id];
                return val ? (
                  <div key={fiat.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{fiat.symbol}</p>
                    <p className="text-sm font-extrabold text-gray-800 mt-0.5">
                      {fiat.sign}{Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* COIN STATS */}
        {fromCrypto && coinDetails[fromId] && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-4">
            <div className="flex items-center gap-3 mb-3">
              <img src={coinDetails[fromId]?.image} alt={fromOption?.name} className="w-8 h-8 rounded-full" />
              <div>
                <p className="font-extrabold text-gray-800 text-sm">{fromOption?.name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{fromOption?.symbol}</p>
              </div>
              <span className={`ml-auto text-xs font-extrabold px-2.5 py-1 rounded-xl ${isUp ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                {isUp ? "+" : ""}{fromChange.toFixed(2)}% 24h
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Market Cap",  val: `$${formatNumber(coinDetails[fromId]?.market_cap)}`    },
                { label: "24h High",    val: `$${formatNumber(coinDetails[fromId]?.high_24h)}`      },
                { label: "24h Low",     val: `$${formatNumber(coinDetails[fromId]?.low_24h)}`       },
                { label: "Volume",      val: `$${formatNumber(coinDetails[fromId]?.total_volume)}`  },
                { label: "Rank",        val: `#${coinDetails[fromId]?.market_cap_rank}`             },
                { label: "Circulating", val: `${formatNumber(coinDetails[fromId]?.circulating_supply)} ${fromOption?.symbol}` },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
                  <p className="text-xs font-extrabold text-gray-700 mt-0.5 truncate">{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
