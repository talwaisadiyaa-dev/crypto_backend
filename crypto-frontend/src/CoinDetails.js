import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import { Toaster, toast } from "react-hot-toast";
import CoinChart from "./CoinChart";

function CoinDetails() {
  const { id: coinId } = useParams();
  const navigate = useNavigate();
  const { dark } = useContext(ThemeContext);

  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch coin details from CoinGecko API
  useEffect(() => {
    const fetchCoinDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch coin details");
        }

        const data = await response.json();
        setCoin(data);
      } catch (err) {
        setError(err.message);
        toast.error("Error fetching coin details");
      } finally {
        setLoading(false);
      }
    };

    if (coinId) {
      fetchCoinDetails();
    }
  }, [coinId]);

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${dark ? "bg-slate-900" : "bg-gray-50"}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500"></div>
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className={`min-h-screen ${dark ? "bg-slate-900 text-white" : "bg-gray-50 text-black"} flex flex-col justify-center items-center`}>
        <h1 className="text-3xl font-bold mb-4">❌ Error</h1>
        <p className="text-lg mb-6">{error || "Coin not found"}</p>
        <button
          onClick={() => navigate("/home")}
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const currentPrice = coin.market_data?.current_price?.usd || 0;
  const marketCap = coin.market_data?.market_cap?.usd || 0;
  const volume24h = coin.market_data?.total_volume?.usd || 0;
  const priceChange24h = coin.market_data?.price_change_percentage_24h || 0;
  const marketCapRank = coin.market_cap_rank || "N/A";
  const highestPrice = coin.market_data?.high_24h?.usd || 0;
  const lowestPrice = coin.market_data?.low_24h?.usd || 0;
  const totalSupply = coin.market_data?.total_supply || 0;
  const circulatingSupply = coin.market_data?.circulating_supply || 0;

  return (
    <div className={`min-h-screen ${dark ? "bg-slate-900 text-white" : "bg-gray-50 text-black"} py-8 px-4 md:px-8`}>
      <Toaster position="top-right" />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className={`mb-6 px-4 py-2 rounded-lg font-semibold transition ${
          dark
            ? "bg-slate-800 hover:bg-slate-700 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-black"
        }`}
      >
        ← Back
      </button>

      {/* Header Section */}
      <div className={`rounded-2xl p-8 mb-8 ${dark ? "bg-slate-800" : "bg-white"} shadow-lg`}>
        <div className="flex items-center gap-4 mb-6">
          {coin.image?.large && (
            <img src={coin.image.large} alt={coin.name} className="w-16 h-16" />
          )}
          <div>
            <h1 className="text-4xl font-bold">{coin.name}</h1>
            <p className="text-xl text-gray-400 uppercase">{coin.symbol}</p>
          </div>
          <span className={`ml-auto px-4 py-2 rounded-full text-lg font-bold ${
            priceChange24h >= 0
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}>
            {priceChange24h >= 0 ? "▲" : "▼"} {priceChange24h.toFixed(2)}%
          </span>
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className={`p-4 rounded-lg ${dark ? "bg-slate-700" : "bg-gray-100"}`}>
            <p className="text-sm text-gray-400 mb-2">Current Price</p>
            <p className="text-2xl font-bold text-pink-500">${currentPrice.toLocaleString()}</p>
          </div>

          <div className={`p-4 rounded-lg ${dark ? "bg-slate-700" : "bg-gray-100"}`}>
            <p className="text-sm text-gray-400 mb-2">24h High</p>
            <p className="text-2xl font-bold">${highestPrice.toLocaleString()}</p>
          </div>

          <div className={`p-4 rounded-lg ${dark ? "bg-slate-700" : "bg-gray-100"}`}>
            <p className="text-sm text-gray-400 mb-2">24h Low</p>
            <p className="text-2xl font-bold">${lowestPrice.toLocaleString()}</p>
          </div>

          <div className={`p-4 rounded-lg ${dark ? "bg-slate-700" : "bg-gray-100"}`}>
            <p className="text-sm text-gray-400 mb-2">Market Cap Rank</p>
            <p className="text-2xl font-bold text-blue-400">#{marketCapRank}</p>
          </div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className={`rounded-2xl p-8 ${dark ? "bg-slate-800" : "bg-white"} shadow-lg`}>
          <h2 className="text-2xl font-bold mb-6">Market Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Market Cap</span>
              <span className="font-bold text-lg">${(marketCap / 1e9).toFixed(2)}B</span>
            </div>
            <hr className={dark ? "border-slate-700" : "border-gray-200"} />

            <div className="flex justify-between items-center">
              <span className="text-gray-400">24h Volume</span>
              <span className="font-bold text-lg">${(volume24h / 1e9).toFixed(2)}B</span>
            </div>
            <hr className={dark ? "border-slate-700" : "border-gray-200"} />

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Circulating Supply</span>
              <span className="font-bold text-lg">{circulatingSupply.toLocaleString()}</span>
            </div>
            <hr className={dark ? "border-slate-700" : "border-gray-200"} />

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Supply</span>
              <span className="font-bold text-lg">{totalSupply ? totalSupply.toLocaleString() : "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Links and Info */}
        <div className={`rounded-2xl p-8 ${dark ? "bg-slate-800" : "bg-white"} shadow-lg`}>
          <h2 className="text-2xl font-bold mb-6">Additional Info</h2>
          <div className="space-y-4">
            {coin.homepage && coin.homepage[0] && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Website</p>
                <a
                  href={coin.homepage[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-400 break-all"
                >
                  {coin.homepage[0]}
                </a>
              </div>
            )}

            {coin.links?.blockchain_site && coin.links.blockchain_site[0] && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Blockchain Explorer</p>
                <a
                  href={coin.links.blockchain_site[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-400 break-all"
                >
                  View on Explorer
                </a>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-400 mb-2">Description</p>
              <p className="text-sm leading-relaxed">{coin.description?.en?.slice(0, 200) || "No description available"}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className={`rounded-2xl p-8 ${dark ? "bg-slate-800" : "bg-white"} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-6">Price Chart (7 Days)</h2>
        <CoinChart coinId={coinId} dark={dark} />
      </div>
    </div>
  );
}

export default CoinDetails;
