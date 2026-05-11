import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../compenent/Navbar";
import Footer from "../compenent/Footer";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8080";

const GAME_EMOJIS = {
  roblox: "🟥", fifa26: "⚽", "gta-v": "🚗", minecraft: "⛏️", fortnite: "🎯",
  valorant: "🔫", league: "⚔️", default: "🎮"
};

const BANNER_GRADIENTS = [
  "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
  "linear-gradient(135deg, #1a0533, #2d1b69, #11998e)",
  "linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e)",
  "linear-gradient(135deg, #200122, #6f0000, #200122)",
  "linear-gradient(135deg, #001, #003, #006)",
];

function Stars({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? "#f59e0b" : "var(--border)", fontSize: 14 }}>★</span>
      ))}
    </span>
  );
}

function GameCard({ game, onDetails }) {
  const emoji = GAME_EMOJIS[game.name?.toLowerCase()] || GAME_EMOJIS.default;
  const gradient = BANNER_GRADIENTS[game.id % BANNER_GRADIENTS.length];

  return (
    <div className="game-card" onClick={() => onDetails(game)} style={{ cursor: "pointer" }}>
      <div className="game-card-banner" style={{ background: gradient }}>
        <span style={{ fontSize: 48 }}>{emoji}</span>
        <span className="category-badge" style={{ position: "absolute", top: 10, right: 10 }}>
          {game.category || "game"}
        </span>
      </div>
      <div className="game-card-body">
        <div className="game-card-name">{game.name}</div>
        <div className="game-card-title">{game.title}</div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>
          {game.description?.slice(0, 60)}{game.description?.length > 60 ? "..." : ""}
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10 }}>
          Stock:{" "}
          <span style={{ color: game.stock_quantity > 0 ? "var(--success)" : "var(--danger)" }}>
            {game.stock_quantity > 0 ? game.stock_quantity : "Out of stock"}
          </span>
        </div>
        <div className="game-card-footer">
          <span className="game-price">${Number(game.price).toFixed(2)}</span>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>Click to view →</span>
        </div>
      </div>
    </div>
  );
}

function BuyModal({ game, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  async function handleBuy() {
    setLoading(true);
    setError("");
    try {
      // 1. Create order
      await axios.post(`${API}/orders`, {
        buyer_id: user.id,
        game_id: game.id,
        total_price: game.price,
        order_status: "Pending",
        sellers_id: game.seller_id,
      });

      // 2. Reduce stock by 1
      await axios.put(`${API}/game?id=${game.id}`, {
        description: game.description,
        price: Number(game.price),
        stock_quantity: Number(game.stock_quantity) - 1,
      });

      // 3. Close and notify
      onClose();
      if (onSuccess) onSuccess();

      // 4. Go to checkout
      navigate("/checkout", { state: { game } });

    } catch (err) {
      setError(err.response?.data?.Message || "Order failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🎮 Confirm Purchase</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Rajdhani, sans-serif", marginBottom: 4 }}>
            {game.name} — {game.title}
          </div>
          <div style={{ color: "var(--text2)", fontSize: 13, marginBottom: 12 }}>{game.description}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="category-badge">{game.category}</span>
            <span className="game-price">${Number(game.price).toFixed(2)}</span>
          </div>
        </div>
        <div style={{
          background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)",
          borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "var(--text2)", marginBottom: 20
        }}>
          ⚡ Payment is held in escrow until the seller completes your order.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-full" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary btn-full" onClick={handleBuy} disabled={loading}>
            {loading ? "Processing..." : `Pay $${Number(game.price).toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailsModal({ game, onClose, onBuy }) {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const emoji = GAME_EMOJIS[game.name?.toLowerCase()] || GAME_EMOJIS.default;
  const gradient = BANNER_GRADIENTS[game.id % BANNER_GRADIENTS.length];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const ordersRes = await axios.get(
          `${API}/orders/search?keyword=game_id&keyvalue=${game.id}&sort=asc`
        );
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        if (orders.length === 0) { setReviews([]); return; }
        const results = await Promise.all(
          orders.map((o) =>
            axios.get(`${API}/reviews/search?keyword=order_id&keyvalue=${o.id}&sort=asc`)
              .catch(() => ({ data: [] }))
          )
        );
        const allReviews = results.flatMap((r) => Array.isArray(r.data) ? r.data : []);
        setReviews(allReviews.slice(0, 8));
      } catch {
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [game.id]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <div style={{
          height: 180, background: gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", borderRadius: "16px 16px 0 0", flexShrink: 0,
        }}>
          <span style={{ fontSize: 72 }}>{emoji}</span>
          <span className="category-badge" style={{ position: "absolute", top: 16, right: 16, fontSize: 12, padding: "5px 12px" }}>
            {game.category}
          </span>
          <button onClick={onClose} style={{
            position: "absolute", top: 14, left: 14,
            background: "rgba(0,0,0,0.5)", border: "none", color: "white",
            borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 18, lineHeight: 1
          }}>×</button>
        </div>

        <div style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <h2 style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 28, fontWeight: 700, textTransform: "capitalize" }}>
                {game.name}
              </h2>
              <div style={{ color: "var(--text2)", fontSize: 15, marginTop: 2 }}>{game.title}</div>
            </div>
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: 34, fontWeight: 700, color: "var(--accent)", whiteSpace: "nowrap" }}>
              ${Number(game.price).toFixed(2)}
            </div>
          </div>

          {avgRating && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Stars rating={Math.round(avgRating)} />
              <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 14 }}>{avgRating}</span>
              <span style={{ color: "var(--text3)", fontSize: 13 }}>
                ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Category", value: game.category, color: null },
              {
                label: "Availability",
                value: game.stock_quantity > 0 ? `${game.stock_quantity} in stock` : "Out of stock",
                color: game.stock_quantity > 0 ? "var(--success)" : "var(--danger)"
              },
              { label: "Seller ID", value: `#${game.seller_id}`, color: null },
              {
                label: "Listed On",
                value: game.created_at ? new Date(game.created_at).toLocaleDateString() : "—",
                color: null
              },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--bg2)", borderRadius: 8, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontWeight: 600, color: color || "var(--text)", textTransform: "capitalize" }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text3)", marginBottom: 8 }}>
              Description
            </div>
            <div style={{ background: "var(--bg2)", borderRadius: 8, padding: "14px 16px", color: "var(--text2)", fontSize: 14, lineHeight: 1.7 }}>
              {game.description || "No description provided."}
            </div>
          </div>

          <div style={{
            background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)",
            borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "var(--text2)",
            marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10
          }}>
            <span style={{ fontSize: 18 }}>🔐</span>
            <span>Your payment is protected by escrow. Funds are only released to the seller after delivery. You can open a dispute if something goes wrong.</span>
          </div>

          {user?.role === "Buyer" && game.stock_quantity > 0 && (
            <button className="btn btn-primary btn-full btn-lg" onClick={() => { onClose(); onBuy(game); }}>
              🛒 Buy Now — ${Number(game.price).toFixed(2)}
            </button>
          )}
          {user?.role === "Buyer" && game.stock_quantity === 0 && (
            <button className="btn btn-full btn-lg" disabled style={{ opacity: 0.4 }}>Out of Stock</button>
          )}
          {user?.role !== "Buyer" && (
            <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 13, padding: "10px 0" }}>
              {user?.role === "Seller" ? "Sellers cannot purchase listings" : "Log in as a Buyer to purchase"}
            </div>
          )}

          <div style={{ height: 1, background: "var(--border)", margin: "24px 0 20px" }} />
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text3)", marginBottom: 14 }}>
            Customer Reviews
          </div>

          {loadingReviews ? (
            <div style={{ color: "var(--text3)", fontSize: 13, textAlign: "center", padding: 20 }}>Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div style={{ background: "var(--bg2)", borderRadius: 8, padding: 20, textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
              No reviews yet — be the first to purchase and leave one!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{ background: "var(--bg2)", borderRadius: 8, padding: "14px 16px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <Stars rating={rev.rating} />
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                    {rev.comment || <em style={{ color: "var(--text3)" }}>No comment left</em>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [detailGame, setDetailGame] = useState(null);
  const [buyGame, setBuyGame] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (user?.role === "Seller") navigate("/seller");
  }, [user, navigate]);

  useEffect(() => {
    axios.get(`${API}/game/all`)
      .then((r) => setGames(r.data))
      .catch(() => setError("Failed to load games"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = games.filter(
    (g) =>
      (g.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (g.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (g.title || "").toLowerCase().includes(search.toLowerCase())
  );

  function handleBuySuccess() {
    setBuyGame(null);
    setSuccessMsg("✅ Order placed! Check My Orders for updates.");
    setTimeout(() => setSuccessMsg(""), 5000);
  }

  return (
    <div className="page-wrapper">
      <Navbar searchValue={search} onSearchChange={setSearch} />
      <div className="page-content" style={{ flex: 1 }}>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <div className="page-header">
          <h1>🎮 Game Store</h1>
          <p>Browse boosting services, currency, and more from verified sellers</p>
        </div>

        {loading && (
          <div className="loading-wrap">
            <div className="loading-spinner" />
            <span>Loading games...</span>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && (
          <>
            <div style={{ marginBottom: 16, color: "var(--text3)", fontSize: 13 }}>
              {search ? `${filtered.length} results for "${search}"` : `${filtered.length} listings available`}
            </div>
            {filtered.length > 0 ? (
              <div className="games-grid">
                {filtered.map((game) => (
                  <GameCard key={game.id} game={game} onDetails={setDetailGame} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <p>No games found for "{search}"</p>
              </div>
            )}
          </>
        )}
      </div>

      {detailGame && (
        <DetailsModal
          game={detailGame}
          onClose={() => setDetailGame(null)}
          onBuy={(game) => {
            setDetailGame(null);
            setBuyGame(game);
          }}
        />
      )}

      {buyGame && (
        <BuyModal
          game={buyGame}
          onClose={() => setBuyGame(null)}
          onSuccess={handleBuySuccess}
        />
      )}

      <Footer />
    </div>
  );
}

export default Home;