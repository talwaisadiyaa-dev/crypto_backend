import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";

function Landing() {

  // ✅ check login
  const isLoggedIn = localStorage.getItem("userId");

  const dashboardLink = isLoggedIn ? "/dashboard" : "/login";

  return (
    <div className="scroll-smooth font-sans text-white">

      {/* 🔝 NAVBAR */}
      <div className="fixed w-full flex justify-between items-center px-10 py-5 bg-black/30 backdrop-blur-md z-50">
        <h1 className="text-xl font-bold">CryptoTrack</h1>

        <div className="flex gap-6">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>

          {/* ✅ FIX */}
          <Link
            to={dashboardLink}
            className="bg-blue-500 px-4 py-2 rounded-lg hover:scale-105 transition"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* 🚀 HERO */}
      <section
        id="home"
        className="min-h-screen flex items-center px-10 bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-900 pt-24"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

          {/* LEFT */}
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">

              <TypeAnimation
                sequence={[
                  "Crypto Price Tracker 🚀",
                  2000,
                  "Portfolio Manager 💼",
                  2000,
                  "Track Profit & Loss 📊",
                  2000,
                ]}
                speed={50}
                repeat={Infinity}
              />

            </h1>

            <p className="mt-6 text-white/80 max-w-md">
              Track live crypto prices, monitor your investments, calculate
              profit & loss, and export reports — all in one powerful app.
            </p>

            <div className="flex gap-4 mt-8">

              {/* ✅ FIX */}
              <Link
                to={dashboardLink}
                className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:scale-105"
              >
                Get Started
              </Link>

              {/* ✅ FIX */}
              <Link
                to={dashboardLink}
                className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-700"
              >
                Live Market
              </Link>

            </div>
          </div>

          {/* RIGHT UI */}
          <div className="bg-white text-black rounded-xl shadow-2xl p-6 w-[320px] mx-auto">
            <h2 className="font-bold mb-3">Portfolio</h2>

            <div className="flex justify-between">
              <span>BTC</span>
              <span className="text-green-500">+4%</span>
            </div>

            <div className="flex justify-between">
              <span>ETH</span>
              <span className="text-red-500">-1%</span>
            </div>

            <h3 className="text-2xl font-bold text-blue-600 mt-4">
              $12,450
            </h3>
          </div>

        </div>
      </section>

      {/* 🔥 LIVE TICKER */}
      <div className="bg-black text-green-400 py-2 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          BTC $68,200 ↑ • ETH $3,200 ↓ • SOL $140 ↑ • ADA $0.45 ↑ • DOGE $0.12 ↓
        </div>
      </div>

      {/* ⚡ FEATURES */}
      <section id="features" className="py-20 bg-white text-black text-center">

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-10">Features</h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto px-6">

          <div className="p-6 shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-2 transition">
            📊 Live Prices
          </div>

          <div className="p-6 shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-2 transition">
            📈 Profit Tracking
          </div>

          <div className="p-6 shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-2 transition">
            ⭐ Watchlist
          </div>

          <div className="p-6 shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-2 transition">
            📥 Export Reports
          </div>

        </div>
      </section>

      {/* 💡 ABOUT */}
      <section id="about" className="py-20 bg-gray-100 text-center text-black px-6">

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-6">About</h2>

          <p className="max-w-2xl mx-auto text-gray-600 text-lg">
            CryptoTrack is a modern web application designed to help users track
            cryptocurrency prices in real-time, manage portfolios, and analyze
            profit/loss easily. It also supports PDF and CSV export.
          </p>
        </motion.div>

      </section>

      {/* 🚀 CTA */}
      <section className="py-20 bg-blue-600 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Start Your Crypto Journey 🚀
        </h2>

        {/* ✅ FIX */}
        <Link
          to={dashboardLink}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg"
        >
          Go to Dashboard
        </Link>
      </section>

    </div>
  );
}

export default Landing;