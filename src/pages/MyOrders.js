import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../compenent/Navbar";
import Footer from "../compenent/Footer";

const API = "http://localhost:8080";

function DisputeModal({ order, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) return setError("Please describe the issue");
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/dispute`, {
        order_id: order.id,
        reason,
        dispute_status: "Open",
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.Message || "Failed to submit dispute");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🚨 Open Dispute</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--bg2)", borderRadius: 8, fontSize: 13 }}>
          <span style={{ color: "var(--text3)" }}>Order #{order.id} — </span>
          <span style={{ color: "var(--text2)" }}>${Number(order.total_price).toFixed(2)}</span>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>What happened?</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue (e.g. seller took payment but didn't deliver the service)"
              style={{ minHeight: 100 }}
              required
            />
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
            ⚠ Disputes are reviewed by admin. Funds are held in escrow until resolved.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost btn-full" type="button" onClick={onClose}>Cancel</button>
            <button className="btn btn-danger btn-full" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Dispute"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviewModal({ order, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/reviews`, {
        order_id: order.id,
        rating,
        comment,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.Message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⭐ Leave a Review</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating</label>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  style={{
                    fontSize: 24, background: "none", border: "none", cursor: "pointer",
                    filter: n <= rating ? "none" : "grayscale(1) opacity(0.3)",
                    transition: "filter 0.15s"
                  }}
                >⭐</button>
              ))}
              <span style={{ marginLeft: 8, color: "var(--text3)", fontSize: 13, alignSelf: "center" }}>
                {rating}/5
              </span>
            </div>
          </div>
          <div className="form-group">
            <label>Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this seller..."
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost btn-full" type="button" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disputeOrder, setDisputeOrder] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function fetchOrders() {
    axios
      .get(`${API}/orders/search?keyword=buyer_id&keyvalue=${user.id}&sort=desc`)
      .then((r) => setOrders(r.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchOrders(); }, []);

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content" style={{ flex: 1 }}>
        <div className="page-header">
          <h1>📦 My Orders</h1>
          <p>Track your purchases and manage any issues</p>
        </div>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {loading ? (
          <div className="loading-wrap">
            <div className="loading-spinner" />
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <p>No orders yet. Go browse the store!</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
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
                    <td>Game #{o.game_id}</td>
                    <td style={{ color: "var(--accent)", fontWeight: 600 }}>
                      ${Number(o.total_price).toFixed(2)}
                    </td>
                    <td><span className={`status-pill ${o.order_status}`}>{o.order_status}</span></td>
                    <td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {o.order_status === "Completed" && (
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => setReviewOrder(o)}
                          >
                            ⭐ Review
                          </button>
                        )}
                        {(o.order_status === "Pending" || o.order_status === "Paid") && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => setDisputeOrder(o)}
                          >
                            🚨 Dispute
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {disputeOrder && (
        <DisputeModal
          order={disputeOrder}
          onClose={() => setDisputeOrder(null)}
          onSuccess={() => {
            setDisputeOrder(null);
            showSuccess("✅ Dispute submitted. Admin will review shortly.");
          }}
        />
      )}

      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSuccess={() => {
            setReviewOrder(null);
            showSuccess("✅ Review submitted. Thank you!");
          }}
        />
      )}
      <Footer />
    </div>
  );
}

export default MyOrders;