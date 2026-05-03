import ThemeToggle from "./ThemeToggle";
import { Link, useNavigate, useLocation } from "react-router-dom";


function Navbar({ searchValue, onSearchChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function logout() {
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    
    <nav className="navbar">
      {user?.role !== "Admin" && (
      <Link to="/home" className="navbar-brand">
        <img
      src="/logo.png"
      alt="Level-Up Logo"
      style={{ width: 44, height: 44, objectFit: "contain" }}
    />
        <span>LEVEL-UP</span>
      </Link>
    )}

    <button
      onClick={() => window.history.back()}
      className="nav-chip"
      title="Go back"
      style={{ fontSize: 14, padding: "6px 12px" }}
    >
    ← Back
    </button>

      {onSearchChange !== undefined && (
        <div className="navbar-center">
          <div className="search-wrap">
            <input
              type="text"
              placeholder="Search games..."
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <button type="button">Search</button>
          </div>
        </div>
      )}

      <div className="navbar-right">
        {user && (
          <>
            <div className="user-badge">
              <span>{user.username}</span>
              <span className={`role-pill ${user.role}`}>{user.role}</span>
            </div>

            <Link
               to="/profile"
               className={`nav-chip ${location.pathname === "/profile" ? "active" : ""}`}
             >
               👤 Profile
               </Link>

            {user.role !== "Admin" && (
            <Link
               to="/my-orders"
               className={`nav-chip ${location.pathname === "/my-orders" ? "active" : ""}`}
             >
               📦 Orders
              </Link>
            )}

            {user.role === "Buyer" && (
              <Link
                to="/apply-verification"
                className={`nav-chip ${location.pathname === "/apply-verification" ? "active" : ""}`}
              >
                🪪 Apply Seller
              </Link>
            )}

            {user.role === "Seller" && (
              <Link
                to="/seller"
                className={`nav-chip ${location.pathname === "/seller" ? "active" : ""}`}
              >
                🎮 Dashboard
              </Link>
            )}

            {user.role === "Admin" && (
              <Link
                to="/admin"
                className={`nav-chip ${location.pathname === "/admin" ? "active" : ""}`}
              >
                🛡️ Admin
              </Link>
            )}
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