import React, { useEffect, useState, useRef } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, Label,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, LabelList, ReferenceLine
} from "recharts";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import autoTable from "jspdf-autotable";

/* ========================= CONSTANTS ========================= */
const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#8B5CF6", "#EC4899", "#14B8A6"];

const POPULAR_COINS = [
  { id: "bitcoin",       name: "Bitcoin",   symbol: "BTC" },
  { id: "ethereum",      name: "Ethereum",  symbol: "ETH" },
  { id: "solana",        name: "Solana",    symbol: "SOL" },
  { id: "binancecoin",   name: "BNB",       symbol: "BNB" },
  { id: "ripple",        name: "XRP",       symbol: "XRP" },
  { id: "cardano",       name: "Cardano",   symbol: "ADA" },
  { id: "dogecoin",      name: "Dogecoin",  symbol: "DOGE" },
  { id: "polkadot",      name: "Polkadot",  symbol: "DOT" },
  { id: "avalanche-2",   name: "Avalanche", symbol: "AVAX" },
  { id: "chainlink",     name: "Chainlink", symbol: "LINK" },
  { id: "matic-network", name: "Polygon",   symbol: "MATIC" },
  { id: "shiba-inu",     name: "Shiba Inu", symbol: "SHIB" },
  { id: "uniswap",       name: "Uniswap",   symbol: "UNI" },
  { id: "litecoin",      name: "Litecoin",  symbol: "LTC" },
  { id: "tron",          name: "TRON",      symbol: "TRX" },
];

/* ========================= CUSTOM TOOLTIP (Bar) ========================= */
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const inv = payload.find(p => p.dataKey === "investment");
  const cur = payload.find(p => p.dataKey === "current");
  const pl  = cur && inv ? cur.value - inv.value : 0;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-bold text-gray-800 mb-2 uppercase">{label}</p>
      {inv && <p className="text-indigo-600">📥 Investment: <strong>${inv.value.toFixed(2)}</strong></p>}
      {cur && <p className="text-green-600">💰 Current: <strong>${cur.value.toFixed(2)}</strong></p>}
      <p className={`mt-1 font-semibold ${pl >= 0 ? "text-green-600" : "text-red-500"}`}>
        {pl >= 0 ? "▲" : "▼"} P/L: ${pl.toFixed(2)}
      </p>
    </div>
  );
};

/* ========================= CUSTOM TOOLTIP (Donut) ========================= */
const CustomDonutTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold uppercase" style={{ color: item.payload.fill }}>{item.name}</p>
      <p className="text-gray-600">Value: <strong>${item.value.toFixed(2)}</strong></p>
      <p className="text-gray-600">Share: <strong>{(item.payload.percent * 100).toFixed(1)}%</strong></p>
    </div>
  );
};

/* ========================= CUSTOM LEGEND (Donut) ========================= */
const CustomDonutLegend = ({ payload }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
    {payload.map((entry, i) => (
      <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
        <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: entry.color }} />
        <span className="uppercase font-medium">{entry.value}</span>
      </div>
    ))}
  </div>
);

/* ========================= DONUT CENTER LABEL ========================= */
const DonutCenterLabel = ({ viewBox, totalValue }) => {
  const { cx, cy } = viewBox;
  return (
    <>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#1f2937" style={{ fontSize: 14, fontWeight: 700 }}>
        ${totalValue >= 1000 ? (totalValue / 1000).toFixed(1) + "k" : totalValue.toFixed(0)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af" style={{ fontSize: 10 }}>
        Total Value
      </text>
    </>
  );
};

/* ========================= TRADE MODAL ========================= */
function TradeModal({ item, mode, onClose, onDone }) {
  const [orderType,  setOrderType]  = useState("market");
  const [qty,        setQty]        = useState("1");
  const [limitPrice, setLimitPrice] = useState(item.currentPrice?.toFixed(2) || "");
  const [loading,    setLoading]    = useState(false);

  const isBuy      = mode === "BUY";
  const execPrice  = orderType === "market" ? item.currentPrice : Number(limitPrice);
  const totalValue = (Number(qty) || 0) * (execPrice || 0);

  const handleSubmit = async () => {
    if (!qty || isNaN(qty) || Number(qty) <= 0)
      return toast.error("Enter valid quantity");
    if (orderType === "limit" && (!limitPrice || isNaN(limitPrice) || Number(limitPrice) <= 0))
      return toast.error("Enter valid limit price");
    const userId = localStorage.getItem("userId");
    setLoading(true);
    try {
      await fetch(isBuy ? "https://crypto-backend-2ryf.onrender.com/api/portfolio/buy" : "https://crypto-backend-2ryf.onrender.com/api/portfolio/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin: item.coin, price: execPrice, quantity: Number(qty), userId, orderType }),
      });
      toast.success(isBuy
        ? `Bought ${qty} ${item.coin.toUpperCase()} @ $${execPrice.toFixed(2)} ✅`
        : `Sold ${qty} ${item.coin.toUpperCase()} @ $${execPrice.toFixed(2)} 💰`);
      onDone(); onClose();
    } catch { toast.error("Order failed ❌"); }
    finally  { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">{isBuy ? "🟢 Buy" : "🟡 Sell"} {item.coin.toUpperCase()}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Market price: <span className="font-semibold text-gray-700">${item.currentPrice.toFixed(2)}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-4">
          {["market", "limit"].map(type => (
            <button key={type} onClick={() => setOrderType(type)}
              className={`flex-1 py-2 text-sm font-semibold transition ${orderType === type ? (isBuy ? "bg-green-500 text-white" : "bg-yellow-500 text-white") : "bg-white text-gray-500 hover:bg-gray-50"}`}>
              {type === "market" ? "📈 Market" : "🎯 Limit"}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-4 bg-gray-50 rounded-lg px-3 py-2">
          {orderType === "market" ? "Market order executes immediately at current price." : "Limit order executes only when price reaches your target."}
        </p>

        {orderType === "limit" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Limit Price (USD)</label>
            <input type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
              placeholder={item.currentPrice.toFixed(2)} min="0" step="any"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            {limitPrice && !isNaN(limitPrice) && (
              <p className="text-xs mt-1">
                {isBuy
                  ? Number(limitPrice) < item.currentPrice
                    ? <span className="text-green-600">✅ Good — buying below market</span>
                    : <span className="text-orange-500">⚠️ Limit above market price</span>
                  : Number(limitPrice) > item.currentPrice
                    ? <span className="text-green-600">✅ Good — selling above market</span>
                    : <span className="text-orange-500">⚠️ Limit below market price</span>}
              </p>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
          <div className="flex items-center gap-2">
            <button onClick={() => setQty(q => Math.max(0.01, Number(q) - 1).toString())}
              className="w-9 h-9 rounded-lg border border-gray-300 text-lg font-bold hover:bg-gray-100 flex items-center justify-center">−</button>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} min="0" step="any"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <button onClick={() => setQty(q => (Number(q) + 1).toString())}
              className="w-9 h-9 rounded-lg border border-gray-300 text-lg font-bold hover:bg-gray-100 flex items-center justify-center">+</button>
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {[0.1, 0.25, 0.5, 1].map(v => (
            <button key={v} onClick={() => setQty(v.toString())}
              className="flex-1 text-xs border border-gray-200 rounded-lg py-1 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition">{v}</button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-5 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-gray-500">Order type</span><span className="font-medium capitalize">{orderType}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Price</span><span className="font-medium">${execPrice ? execPrice.toFixed(2) : "—"}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="font-medium">{qty || 0}</span></div>
          <div className="flex justify-between border-t border-gray-200 pt-1">
            <span className="text-gray-700 font-semibold">Total</span>
            <span className={`font-bold ${isBuy ? "text-green-600" : "text-yellow-600"}`}>${totalValue.toFixed(2)}</span>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-white transition disabled:opacity-50 ${isBuy ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}`}>
          {loading ? "Processing..." : `${isBuy ? "Confirm Buy" : "Confirm Sell"} — $${totalValue.toFixed(2)}`}
        </button>
      </motion.div>
    </div>
  );
}

/* ========================= HELPERS ========================= */
const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-4">
    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
  </div>
);

const StatCard = ({ title, value, sub, color, icon }) => (
  <motion.div whileHover={{ scale: 1.03, y: -2 }} transition={{ type: "spring", stiffness: 300 }}
    className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 flex flex-col gap-1">
    <div className="flex justify-between items-start">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</span>
      <span className="text-lg">{icon}</span>
    </div>
    <p className={`text-2xl font-bold mt-1 ${color || "text-gray-800"}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </motion.div>
);

/* ========================= MAIN DASHBOARD ========================= */
export default function Dashboard() {
  const [portfolio,  setPortfolio]  = useState([]);
  const [history,    setHistory]    = useState([]);
  const [suggestion, setSuggestion] = useState("");
  const [activeTab,  setActiveTab]  = useState("ALL");
  const [tradeItem,  setTradeItem]  = useState(null);

  const [showAddForm,   setShowAddForm]   = useState(false);
  const [coinSearch,    setCoinSearch]    = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCoin,  setSelectedCoin]  = useState(null);
  const [addQty,        setAddQty]        = useState("");
  const [addPrice,      setAddPrice]      = useState("");
  const [addLoading,    setAddLoading]    = useState(false);
  const [livePrice,     setLivePrice]     = useState(null);

  const [showAlerts,  setShowAlerts]  = useState(false);
  const [alerts,      setAlerts]      = useState(() => {
    try { return JSON.parse(localStorage.getItem("priceAlerts") || "[]"); } catch { return []; }
  });
  const [alertCoin,   setAlertCoin]   = useState("");
  const [alertTarget, setAlertTarget] = useState("");
  const [alertType,   setAlertType]   = useState("above");
  const alertsCheckedRef              = useRef({});

  /* ========================= FETCH ========================= */
  const fetchPortfolio = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const res  = await fetch(`https://crypto-backend-2ryf.onrender.com/api/portfolio/${userId}`);
      const data = await res.json();
      if (!data || data.length === 0) { setPortfolio([]); return; }
      const coinIds  = data.map(i => i.coin?.toLowerCase()).filter(Boolean).join(",");
      if (!coinIds)  { setPortfolio(data); return; }
      const priceRes  = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`);
      const priceData = await priceRes.json();
      setPortfolio(data.map(item => {
        const coinId = item.coin?.toLowerCase();
        return { ...item, coin: coinId, price: Number(item.price) || 0, quantity: Number(item.quantity) || 0, currentPrice: priceData[coinId]?.usd ?? Number(item.price), change24h: priceData[coinId]?.usd_24h_change ?? 0 };
      }));
    } catch (err) { console.log(err); toast.error("Error loading data ❌"); }
  };

  useEffect(() => {
    fetchPortfolio();
    const fetchHistory = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const res = await fetch(`https://crypto-backend-2ryf.onrender.com/api/transactions/${userId}`);
      setHistory(await res.json());
    };
    fetchHistory();
    const interval = setInterval(() => { fetchPortfolio(); fetchHistory(); }, 15000);
    return () => clearInterval(interval);
  }, []);

  /* ========================= ALERT CHECKER ========================= */
  useEffect(() => {
    if (!alerts.length || !portfolio.length) return;
    alerts.forEach(alert => {
      const coin    = portfolio.find(p => p.coin?.toLowerCase() === alert.coin?.toLowerCase());
      if (!coin) return;
      const key     = `${alert.id}`;
      const fired   = alertsCheckedRef.current[key];
      const trigger = (alert.type === "above" && coin.currentPrice >= alert.target) || (alert.type === "below" && coin.currentPrice <= alert.target);
      if (trigger && !fired) {
        alertsCheckedRef.current[key] = true;
        toast(`🔔 ${alert.coin.toUpperCase()} ${alert.type === "above" ? "above" : "below"} $${alert.target} | Now: $${coin.currentPrice.toFixed(2)}`,
          { duration: 6000, style: { background: alert.type === "above" ? "#dcfce7" : "#fee2e2", color: "#1f2937", fontWeight: "600" } });
      }
      if (!trigger && fired) delete alertsCheckedRef.current[key];
    });
  }, [portfolio, alerts]);

  /* ========================= DELETE ========================= */
  const deleteCoin = async (id) => {
    try {
      await fetch(`https://crypto-backend-2ryf.onrender.com/api/portfolio/${id}`, { method: "DELETE" });
      setPortfolio(prev => prev.filter(c => c._id !== id));
      toast.success("Deleted ✅");
    } catch { toast.error("Delete failed ❌"); }
  };

  /* ========================= COIN SEARCH ========================= */
  useEffect(() => {
    const q = coinSearch.toLowerCase().trim();
    if (!q) { setSearchResults([]); return; }
    setSearchResults(POPULAR_COINS.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)).slice(0, 6));
  }, [coinSearch]);

  const selectCoin = async (coin) => {
    setSelectedCoin(coin); setCoinSearch(coin.name); setSearchResults([]); setLivePrice(null);
    try {
      const res  = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd`);
      const data = await res.json();
      const p    = data[coin.id]?.usd;
      if (p) { setLivePrice(p); setAddPrice(p.toString()); }
    } catch { toast.error("Could not fetch live price"); }
  };

  const handleAddCoin = async () => {
    if (!selectedCoin)                                          return toast.error("Select a coin first");
    if (!addQty   || isNaN(addQty)   || Number(addQty) <= 0)   return toast.error("Enter valid quantity");
    if (!addPrice || isNaN(addPrice) || Number(addPrice) <= 0)  return toast.error("Enter valid price");
    const userId = localStorage.getItem("userId");
    if (!userId) return toast.error("Login required");
    setAddLoading(true);
    try {
      await fetch("https://crypto-backend-2ryf.onrender.com/api/portfolio/buy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin: selectedCoin.id, price: Number(addPrice), quantity: Number(addQty), userId }),
      });
      toast.success(`${selectedCoin.symbol} added ✅`);
      setShowAddForm(false); setCoinSearch(""); setSelectedCoin(null); setAddQty(""); setAddPrice(""); setLivePrice(null);
      fetchPortfolio();
    } catch { toast.error("Failed to add coin ❌"); }
    finally  { setAddLoading(false); }
  };

  /* ========================= ALERTS ========================= */
  const saveAlerts = (u) => { setAlerts(u); localStorage.setItem("priceAlerts", JSON.stringify(u)); };
  const addAlert   = () => {
    if (!alertCoin.trim()) return toast.error("Enter coin name");
    if (!alertTarget || isNaN(alertTarget) || Number(alertTarget) <= 0) return toast.error("Enter valid price");
    saveAlerts([...alerts, { id: Date.now(), coin: alertCoin.trim().toLowerCase(), target: Number(alertTarget), type: alertType, createdAt: new Date().toISOString() }]);
    setAlertCoin(""); setAlertTarget(""); toast.success("Alert set ✅");
  };
  const deleteAlert = (id) => saveAlerts(alerts.filter(a => a.id !== id));

  /* ========================= CALCULATIONS ========================= */
  const totalInvestment = portfolio.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const totalCurrent    = portfolio.reduce((acc, i) => acc + i.currentPrice * i.quantity, 0);
  const profitLoss      = totalCurrent - totalInvestment;
  const profitPercent   = totalInvestment ? ((profitLoss / totalInvestment) * 100).toFixed(2) : 0;

  const sortedPL  = [...portfolio].sort((a, b) => (b.currentPrice - b.price) * b.quantity - (a.currentPrice - a.price) * a.quantity);
  const bestCoin  = sortedPL[0];
  const worstCoin = sortedPL[sortedPL.length - 1];
  const gainers   = sortedPL.slice(0, 3);
  const losers    = sortedPL.slice(-3).reverse();

  useEffect(() => {
    if (profitPercent > 20)       setSuggestion("💰 Book Profit");
    else if (profitPercent < -10) setSuggestion("📉 Average Down");
    else                          setSuggestion("🤝 Hold");
  }, [profitPercent]);

  /* ========================= CHART DATA ========================= */
  const groupedData = Object.values(
    portfolio.reduce((acc, item) => {
      if (!acc[item.coin]) acc[item.coin] = { name: item.coin.toUpperCase(), investment: 0, current: 0 };
      acc[item.coin].investment += item.price * item.quantity;
      acc[item.coin].current    += item.currentPrice * item.quantity;
      return acc;
    }, {})
  ).map(d => ({ ...d, investment: parseFloat(d.investment.toFixed(2)), current: parseFloat(d.current.toFixed(2)) }));

  const pieData = Object.values(
    portfolio.reduce((acc, item) => {
      if (!acc[item.coin]) acc[item.coin] = { name: item.coin.toUpperCase(), value: 0 };
      acc[item.coin].value += item.currentPrice * item.quantity;
      return acc;
    }, {})
  ).map(d => ({ ...d, value: parseFloat(d.value.toFixed(2)) }));

  /* ========================= CSV ========================= */
  const csvData = portfolio.map(item => {
    const inv = item.price * item.quantity, cur = item.currentPrice * item.quantity, pl = cur - inv;
    const pct = inv ? ((pl / inv) * 100).toFixed(2) : 0;
    return {
      Coin: item.coin.toUpperCase(), AvgBuyPrice: item.price.toFixed(2), CurrentPrice: item.currentPrice.toFixed(2),
      "24h Change": item.change24h ? item.change24h.toFixed(2) + "%" : "N/A", Quantity: item.quantity,
      Investment: inv.toFixed(2), CurrentValue: cur.toFixed(2), ProfitLoss: pl.toFixed(2),
      ReturnPercent: pct + "%", Status: pct > 15 ? "PROFIT 💰" : pct < -10 ? "RISK ⚠️" : "HOLD 🤝",
    };
  });

  /* ========================= PDF ========================= */
  const downloadPDF = () => {
    const pdf = new jsPDF(), today = new Date().toLocaleString(), reportId = "CR-" + Math.floor(Math.random() * 100000);
    pdf.setFillColor(41, 128, 185); pdf.rect(0, 0, 210, 22, "F");
    pdf.setTextColor(255); pdf.setFontSize(16); pdf.text("Crypto Portfolio Report", 14, 14);
    pdf.setFontSize(9); pdf.text(today, 150, 14); pdf.setTextColor(0);

    const inv = portfolio.reduce((a, i) => a + i.price * i.quantity, 0);
    const cur = portfolio.reduce((a, i) => a + i.currentPrice * i.quantity, 0);
    const prf = cur - inv, pct = inv ? ((prf / inv) * 100).toFixed(2) : 0;
    const ai  = pct > 25 ? "Strong Sell" : pct > 10 ? "Book Profit" : pct < -15 ? "High Risk" : pct < 0 ? "Accumulate Slowly" : "Hold";

    const sec = (text, y) => {
      pdf.setFontSize(12); pdf.setTextColor(41, 128, 185); pdf.text(text, 14, y);
      pdf.setDrawColor(200); pdf.line(14, y + 2, 196, y + 2); pdf.setTextColor(0);
    };

    sec("Portfolio Summary", 30);
    pdf.setFillColor(245, 245, 245); pdf.rect(14, 34, 180, 48, "F"); pdf.setFontSize(10);
    pdf.text(`Total Investment : $${inv.toFixed(2)}`, 18, 44);
    pdf.text(`Current Value   : $${cur.toFixed(2)}`,  18, 52);
    pdf.text(`Profit / Loss   : $${prf.toFixed(2)}`,  18, 60);
    pdf.text(`Return          : ${pct}%`,             18, 68);
    pdf.text(`Suggestion      : ${ai}`,               110, 44);
    if (bestCoin)  pdf.text(`Top Gainer : ${bestCoin.coin.toUpperCase()}`,  110, 52);
    if (worstCoin) pdf.text(`Top Loser  : ${worstCoin.coin.toUpperCase()}`, 110, 60);

    sec("Detailed Holdings", 88);
    autoTable(pdf, {
      startY: 93,
      head: [["Coin", "Buy $", "Now $", "24h %", "Qty", "Value", "P/L", "Return", "Status"]],
      body: portfolio.map(item => {
        const i2 = item.price * item.quantity, c2 = item.currentPrice * item.quantity, p2 = c2 - i2;
        const pc = i2 ? ((p2 / i2) * 100).toFixed(2) : "0.00";
        return [item.coin.toUpperCase(), item.price.toFixed(2), item.currentPrice.toFixed(2), item.change24h ? item.change24h.toFixed(2) + "%" : "N/A", item.quantity, c2.toFixed(2), p2.toFixed(2), pc + "%", Number(pc) > 15 ? "PROFIT" : Number(pc) < -10 ? "RISK" : "HOLD"];
      }),
      styles: { halign: "center", fontSize: 8 },
      didParseCell(data) {
        if (data.column.index === 6) data.cell.styles.textColor = parseFloat(data.cell.raw) >= 0 ? [0, 150, 0] : [200, 0, 0];
        if (data.column.index === 8 && data.section === "body") data.cell.styles.textColor = data.cell.raw === "PROFIT" ? [0, 150, 0] : data.cell.raw === "RISK" ? [200, 0, 0] : [180, 130, 0];
      },
    });

    const afterH = pdf.lastAutoTable.finalY;
    const tBuy   = history.filter(h => h.type?.toLowerCase() === "buy").reduce((a, h) => a + Number(h.price) * (h.quantity || h.qty || 0), 0);
    const tSell  = history.filter(h => h.type?.toLowerCase() === "sell").reduce((a, h) => a + Number(h.price) * (h.quantity || h.qty || 0), 0);

    sec("Transaction Summary", afterH + 12);
    pdf.setFontSize(10);
    pdf.text(`Total Buy  : $${tBuy.toFixed(2)}`,  14,  afterH + 22);
    pdf.text(`Total Sell : $${tSell.toFixed(2)}`, 110, afterH + 22);

    sec("Transaction History", afterH + 30);
    autoTable(pdf, {
      startY: afterH + 35,
      head: [["Type", "Coin", "Qty", "Price", "Order", "Date"]],
      body: history.map(h => [h.type?.toUpperCase(), h.coin?.toUpperCase(), h.quantity || h.qty || 0, Number(h.price).toFixed(2), (h.orderType || "market").toUpperCase(), new Date(h.date).toLocaleDateString()]),
      styles: { halign: "center", fontSize: 9 },
      didParseCell(data) { if (data.column.index === 0) data.cell.styles.textColor = data.cell.raw === "BUY" ? [0, 150, 0] : [200, 0, 0]; },
    });

    const pages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i); pdf.setFontSize(9); pdf.setTextColor(120);
      pdf.text(`Report ID: ${reportId}`, 14, 290);
      pdf.text(`Page ${i}/${pages}`, 180, 290);
    }
    pdf.save(`Crypto_Report_${reportId}.pdf`);
  };

  const filteredHistory = activeTab === "ALL" ? history : history.filter(h => h.type === activeTab);

  /* ========================= RENDER ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">

      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🚀 Crypto Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Auto-refreshes every 15 seconds</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow hover:bg-indigo-700 transition text-sm">
            ➕ Add Coin
          </button>
          <button onClick={() => setShowAlerts(true)}
            className="relative flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow hover:bg-amber-600 transition text-sm">
            🔔 Alerts
            {alerts.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{alerts.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* TRADE MODAL */}
      <AnimatePresence>
        {tradeItem && <TradeModal item={tradeItem.item} mode={tradeItem.mode} onClose={() => setTradeItem(null)} onDone={fetchPortfolio} />}
      </AnimatePresence>

      {/* ADD COIN MODAL */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">➕ Add Coin to Portfolio</h2>
                <button onClick={() => { setShowAddForm(false); setCoinSearch(""); setSelectedCoin(null); setAddQty(""); setAddPrice(""); setSearchResults([]); }} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
              </div>
              <div className="relative mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Search Coin</label>
                <input type="text" value={coinSearch} onChange={e => { setCoinSearch(e.target.value); setSelectedCoin(null); setLivePrice(null); }}
                  placeholder="Bitcoin, ETH, SOL..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto">
                    {searchResults.map(coin => (
                      <div key={coin.id} onClick={() => selectCoin(coin)} className="flex items-center gap-3 px-4 py-2 hover:bg-indigo-50 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">{coin.symbol.slice(0, 2)}</div>
                        <div><p className="font-medium text-sm">{coin.name}</p><p className="text-xs text-gray-400">{coin.symbol}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedCoin && (
                <div className="mb-4 p-3 bg-indigo-50 rounded-lg flex items-center justify-between">
                  <span className="font-semibold text-indigo-700">{selectedCoin.name} ({selectedCoin.symbol})</span>
                  {livePrice ? <span className="text-green-600 font-bold">${livePrice.toLocaleString()}</span> : <span className="text-gray-400 text-sm">Fetching...</span>}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
                <input type="number" value={addQty} onChange={e => setAddQty(e.target.value)} placeholder="e.g. 0.5" min="0" step="any" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Buy Price (USD)
                  {livePrice && <button type="button" onClick={() => setAddPrice(livePrice.toString())} className="ml-2 text-xs text-indigo-500 underline">Use live price</button>}
                </label>
                <input type="number" value={addPrice} onChange={e => setAddPrice(e.target.value)} placeholder="e.g. 67000" min="0" step="any" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              {addQty && addPrice && <div className="mb-4 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">Total: <strong>${(Number(addQty) * Number(addPrice)).toFixed(2)}</strong></div>}
              <div className="flex gap-3">
                <button onClick={handleAddCoin} disabled={addLoading} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">{addLoading ? "Adding..." : "Add to Portfolio"}</button>
                <button onClick={() => { setShowAddForm(false); setCoinSearch(""); setSelectedCoin(null); setAddQty(""); setAddPrice(""); setSearchResults([]); }} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-200 transition">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRICE ALERTS MODAL */}
      <AnimatePresence>
        {showAlerts && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">🔔 Price Alerts</h2>
                <button onClick={() => setShowAlerts(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 mb-5">
                <h3 className="font-semibold text-sm mb-3 text-amber-800">Set New Alert</h3>
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">Coin (e.g. bitcoin)</label>
                  <input type="text" value={alertCoin} onChange={e => setAlertCoin(e.target.value)} placeholder="bitcoin" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div className="mb-3 flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Target Price (USD)</label>
                    <input type="number" value={alertTarget} onChange={e => setAlertTarget(e.target.value)} placeholder="75000" min="0" step="any" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Condition</label>
                    <select value={alertType} onChange={e => setAlertType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 h-[42px]">
                      <option value="above">📈 Above</option>
                      <option value="below">📉 Below</option>
                    </select>
                  </div>
                </div>
                <button onClick={addAlert} className="w-full bg-amber-500 text-white py-2 rounded-xl font-semibold hover:bg-amber-600 transition text-sm">+ Set Alert</button>
              </div>
              <h3 className="font-semibold text-sm text-gray-600 mb-2">Active Alerts ({alerts.length})</h3>
              {alerts.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">No alerts set yet</p> : (
                <div className="space-y-2">
                  {alerts.map(alert => {
                    const m    = portfolio.find(p => p.coin?.toLowerCase() === alert.coin?.toLowerCase());
                    const fired = m && ((alert.type === "above" && m.currentPrice >= alert.target) || (alert.type === "below" && m.currentPrice <= alert.target));
                    return (
                      <div key={alert.id} className={`flex items-center justify-between p-3 rounded-xl border ${fired ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                        <div>
                          <p className="font-semibold text-sm">{alert.coin.toUpperCase()}
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${alert.type === "above" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {alert.type === "above" ? "📈 Above" : "📉 Below"} ${alert.target.toLocaleString()}
                            </span>
                          </p>
                          {m && <p className="text-xs text-gray-400 mt-0.5">Now: ${m.currentPrice.toFixed(2)}{fired && <span className="ml-2 text-green-600 font-medium">✅ Triggered</span>}</p>}
                        </div>
                        <button onClick={() => deleteAlert(alert.id)} className="text-gray-300 hover:text-red-500 text-lg leading-none ml-3">×</button>
                      </div>
                    );
                  })}
                </div>
              )}
              <button onClick={() => setShowAlerts(false)} className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-200 transition">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Current Value"   value={`$${totalCurrent.toFixed(2)}`}   icon="💼" />
        <StatCard title="Total Invested"  value={`$${totalInvestment.toFixed(2)}`} icon="📥" color="text-indigo-600" />
        <StatCard title="Profit / Loss"   value={`$${profitLoss.toFixed(2)}`}      icon={profitLoss >= 0 ? "📈" : "📉"} color={profitLoss >= 0 ? "text-green-600" : "text-red-500"} sub={`${profitPercent}% overall return`} />
        <StatCard title="Portfolio Coins" value={portfolio.length}                 icon="🪙" color="text-purple-600" sub={`${alerts.length} alert${alerts.length !== 1 ? "s" : ""} active`} />
      </div>

      {/* AI INSIGHTS */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-8">
        <SectionHeader title="🤖 AI Insights" subtitle="Based on your current portfolio performance" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Best Performer",  value: bestCoin  ? bestCoin.coin.toUpperCase()  : "—", sub: bestCoin  ? `+$${((bestCoin.currentPrice  - bestCoin.price)  * bestCoin.quantity).toFixed(2)}`  : "", color: "text-green-600", bg: "bg-green-50"  },
            { label: "Needs Attention", value: worstCoin ? worstCoin.coin.toUpperCase() : "—", sub: worstCoin ? `$${((worstCoin.currentPrice - worstCoin.price) * worstCoin.quantity).toFixed(2)}` : "", color: "text-red-500",   bg: "bg-red-50"    },
            { label: "Overall Return",  value: `${profitPercent}%`, sub: profitLoss >= 0 ? "In profit 🟢" : "In loss 🔴", color: profitLoss >= 0 ? "text-green-600" : "text-red-500", bg: profitLoss >= 0 ? "bg-green-50" : "bg-red-50" },
            { label: "Suggestion",      value: suggestion, sub: "AI recommendation", color: suggestion.includes("Profit") ? "text-green-600" : suggestion.includes("Down") ? "text-red-500" : "text-amber-600", bg: "bg-amber-50" },
          ].map((c, i) => (
            <div key={i} className={`${c.bg} rounded-xl p-3`}>
              <p className="text-xs text-gray-500 mb-1">{c.label}</p>
              <p className={`text-base font-bold ${c.color}`}>{c.value}</p>
              {c.sub && <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* DONUT + TOP MOVERS */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">

        {/* DONUT CHART */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <SectionHeader title="📊 Portfolio Allocation" subtitle="Based on current market value" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={110} paddingAngle={3} cx="50%" cy="50%">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />)}
                <Label content={<DonutCenterLabel totalValue={totalCurrent} />} position="center" />
              </Pie>
              <Tooltip content={<CustomDonutTooltip />} />
              <Legend content={<CustomDonutLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* TOP MOVERS */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <SectionHeader title="🏆 Top Movers" subtitle="Biggest gains & losses in your portfolio" />
          <div className="mb-5">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Top Gainers</p>
            {gainers.length === 0 ? <p className="text-gray-400 text-sm">No data</p> : gainers.map((c, i) => {
              const pl  = (c.currentPrice - c.price) * c.quantity;
              const pct = c.price > 0 ? ((c.currentPrice - c.price) / c.price * 100).toFixed(1) : 0;
              const bar = Math.min(Math.abs(pl) / (Math.abs((bestCoin?.currentPrice - bestCoin?.price) * bestCoin?.quantity) || 1) * 100, 100);
              return (
                <div key={c._id} className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="font-semibold">{c.coin.toUpperCase()}</span>
                      <span className="text-green-600 font-medium">+${pl.toFixed(2)} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-1.5 bg-green-400 rounded-full transition-all" style={{ width: `${bar}%` }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Top Losers</p>
            {losers.length === 0 ? <p className="text-gray-400 text-sm">No data</p> : losers.map((c, i) => {
              const pl  = (c.currentPrice - c.price) * c.quantity;
              const pct = c.price > 0 ? ((c.currentPrice - c.price) / c.price * 100).toFixed(1) : 0;
              const bar = Math.min(Math.abs(pl) / (Math.abs((worstCoin?.currentPrice - worstCoin?.price) * worstCoin?.quantity) || 1) * 100, 100);
              return (
                <div key={c._id} className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="font-semibold">{c.coin.toUpperCase()}</span>
                      <span className="text-red-500 font-medium">${pl.toFixed(2)} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-1.5 bg-red-400 rounded-full transition-all" style={{ width: `${bar}%` }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BAR CHART */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-8">
        <SectionHeader title="📉 Investment vs Current Value" subtitle="Per coin grouped comparison" />
        <div className="flex gap-5 mb-4">
          {[{ color: "#6366F1", label: "Investment" }, { color: "#22C55E", label: "Current Value" }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: l.color }} />{l.label}
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={groupedData} barCategoryGap="25%" barGap={4} margin={{ top: 16, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(99,102,241,0.04)", radius: 4 }} />
            <ReferenceLine y={0} stroke="#e5e7eb" />
            <Bar dataKey="investment" name="Investment" fill="#6366F1" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="investment" position="top" formatter={v => `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}`} style={{ fontSize: 10, fill: "#6366F1", fontWeight: 600 }} />
            </Bar>
            <Bar dataKey="current" name="Current Value" fill="#22C55E" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="current" position="top" formatter={v => `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}`} style={{ fontSize: 10, fill: "#22C55E", fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* HOLDINGS TABLE */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3">
          <SectionHeader title="💼 Holdings" subtitle="Your complete portfolio breakdown" />
          <div className="flex gap-2">
            <CSVLink data={csvData} filename="portfolio.csv">
              <button className="flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 transition">📥 CSV</button>
            </CSVLink>
            <button onClick={downloadPDF} className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition">📄 PDF</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center min-w-[700px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-l-xl">Coin</th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Buy $</th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Current $</th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">24h %</th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">P/L</th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Return</th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {portfolio.map(item => {
                const pl     = (item.currentPrice - item.price) * item.quantity;
                const inv    = item.price * item.quantity;
                const retPct = inv ? ((pl / inv) * 100).toFixed(2) : "0.00";
                const status = Number(retPct) > 15 ? { label: "PROFIT", cls: "text-green-700 bg-green-100" } : Number(retPct) < -10 ? { label: "RISK", cls: "text-red-600 bg-red-100" } : { label: "HOLD", cls: "text-amber-700 bg-amber-100" };
                const ch24   = item.change24h ?? 0;
                return (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{item.coin.slice(0, 2).toUpperCase()}</div>
                        <span className="font-semibold text-gray-800">{item.coin.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600">${item.price.toFixed(2)}</td>
                    <td className="py-3 px-3 font-semibold text-gray-800">${item.currentPrice.toFixed(2)}</td>
                    <td className={`py-3 px-3 font-semibold ${ch24 >= 0 ? "text-green-600" : "text-red-500"}`}>{ch24 >= 0 ? "+" : ""}{ch24.toFixed(2)}%</td>
                    <td className="py-3 px-3 text-gray-600">{item.quantity}</td>
                    <td className={`py-3 px-3 font-semibold ${pl >= 0 ? "text-green-600" : "text-red-500"}`}>${pl.toFixed(2)}</td>
                    <td className={`py-3 px-3 font-semibold ${pl >= 0 ? "text-green-600" : "text-red-500"}`}>{retPct}%</td>
                    <td className="py-3 px-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.cls}`}>{status.label}</span></td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => setTradeItem({ item, mode: "BUY" })}  className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600 transition">Buy</button>
                        <button onClick={() => setTradeItem({ item, mode: "SELL" })} className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-amber-600 transition">Sell</button>
                        <button onClick={() => deleteCoin(item._id)}                 className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition">Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {portfolio.length === 0 && <p className="text-center text-gray-400 py-8">No coins in portfolio. Click ➕ Add Coin to get started.</p>}
        </div>
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
        <SectionHeader title="📜 Transaction History" subtitle="All buy & sell activity" />
        <div className="flex gap-2 mb-4">
          {["ALL", "BUY", "SELL"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition ${activeTab === tab ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {tab}
            </button>
          ))}
        </div>
        {filteredHistory.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No transactions found.</p>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((h, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`w-14 text-center text-xs font-bold py-1 rounded-lg ${h.type === "BUY" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{h.type}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{h.coin?.toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{new Date(h.date).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-800">{h.quantity || h.qty} × ${Number(h.price).toFixed(2)}</p>
                  {h.orderType && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full capitalize">{h.orderType}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
