import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { TrendingUp, BarChart3, Zap, Shield, Users, Smartphone } from "lucide-react";

function Landing() {
  const isLoggedIn = localStorage.getItem("userId");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <div className="scroll-smooth font-sans bg-white text-black">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
            🚀 CryptoTrack Pro
          </h1>
          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition text-sm">How It Works</a>
            <a href="#features"     className="text-gray-600 hover:text-indigo-600 transition text-sm">Features</a>
            <a href="#about"        className="text-gray-600 hover:text-indigo-600 transition text-sm">About</a>
            <Link to="/login" className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold hover:shadow-lg transition text-sm">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute right-0 top-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        <motion.div className="text-center max-w-4xl relative z-10" initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              <TypeAnimation
                sequence={["Smart Crypto Tracking 📊", 2000, "Real-Time Portfolio 💼", 2000, "Instant Analytics ⚡", 2000, "Maximize Your Gains 🚀", 2000]}
                speed={50} repeat={Infinity}
              />
            </h1>
          </motion.div>
          <motion.p variants={itemVariants} className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Track cryptocurrency prices, manage your portfolio, analyze profits, and make smarter investment decisions — all in one powerful platform.
          </motion.p>
          <motion.div variants={itemVariants} className="flex gap-4 justify-center flex-wrap">
            <Link to={isLoggedIn ? "/home" : "/login"}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition transform hover:scale-105">
              {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
            </Link>
            <a href="#how-it-works" className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition">
              Learn More
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-pink-600 text-white text-2xl shadow-xl mb-4">📋</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">How It Works</h2>
            <p className="text-base text-gray-500 max-w-xl mx-auto">Simple steps to master your crypto portfolio in minutes</p>
          </motion.div>
          <motion.div className="grid md:grid-cols-4 gap-6" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            {[
              { num: 1, title: "Sign Up",         desc: "Create a free account in seconds",                icon: "👤" },
              { num: 2, title: "Add Coins",        desc: "Search and add cryptocurrencies you own",         icon: "🪙" },
              { num: 3, title: "Track Portfolio",  desc: "Monitor prices, gains, and losses in real-time", icon: "📈" },
              { num: 4, title: "Analyze & Export", desc: "Get detailed reports and export your data",       icon: "📊" },
            ].map((step, idx) => (
              <motion.div key={idx} variants={itemVariants}
                className="bg-white p-7 rounded-3xl shadow-xl hover:shadow-2xl transition text-center border border-gray-100">
                <div className="text-4xl mb-3">{step.icon}</div>
                <div className="text-xl font-bold text-indigo-600 mb-1">Step {step.num}</div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-pink-600 text-white text-2xl shadow-xl mb-4">⚡</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Powerful Features</h2>
            <p className="text-base text-gray-500 max-w-xl mx-auto">Everything you need to track and grow your crypto wealth</p>
          </motion.div>
          <motion.div className="grid md:grid-cols-3 gap-7" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            {[
              { icon: <TrendingUp size={34} />, title: "Live Price Tracking", desc: "Real-time cryptocurrency prices from CoinGecko"         },
              { icon: <BarChart3  size={34} />, title: "Portfolio Analysis",  desc: "Track investments, profits, and performance metrics"    },
              { icon: <Zap       size={34} />, title: "Fast & Responsive",   desc: "Lightning-fast interface optimized for all devices"     },
              { icon: <Shield    size={34} />, title: "Secure & Private",    desc: "Encrypted login system to protect your data"            },
              { icon: <Users     size={34} />, title: "Watchlist",           desc: "Save your favorite coins and track them easily"         },
              { icon: <Smartphone size={34}/>, title: "Mobile Ready",        desc: "Works perfectly on desktop, tablet, and mobile"         },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants}
                className="bg-white p-7 rounded-3xl shadow-xl hover:shadow-2xl transition border border-gray-100">
                <div className="text-indigo-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHY CHOOSE ── */}
      <section className="py-24 bg-gradient-to-br from-indigo-900 to-slate-900 text-white px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Why Choose CryptoTrack Pro?</h2>
            <p className="text-gray-300 text-base">Built for serious crypto investors</p>
          </motion.div>
          <motion.div className="grid md:grid-cols-2 gap-6" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            {[
              { title: "🌍 Global Coverage",      desc: "Track 10,000+ cryptocurrencies with real-time data from CoinGecko"         },
              { title: "💰 Portfolio Management", desc: "Record investments, calculate P&L, and analyze your portfolio performance" },
              { title: "📥 Export & Reports",     desc: "Download detailed reports in CSV and PDF formats for tax/accounting"       },
              { title: "🎯 Smart Filters",        desc: "Sort and filter coins by market cap, volume, and price changes"           },
              { title: "🌙 Dark Mode",            desc: "Easy on the eyes with beautiful dark and light themes"                    },
              { title: "⚡ No Fees",              desc: "100% free forever — no hidden charges or premium subscriptions"          },
            ].map((point, idx) => (
              <motion.div key={idx} variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm p-7 rounded-2xl border border-white/20">
                <h3 className="text-xl font-bold mb-2">{point.title}</h3>
                <p className="text-gray-300 text-sm">{point.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT ME ── */}
      <section id="about" className="py-24 px-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #faf5ff 100%)" }}>

        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">

          {/* Heading */}
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-500 mb-2 block">The Developer</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">About Me</h2>
          </motion.div>

          {/* Hero profile card */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="relative bg-gradient-to-br from-indigo-600 to-pink-600 rounded-3xl p-8 md:p-10 text-white mb-8 shadow-2xl shadow-indigo-200/50 overflow-hidden">

            {/* Big decorative letter */}
            <div className="absolute -right-4 -top-4 text-[130px] font-black opacity-10 select-none leading-none">S</div>

            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0 text-center">
                <div className="w-24 h-24 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-5xl shadow-xl mb-3">
                  👩‍💻
                </div>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">Full-Stack Dev</span>
              </div>

              {/* Content */}
              <div className="text-center md:text-left flex-1">
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Hello, I am</p>
                <h3 className="text-4xl font-extrabold mb-1">Sadiya👋</h3>
                <p className="text-white/80 text-base leading-relaxed mt-3 max-w-2xl">
                  I'm a passionate full-stack developer who loves building products that solve real problems. CryptoTrack Pro is my academic cum professional project — designed to make crypto tracking beautiful, simple, and powerful for everyone.
                </p>
                <div className="flex flex-wrap gap-2 mt-5 justify-center md:justify-start">
                  {["React", "Node.js", "MongoDB", "Tailwind CSS"].map(t => (
                    <span key={t} className="text-xs bg-white/20 border border-white/30 px-3 py-1 rounded-full font-semibold">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3 info cards */}
          <motion.div className="grid md:grid-cols-3 gap-5 mb-8" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            {[
              { icon: "🎓", iconBg: "bg-blue-100 text-blue-600",   bg: "bg-blue-50 border-blue-100",   label: "Education",  title: "Nehru BBA & BCA College",        desc: "Pursuing my degree while building real-world projects" },
              { icon: "🏢", iconBg: "bg-indigo-100 text-indigo-600", bg: "bg-indigo-50 border-indigo-100", label: "Company",   title: "Ultimez Technology",             desc: "Working as a Full-Stack Developer on modern web apps"  },
              { icon: "🛠️", iconBg: "bg-violet-100 text-violet-600", bg: "bg-violet-50 border-violet-100", label: "Tech Stack", title: "React · Node · MongoDB",         desc: "Tailwind CSS · JWT Auth · CoinGecko API"               },
            ].map((c, i) => (
              <motion.div key={i} variants={itemVariants}
                className={`${c.bg} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1`}>
                <div className={`w-10 h-10 ${c.iconBg} rounded-xl flex items-center justify-center text-xl mb-4`}>{c.icon}</div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">{c.label}</p>
                <h4 className="font-extrabold text-gray-800 mb-1 text-sm">{c.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* About project */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-md p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg">🚀</div>
              <h4 className="text-lg font-extrabold text-gray-800">About This Project</h4>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              <strong>CryptoTrack Pro</strong> started as my academic project — but it grew into something I'm truly proud of. It solves a real problem: giving everyday people a clean, powerful tool to manage their crypto without the confusion of complex platforms.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              From live price tracking and portfolio management to smart buy/sell signals and instant coin conversion — every feature is designed with one goal: <em>making crypto simple for you.</em>
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {["React", "Node.js", "MongoDB", "Tailwind CSS", "CoinGecko API", "JWT Auth", "Recharts", "Framer Motion"].map(t => (
                <span key={t} className="text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-6">
        <motion.div className="max-w-4xl mx-auto text-center" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to Master Your Crypto Portfolio?
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg mb-8 text-white/80">
            Join thousands of crypto enthusiasts tracking their investments with CryptoTrack Pro
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link to={isLoggedIn ? "/home" : "/login"}
              className="px-10 py-4 bg-white text-indigo-600 rounded-xl font-extrabold text-lg hover:shadow-2xl transition transform hover:scale-105 inline-block">
              {isLoggedIn ? "Go to App" : "Start For Free"}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-gray-400 px-6 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-3">CryptoTrack Pro</h3>
              <p className="text-sm">Professional crypto portfolio tracker built for modern investors</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#features"     className="hover:text-white transition">Features</a></li>
                <li><a href="#about"        className="hover:text-white transition">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3">Get Started</h4>
              <Link to="/login" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition inline-block text-sm">
                Login
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm">
            <p>© 2026 CryptoTrack Pro · Built with 💙 by <strong className="text-white">Sadiya </strong> · Ultimez Technology</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Landing;
