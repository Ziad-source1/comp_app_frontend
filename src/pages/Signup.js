import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8080";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match");
    if (password.length < 4) return setError("Password must be at least 4 characters");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/register`, { username, email, password });
      const user = res.data.data.user;
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-glow tl" />
      <div className="auth-bg-glow br" />
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="logo" style={{ width: 52, height: 52, objectFit: "contain" }} />
          <h1>LEVEL-UP</h1>
        </div>
        <p className="auth-subtitle">Create your account and start gaming.</p>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" placeholder="YourGamerTag" value={username}
              onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Confirm</label>
              <input type="password" placeholder="••••••••" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} required />
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;