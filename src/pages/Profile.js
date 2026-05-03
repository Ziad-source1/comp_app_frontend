import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../compenent/Navbar";
import Footer from "../compenent/Footer";

const API = "http://localhost:8080";

const ROLE_CONFIG = {
  Buyer: {
    icon: "🛒",
    color: "var(--accent)",
    bg: "rgba(0, 212, 255, 0.08)",
    border: "rgba(0, 212, 255, 0.2)",
    label: "Buyer Account",
  },
  Seller: {
    icon: "🎮",
    color: "#a78bfa",
    bg: "rgba(124, 58, 237, 0.08)",
    border: "rgba(124, 58, 237, 0.2)",
    label: "Seller Account",
  },
  Admin: {
    icon: "🛡️",
    color: "var(--accent3)",
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.2)",
    label: "Administrator",
  },
};

function Avatar({ username, role }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.Buyer;
  const initials = (username || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{
      width: 90, height: 90,
      borderRadius: "50%",
      background: cfg.bg,
      border: `3px solid ${cfg.color}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 32, fontFamily: "Rajdhani, sans-serif", fontWeight: 700,
      color: cfg.color,
      boxShadow: `0 0 24px ${cfg.bg}`,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 0",
      borderBottom: "1px solid var(--border)",
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text3)" }}>
        {label}
      </span>
      <span style={{
        fontSize: 14, color: "var(--text)",
        fontFamily: mono ? "monospace" : "inherit",
        background: mono ? "var(--bg2)" : "none",
        padding: mono ? "2px 8px" : "0",
        borderRadius: mono ? 4 : 0,
      }}>
        {value || "—"}
      </span>
    </div>
  );
}

function SellerSection({ sellerId }) {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) { setLoading(false); return; }
    axios.get(`${API}/sellers?id=${sellerId}`)
      .then((r) => setSeller(Array.isArray(r.data) ? r.data[0] : null))
      .catch(() => setSeller(null))
      .finally(() => setLoading(false));
  }, [sellerId]);

  if (!sellerId) return null;

  return (
    <div style={{
      background: "rgba(124, 58, 237, 0.06)",
      border: "1px solid rgba(124, 58, 237, 0.2)",
      borderRadius: 10, padding: "20px 24px", marginTop: 20,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#a78bfa", marginBottom: 14 }}>
        🎮 Seller Profile
      </div>
      {loading ? (
        <div style={{ color: "var(--text3)", fontSize: 13 }}>Loading seller info...</div>
      ) : seller ? (
        <>
          <InfoRow label="Seller ID" value={`#${seller.id}`} />
          <InfoRow label="Verification" value={
            <span className={`status-pill ${seller.verification_status}`}>
              {seller.verification_status}
            </span>
          } />
          <InfoRow label="Seller Since" value={seller.created_at ? new Date(seller.created_at).toLocaleDateString() : "—"} />
        </>
      ) : (
        <div style={{ color: "var(--text3)", fontSize: 13 }}>Seller info not found</div>
      )}
    </div>
  );
}

function EditModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    username: user.username || "",
    email: user.email || "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    if (!form.username.trim()) return setError("Username is required");
    if (!form.email.includes("@")) return setError("Valid email is required");
    setLoading(true);
    try {
      const body = { username: form.username, email: form.email };
      if (form.password) body.password = form.password;
      else body.password = user.password; // keep existing

      await axios.put(`${API}/users?id=${user.id}`, body);

      // Update localStorage
      const updated = { ...user, username: form.username, email: form.email };
      localStorage.setItem("user", JSON.stringify(updated));
      onSaved(updated);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✏️ Edit Profile</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="Your username"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>New Password <span style={{ color: "var(--text3)", fontWeight: 400 }}>(leave blank to keep current)</span></label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn btn-ghost btn-full" type="button" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const localUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!localUser) { setError("Not logged in"); setLoading(false); return; }
    axios.get(`${API}/users?id=${localUser.id}`)
      .then((r) => {
        const rows = Array.isArray(r.data) ? r.data : [r.data];
        setUserData(rows[0]);
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  function handleSaved(updated) {
    setUserData(updated);
    setShowEdit(false);
    setSuccessMsg("✅ Profile updated successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  const cfg = ROLE_CONFIG[userData?.role] || ROLE_CONFIG.Buyer;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content" style={{ maxWidth: 680 }}>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {loading && (
          <div className="loading-wrap">
            <div className="loading-spinner" />
            <span>Loading profile...</span>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && userData && (
          <>
            {/* Header card */}
            <div style={{
              background: "var(--surface)",
              border: `1px solid ${cfg.border}`,
              borderRadius: 14,
              padding: 28,
              marginBottom: 20,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Background glow */}
              <div style={{
                position: "absolute", top: -60, right: -60,
                width: 200, height: 200, borderRadius: "50%",
                background: cfg.bg,
                pointerEvents: "none",
              }} />

              <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative" }}>
                <Avatar username={userData.username} role={userData.role} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <h1 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 26, fontWeight: 700, margin: 0 }}>
                      {userData.username}
                    </h1>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`
                    }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <div style={{ color: "var(--text2)", fontSize: 14 }}>{userData.email}</div>
                  <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 4 }}>
                    Member since {userData.created_at ? new Date(userData.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={() => setShowEdit(true)}>
                  ✏️ Edit
                </button>
              </div>
            </div>

            {/* Account info card */}
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "8px 24px", marginBottom: 20,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text3)", padding: "16px 0 4px" }}>
                Account Information
              </div>
              <InfoRow label="User ID" value={`#${userData.id}`} mono />
              <InfoRow label="Username" value={userData.username} />
              <InfoRow label="Email" value={userData.email} />
              <InfoRow label="Role" value={
                <span className={`role-pill ${userData.role}`}>{userData.role}</span>
              } />
              <InfoRow label="Password" value="••••••••" mono />
              <div style={{ padding: "14px 0 4px" }} />
            </div>

            {/* Seller section — only if user is a Seller */}
            {userData.role === "Seller" && (
              <SellerSection sellerId={userData.seller_id} />
            )}

            {/* Admin info */}
            {userData.role === "Admin" && (
              <div style={{
                background: "rgba(245, 158, 11, 0.06)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: 10, padding: "20px 24px",
                marginTop: 4,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--accent3)", marginBottom: 10 }}>
                  🛡️ Admin Privileges
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>
                  You have full access to the platform. You can manage users, verify sellers,
                  resolve disputes, and control escrow transactions from the Admin Panel.
                </div>
              </div>
            )}

            {/* Buyer tip */}
            {userData.role === "Buyer" && (
              <div style={{
                background: "rgba(0, 212, 255, 0.06)",
                border: "1px solid rgba(0, 212, 255, 0.15)",
                borderRadius: 10, padding: "20px 24px",
                marginTop: 4,
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{ fontSize: 24 }}>💡</span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Want to become a Seller?</div>
                  <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                    Submit your identity verification and our admin team will upgrade your account.
                  </div>
                  <a href="/apply-verification" style={{
                    display: "inline-block", marginTop: 10, fontSize: 13,
                    color: "var(--accent)", textDecoration: "none", fontWeight: 600,
                  }}>
                    Apply Now →
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showEdit && userData && (
        <EditModal
          user={userData}
          onClose={() => setShowEdit(false)}
          onSaved={handleSaved}
        />
      )}
      <Footer />
    </div>
  );
}

export default Profile;