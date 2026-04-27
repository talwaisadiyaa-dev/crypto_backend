import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { Toaster, toast } from "react-hot-toast";

import ProtectedRoute from "./ProtectedRoute";

import Home from "./Home";
import Watchlist from "./Watchlist";
import Dashboard from "./Dashboard";
import Auth from "./Auth";
import Landing from "./Landing";
import CoinDetails from "./CoinDetails";

import Converter from "./Converter"; // ✅ NEW

function App() {
  const { dark } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const logout = () => {
    localStorage.removeItem("userId");
    toast.success("Logged out 👋");
    navigate("/login");
  };

  const hideNavbar =
    location.pathname === "/" || location.pathname === "/login";

  return (
    <div className={dark ? "bg-slate-900 text-white" : "bg-gray-50 text-black"}>

      <Toaster position="top-right" />

      {!hideNavbar && (
        <nav className={`flex justify-between items-center px-10 py-4 shadow-md backdrop-blur-lg border-b border-white/10 ${dark ? "bg-slate-800/80" : "bg-white/80"}`}>
          <h2 onClick={() => navigate("/home")} className="text-xl font-bold text-pink-500 cursor-pointer">
            🚀 CryptoTrack Pro
          </h2>

          <div className="flex items-center gap-6">
            <Link to="/home"      className={navLink}>Home</Link>
            <Link to="/converter" className={navLink}>Converter</Link>
            

            {userId && (
              <>
                <Link to="/dashboard" className={navLink}>Dashboard</Link>
                <Link to="/watchlist" className={navLink}>Watchlist</Link>
              </>
            )}

            {!userId ? (
              <Link to="/login" className={navLink}>Login</Link>
            ) : (
              <button onClick={logout}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition">
                Logout
              </button>
            )}
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/home"      element={<Home />} />
      
        <Route path="/converter" element={<Converter />} />
        <Route path="/coin/:id"  element={<CoinDetails />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
        <Route path="/login"     element={<Auth />} />
      </Routes>

      {!hideNavbar && (
        <p className="text-center text-gray-400 text-sm py-6">
          Built with ❤️ by sadiya • CryptoTrack Pro
        </p>
      )}
    </div>
  );
}

const navLink = "text-sm font-medium hover:text-pink-400 transition duration-200";

export default App;