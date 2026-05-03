import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../compenent/Navbar";
import Footer from "../compenent/Footer";

const API = "http://localhost:8080";

function AddGameModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "", title: "", description: "", category: "", price: "", stock_quantity: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/game`, {
        ...form,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
        seller_id: user.seller_id || user.id,
      });
      console.log(user)
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.Message || "Failed to add game");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>➕ New Listing</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Game Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Roblox" required />
            </div>
            <div className="form-group">
              <label>Listing Title</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. 1000 Robux" required />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe what you're offering..." required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select category</option>
                <option value="currency">Currency</option>
                <option value="boosting">Boosting</option>
                <option value="accounts">Accounts</option>
                <option value="coaching">Coaching</option>
                <option value="items">Items</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="9.99" required />
            </div>
          </div>
          <div className="form-group">
            <label>Stock Quantity</label>
            <input name="stock_quantity" type="number" min="1" value={form.stock_quantity} onChange={handleChange} placeholder="10" required />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost btn-full" type="button" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditGameModal({ game, onClose, onSuccess }) {
  const [form, setForm] = useState({
    description: game.description || "",
    price: game.price || "",
    stock_quantity: game.stock_quantity || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.put(`${API}/game?id=${game.id}`, {
        description: form.description,
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.Message || "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✏️ Edit Listing</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Price ($)</label>
              <input type="number" min="0" step="0.01" value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" min="0" value={form.stock_quantity}
                onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
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

function SellerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  console.log(user)
  const [games, setGames] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("listings");
  const [showAdd, setShowAdd] = useState(false);
  const [editGame, setEditGame] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  var x,y;

  function fetchAll() {
    const sellerId = user.seller_id || user.id;
    console.log(sellerId)
    Promise.all([
      axios.get(`${API}/game/search?keyword=seller_id&keyvalue=${sellerId}&sort=desc`).catch(() => ({ data: [] })),
      axios.get(`${API}/orders/search?keyword=sellers_id&keyvalue=${sellerId}&sort=desc`).catch(() => ({ data: [] })),
    ]).then(([g, o]) => {
      setGames(Array.isArray(g.data) ? g.data : []);
      
      console.log(g.data)
      
      console.log(o.data)
      setOrders(Array.isArray(o.data) ? o.data : []);
    }).finally(() => setLoading(false));
  }

  console.log(x,y)
  useEffect(() => { fetchAll(); }, []);

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  async function deleteGame(id) {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await axios.delete(`${API}/game?id=${id}`);
      showSuccess("Listing deleted");
      fetchAll();
    } catch {
      alert("Failed to delete");
    }
  }

  async function updateOrderStatus(id, status) {
    try {
      await axios.put(`${API}/orders?id=${id}`, { order_status: status });
      showSuccess(`Order #${id} marked as ${status}`);
      fetchAll();
    } catch {
      alert("Failed to update");
    }
  }

  const totalRevenue = orders
    .filter((o) => o.order_status === "Completed")
    .reduce((s, o) => s + Number(o.total_price), 0);

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content" style={{ flex: 1 }}>
        <div className="page-header">
          <h1>🎮 Seller Dashboard</h1>
          <p>Manage your listings and track orders</p>
        </div>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <div className="stats-grid">
          <div className="stat-card cyan">
            <div className="stat-label">Active Listings</div>
            <div className="stat-value">{games.length}</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{orders.length}</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">Pending Orders</div>
            <div className="stat-value">{orders.filter((o) => o.order_status === "Pending").length}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Revenue</div>
            <div className="stat-value">${totalRevenue.toFixed(0)}</div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "listings" ? "active" : ""}`} onClick={() => setTab("listings")}>
            🎮 My Listings
          </button>
          <button className={`tab ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>
            📦 Orders
          </button>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="loading-spinner" /></div>
        ) : tab === "listings" ? (
          <>
            <div className="section-header">
              <span className="section-title">Listings ({games.length})</span>
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                ➕ Add Listing
              </button>
            </div>
            {games.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎮</span>
                <p>No listings yet. Add your first one!</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Game</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((g) => (
                      <tr key={g.id}>
                        <td style={{ color: "var(--text3)" }}>#{g.id}</td>
                        <td style={{ color: "var(--text)", fontWeight: 600, textTransform: "capitalize" }}>
                          {g.name}
                        </td>
                        <td>{g.title}</td>
                        <td><span className="category-badge">{g.category}</span></td>
                        <td style={{ color: "var(--accent)", fontWeight: 600 }}>
                          ${Number(g.price).toFixed(2)}
                        </td>
                        <td style={{ color: g.stock_quantity > 0 ? "var(--success)" : "var(--danger)" }}>
                          {g.stock_quantity}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-sm btn-ghost" onClick={() => setEditGame(g)}>✏️ Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteGame(g.id)}>🗑 Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="section-header">
              <span className="section-title">Orders ({orders.length})</span>
            </div>
            {orders.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📦</span>
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Buyer ID</th>
                      <th>username</th>
                      <th>Game ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                      <td style={{ color: "var(--text)", fontWeight: 600 }}>#{o.id}</td>

                      <td>User #{o.buyer_id}</td>

                      {/*  show username here */}
                      <td>{o.username || "—"}</td>

                     <td>Game #{o.game_id}</td>

                     <td style={{ color: "var(--accent)", fontWeight: 600 }}>
                       ${Number(o.total_price).toFixed(2)}
                      </td>

                      <td>
                      <span className={`status-pill ${o.order_status}`}>
                       {o.order_status}
                      </span>
                      </td>

                      <td style={{ color: "var(--text3)" }}>
                       {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                      </td>

                      <td>
                       {o.order_status === "Pending" && (
                      <button
                        className="btn btn-sm btn-success"
                       onClick={() => updateOrderStatus(o.id, "Completed")}
                       >
                      ✅ Complete
                       </button>
                      )}
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {showAdd && (
        <AddGameModal
          user={user}
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); showSuccess("✅ Listing added!"); fetchAll(); }}
        />
      )}
      {editGame && (
        <EditGameModal
          game={editGame}
          onClose={() => setEditGame(null)}
          onSuccess={() => { setEditGame(null); showSuccess("✅ Listing updated!"); fetchAll(); }}
        />
      )}
      <Footer />
    </div>
  );
}

export default SellerDashboard;