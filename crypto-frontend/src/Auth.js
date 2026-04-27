import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { FaLock, FaEye, FaEyeSlash, FaEnvelope } from "react-icons/fa";

const BASE_URL = "https://crypto-backend-2ryf.onrender.com";

function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 🔥 NEW PASSWORD VALIDATION (IMPORTANT)
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email";

    if (!formData.password) {
      newErrors.password = "Password is required";
    } 
    // ✅ UPDATED CONDITION
    else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Min 8 chars with letter, number & symbol";
    }

    if (!isLogin) {
      if (!formData.confirmPassword)
        newErrors.confirmPassword = "Confirm your password";
      else if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        try {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);
        } catch {}
        toast.success("Login successful!");
        navigate("/dashboard");
      } else toast.error(data.message || "Login failed");
    } catch {
      toast.error("Network error");
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Account created! Please login.");
        setIsLogin(true);
        setFormData({ email: formData.email, password: "", confirmPassword: "" });
      } else toast.error(data.message || "Signup failed");
    } catch {
      toast.error("Network error");
    }
    setLoading(false);
  };
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ email: formData.email, password: "", confirmPassword: "" });
  };

  return (
    <div style={styles.bg}>
      <Toaster position="top-right" />
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 style={styles.title}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </motion.h2>

        <motion.form onSubmit={isLogin ? handleLogin : handleSignup}>
          <div style={styles.inputContainer}>
            <FaEnvelope style={styles.icon} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              style={styles.input(errors.email)}
              disabled={loading}
            />
          </div>
          {errors.email && <span style={styles.error}>{errors.email}</span>}

          <div style={styles.inputContainer}>
            <FaLock style={styles.icon} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              style={styles.input(errors.password)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && <span style={styles.error}>{errors.password}</span>}

          {!isLogin && (
            <div style={styles.inputContainer}>
              <FaLock style={styles.icon} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={styles.input(errors.confirmPassword)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                style={styles.eyeButton}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.confirmPassword && (
                <span style={styles.error}>{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Loading..." : isLogin ? "Login" : "Create Account"}
          </button>
        </motion.form>

        <p style={styles.switch} onClick={toggleMode}>
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  bg: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #e0eafc, #cfdef3)"
  },
  card: {
    width: "400px",
    background: "#fff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    textAlign: "center"
  },
  title: {
    color: "#333",
    marginBottom: "30px",
    fontSize: "28px",
    fontWeight: "600"
  },
  inputContainer: { position: "relative", margin: "15px 0" },
  icon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#666",
    zIndex: 1
  },
  input: (hasError) => ({
    width: "100%",
    padding: "15px 15px 15px 45px",
    border: `2px solid ${hasError ? '#ff4757' : '#ddd'}`,
    borderRadius: "10px",
    fontSize: "16px",
    background: "#fff",
    color: "#333",
    outline: "none",
    boxSizing: "border-box"
  }),
  eyeButton: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#666",
    cursor: "pointer",
    fontSize: "16px"
  },
  error: {
    color: "#ff4757",
    fontSize: "14px",
    textAlign: "left",
    marginTop: "5px",
    display: "block"
  },
  btn: {
    width: "100%",
    padding: "15px",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "20px"
  },
  switch: {
    marginTop: "20px",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "14px",
    textDecoration: "underline"
  }
};

export default Auth;