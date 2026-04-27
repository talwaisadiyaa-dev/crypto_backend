import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Zap, Shield, Users, Smartphone } from "lucide-react";

function Landing() {
  const isLoggedIn = localStorage.getItem("userId");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <div className="scroll-smooth font-sans bg-white text-black">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
            🚀 CryptoTrack Pro
          </h1>
          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition">How It Works</a>
            <a href="#features" className="text-gray-600 hover:text-indigo-600 transition">Features</a>
            <a href="#about" className="text-gray-600 hover:text-indigo-600 transition">About</a>
            <Link to="/login" className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold hover:shadow-lg transition">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* 1️⃣ HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute right-0 top-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>

        <motion.div className="text-center max-w-4xl relative z-10" initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6">
              <TypeAnimation
                sequence={[
                  "Smart Crypto Tracking 📊",
                  2000,
                  "Real-Time Portfolio 💼",
                  2000,
                  "Instant Analytics ⚡",
                  2000,
                  "Maximize Your Gains 🚀",
                  2000,
                ]}
                speed={50}
                repeat={Infinity}
              />
            </h1>
          </motion.div>

          <motion.p variants={itemVariants} className="text-xl text-gray-300 mb-8">
            Track cryptocurrency prices, manage your portfolio, analyze profits, and make smarter investment decisions — all in one powerful platform.
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-4 justify-center flex-wrap">
            <Link
              to={isLoggedIn ? "/home" : "/login"}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition transform hover:scale-105"
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
            </Link>
            <a href="#how-it-works" className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition">
              Learn More
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* 2️⃣ HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-pink-600 text-white text-4xl shadow-xl mb-6">
              📋
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to master your crypto portfolio in minutes
            </p>
          </motion.div>

          <motion.div className="grid md:grid-cols-4 gap-8" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            {[
              { num: 1, title: "Sign Up", desc: "Create a free account in seconds", icon: "👤" },
              { num: 2, title: "Add Coins", desc: "Search and add cryptocurrencies you own", icon: "🪙" },
              { num: 3, title: "Track Portfolio", desc: "Monitor prices, gains, and losses in real-time", icon: "📈" },
              { num: 4, title: "Analyze & Export", desc: "Get detailed reports and export your data", icon: "📊" }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition text-center border border-gray-100"
              >
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="text-3xl font-bold text-indigo-600 mb-2">Step {step.num}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3️⃣ FEATURES */}
      <section id="features" className="py-24 bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-pink-600 text-white text-4xl shadow-xl mb-6">
              ⚡
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to track and grow your crypto wealth
            </p>
          </motion.div>

          <motion.div className="grid md:grid-cols-3 gap-8" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            {[
              { icon: <TrendingUp size={40} />, title: "Live Price Tracking", desc: "Real-time cryptocurrency prices from CoinGecko" },
              { icon: <BarChart3 size={40} />, title: "Portfolio Analysis", desc: "Track investments, profits, and performance metrics" },
              { icon: <Zap size={40} />, title: "Fast & Responsive", desc: "Lightning-fast interface optimized for all devices" },
              { icon: <Shield size={40} />, title: "Secure & Private", desc: "Encrypted login system to protect your data" },
              { icon: <Users size={40} />, title: "Watchlist", desc: "Save your favorite coins and track them easily" },
              { icon: <Smartphone size={40} />, title: "Mobile Ready", desc: "Works perfectly on desktop, tablet, and mobile" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition border border-gray-100"
              >
                <div className="text-indigo-600 mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-700">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4️⃣ UNIQUE SELLING POINTS */}
      <section className="py-24 bg-gradient-to-br from-indigo-900 to-slate-900 text-white px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            <h2 className="text-5xl font-bold mb-4">Why Choose CryptoTrack Pro?</h2>
            <p className="text-xl text-gray-300">Built for serious crypto investors</p>
          </motion.div>

          <motion.div className="grid md:grid-cols-2 gap-8" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            {[
              { title: "🌍 Global Coverage", desc: "Track 10,000+ cryptocurrencies with real-time data from CoinGecko" },
              { title: "💰 Portfolio Management", desc: "Record investments, calculate P&L, and analyze your portfolio performance" },
              { title: "📥 Export & Reports", desc: "Download detailed reports in CSV and PDF formats for tax/accounting" },
              { title: "🎯 Smart Filters", desc: "Sort and filter coins by market cap, volume, and price changes" },
              { title: "🌙 Dark Mode", desc: "Easy on the eyes with beautiful dark and light themes" },
              { title: "⚡ No Fees", desc: "100% free forever — no hidden charges or premium subscriptions" }
            ].map((point, idx) => (
              <motion.div key={idx} variants={itemVariants} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
                <h3 className="text-2xl font-bold mb-3">{point.title}</h3>
                <p className="text-gray-300">{point.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>


      </section>

      {/* 5️⃣ ABOUT ME */}
      <section id="about" className="py-24 bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-6 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }}></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-pink-600 text-white text-5xl shadow-2xl mb-8 animate-bounce">
              👩‍💻
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-6 tracking-wider">
              About Me
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
              The story behind CryptoTrack Pro and the passion that drives it
            </p>
          </motion.div>

          <motion.div className="max-w-6xl mx-auto" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              {/* Left Column - Personal Story */}
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
                <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 relative">
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-full animate-ping"></div>
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-full"></div>

                  <div className="text-center mb-8">
                    <h3 className="text-5xl font-black text-indigo-600 mb-3 animate-pulse">👋 Hi, I'm Sadiya!</h3>
                    <p className="text-xl text-gray-600 font-medium">Full-Stack Developer & Crypto Enthusiast</p>
                    <div className="w-20 h-1 bg-gradient-to-r from-indigo-600 to-pink-600 mx-auto mt-4 rounded-full"></div>
                  </div>

                  <div className="space-y-6 text-lg leading-relaxed text-gray-700">
                    <p className="text-xl font-semibold text-center text-indigo-600 mb-6">
                      "Turning complex crypto data into simple, beautiful insights"
                    </p>

                    <p>
                      I created <span className="font-bold text-indigo-600">CryptoTrack Pro</span> because I saw a gap in the market.
                      Most crypto tracking tools were either too complicated for beginners or too expensive for casual investors.
                    </p>

                    <p>
                      As a developer passionate about blockchain technology, I wanted to build something that combines
                      <span className="font-semibold text-pink-600"> powerful functionality</span> with
                      <span className="font-semibold text-indigo-600"> elegant simplicity</span>.
                    </p>

                    <p>
                      Every feature in this app was designed with one goal in mind:
                      <span className="italic text-gray-600"> making cryptocurrency accessible and enjoyable for everyone.</span>
                    </p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-pink-50 rounded-xl border border-indigo-100">
                      <div className="text-2xl font-black text-indigo-600">10K+</div>
                      <div className="text-xs text-gray-600">Coins Supported</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100">
                      <div className="text-2xl font-black text-pink-600">Free</div>
                      <div className="text-xs text-gray-600">Forever</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                      <div className="text-2xl font-black text-purple-600">Real-time</div>
                      <div className="text-xs text-gray-600">Updates</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Skills & Journey */}
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-pink-600 p-8 rounded-3xl text-white shadow-2xl">
                  <h4 className="text-2xl font-bold mb-6 text-center">🚀 My Journey</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">🎓</div>
                      <div>
                        <p className="font-semibold">Education</p>
                        <p className="text-sm text-white/80">Nehru BBA & BCA College</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">💼</div>
                      <div>
                        <p className="font-semibold">Experience</p>
                        <p className="text-sm text-white/80">Full-Stack Developer at Ultimez Technology</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">🛠️</div>
                      <div>
                        <p className="font-semibold">Tech Stack</p>
                        <p className="text-sm text-white/80">React • Node.js • MongoDB • Tailwind</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                  <h4 className="text-xl font-bold text-center text-gray-800 mb-4">💡 Why This Matters</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    In a world of complex financial tools, CryptoTrack Pro stands out by being
                    <span className="font-semibold text-indigo-600"> simple yet powerful</span>,
                    <span className="font-semibold text-pink-600"> free yet feature-rich</span>, and
                    <span className="font-semibold text-purple-600"> accessible yet professional</span>.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-slate-100 to-indigo-100 p-6 rounded-3xl border border-slate-200">
                  <p className="text-center text-gray-700 italic text-sm">
                    "Every line of code written with the vision of democratizing crypto knowledge"
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6️⃣ CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-6">
        <motion.div className="max-w-4xl mx-auto text-center" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Master Your Crypto Portfolio?
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl mb-8 text-white/90">
            Join thousands of crypto enthusiasts tracking their investments with CryptoTrack Pro
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link
              to={isLoggedIn ? "/home" : "/login"}
              className="px-10 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:shadow-2xl transition transform hover:scale-105 inline-block"
            >
              {isLoggedIn ? "Go to App" : "Start For Free"}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 7️⃣ FOOTER */}
      <footer className="bg-slate-900 text-gray-400 px-6 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">CryptoTrack Pro</h3>
              <p className="text-sm">Professional crypto portfolio tracker built for modern investors</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#about" className="hover:text-white transition">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Get Started</h4>
              <Link to="/login" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition inline-block">
                Login
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 CryptoTrack Pro | All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
