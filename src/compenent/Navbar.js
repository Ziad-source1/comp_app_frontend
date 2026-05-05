import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8080";

function Navbar({ searchValue, onSearchChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [dbRole, setDbRole] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 GET ROLE FROM DATABASE
  useEffect(() => {
    if (!user) return;

    axios
      .get(`${API}/users?id=${user.id}`)
      .then((res) => {
        setDbRole(res.data[0].role);
        console.log("Fetched user role from DB:", res.data[0].role);
        setUser(res.data[0]); 
      })
      .catch(() => setDbRole(""))
      .finally(() => setLoading(false));
  }, []);
  
  function logout() {
    localStorage.removeItem("user");
    navigate("/");
  }

  function toggleRole() {
    if (!user) return;

    const newRole = user.role === "Buyer" ? "Seller" : "Buyer";

    const updatedUser = { ...user, role: newRole };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);

    navigate(newRole === "Seller" ? "/seller" : "/home");
  }

  return (
    <nav className="navbar">

      {/* BRAND */}
      {user?.role !== "Admin" && (
        <Link to="/home" className="navbar-brand">
          <img src="/logo.png" alt="Logo" style={{ width: 44, height: 44 }} />
          <span>LEVEL-UP</span>
        </Link>
      )}

      <button onClick={() => window.history.back()} className="nav-chip">
        ← Back
      </button>

      {/* SEARCH */}
      {onSearchChange && (
        <div className="navbar-center">
          <div className="search-wrap">
            <span>🔍</span>
            <input
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search games..."
            />
          </div>
        </div>
      )}
      

      <div className="navbar-right">
        {user && (
          <>
            <div className="user-badge">
              <span>{user.username}</span>
              <span className={`role-pill ${user.role}`}>
                {user.role}
              </span>
            </div>

            <Link to="/profile" className="nav-chip">👤 Profile</Link>

            {user.role !== "Admin" && (
              <Link to="/my-orders" className="nav-chip">📦 Orders</Link>
            )}

            {user.role === "Seller" && (
              <Link to="/seller" className="nav-chip">🎮 Dashboard</Link>
            )}

            {user.role === "Buyer" && (
              <Link to="/apply-verification" className="nav-chip">
                🪪 Apply Seller
              </Link>
            )}

            {/* 🔥 THE ONLY IMPORTANT PART */}
            <button
              className="nav-chip"
              onClick={toggleRole}
              disabled={dbRole !== "Seller"}
              style={{
                opacity: dbRole === "Seller" ? 1 : 0.4,
                cursor: dbRole === "Seller" ? "pointer" : "not-allowed",
              }}
            >
              🔄 Switch Role
            </button>

            <ThemeToggle />

            <button className="nav-chip logout" onClick={logout}>
              ⏏ Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;