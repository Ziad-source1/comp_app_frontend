import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../compenent/Navbar";
import Footer from "../compenent/Footer";

const API = "http://localhost:8080";

function AdminPanel() {
  const [tab, setTab] = useState("disputes");
  const [disputes, setDisputes] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [verDocs, setVerDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  function fetchAll() {
    setLoading(true);
    Promise.all([
      axios.get(`${API}/dispute?id=%`).catch(() => ({ data: [] })),
      axios.get(`${API}/escrow?id=%`).catch(() => ({ data: [] })),
      axios.get(`${API}/users`).catch(() => ({ data: [] })),
      axios.get(`${API}/sellers?id=%`).catch(() => ({ data: [] })),
      axios.get(`${API}/verification_doc?id=%`).catch(() => ({ data: [] })),
    ]).then(([d, e, u, s, v]) => {
      setDisputes(Array.isArray(d.data) ? d.data : []);
      setEscrows(Array.isArray(e.data) ? e.data : []);
      setUsers(Array.isArray(u.data) ? u.data : []);
      setSellers(Array.isArray(s.data) ? s.data : []);
      setVerDocs(Array.isArray(v.data) ? v.data : []);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { fetchAll(); }, []);

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  async function updateDispute(id, status) {
    try {
      await axios.put(`${API}/dispute?id=${id}`, { dispute_status: status });
      showSuccess(`Dispute #${id} updated to ${status}`);
      fetchAll();
    } catch { alert("Failed"); }
  }

  async function updateEscrow(id, status) {
    try {
      await axios.put(`${API}/escrow?id=${id}`, { escrow_status: status });
      showSuccess(`Escrow #${id} updated to ${status}`);
      fetchAll();
    } catch { alert("Failed"); }
  }

  async function deleteUser(id) {
    if (!window.confirm(`Delete user #${id}?`)) return;
    try {
      await axios.delete(`${API}/users?id=${id}`);
      showSuccess(`User #${id} deleted`);
      fetchAll();
    } catch { alert("Failed"); }
  }

  async function verifySeller(id) {
    try {
      await axios.put(`${API}/sellers?id=${id}`, { verification_status: "Verified" });
      showSuccess(`Seller #${id} verified!`);
      fetchAll();
    } catch { alert("Failed"); }
  }

  async function deleteSeller(id) {
  if (!window.confirm(`Delete seller #${id}?`)) return;
  try {
    await axios.delete(`${API}/sellers?id=${id}`);
    showSuccess(`Seller #${id} deleted`);
    fetchAll();
  } catch { alert("Failed"); }
}

  const stats = {
    openDisputes: disputes.filter((d) => d.dispute_status === "Open").length,
    heldEscrows: escrows.filter((e) => e.escrow_status === "Held").length,
    totalUsers: users.length,
    pendingSellers: sellers.filter((s) => s.verification_status === "Pending").length,
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content" style={{ flex: 1 }}>
        <div className="page-header">
          <h1>🛡️ Admin Panel</h1>
          <p>Full platform management and oversight</p>
        </div>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <div className="stats-grid">
          <div className="stat-card danger" style={{ borderLeft: "3px solid var(--danger)" }}>
            <div className="stat-label">Open Disputes</div>
            <div className="stat-value" style={{ color: stats.openDisputes > 0 ? "var(--danger)" : "var(--text)" }}>
              {stats.openDisputes}
            </div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">Held Escrows</div>
            <div className="stat-value">{stats.heldEscrows}</div>
          </div>
          <div className="stat-card cyan">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-label">Pending Verifications</div>
            <div className="stat-value">{stats.pendingSellers}</div>
          </div>
        </div>

        <div className="tabs">
          {["disputes", "escrows", "users", "sellers", "verifications"].map((t) => (
            <button
              key={t}
              className={`tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "disputes" && "🚨 "}
              {t === "escrows" && "🔐 "}
              {t === "users" && "👥 "}
              {t === "sellers" && "🎮 "}
              {t === "verifications" && "🪪 "}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="loading-spinner" /></div>
        ) : (
          <>
            {/* DISPUTES */}
            {tab === "disputes" && (
              <>
                <div className="section-header">
                  <span className="section-title">Disputes ({disputes.length})</span>
                </div>
                {disputes.length === 0 ? (
                  <div className="empty-state"><span className="empty-icon">✅</span><p>No disputes</p></div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Order ID</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {disputes.map((d) => (
                          <tr key={d.id}>
                            <td style={{ color: "var(--text)", fontWeight: 600 }}>#{d.id}</td>
                            <td>Order #{d.order_id}</td>
                            <td style={{ maxWidth: 240, color: "var(--text2)" }}>
                              {d.reason?.slice(0, 80)}{d.reason?.length > 80 ? "..." : ""}
                            </td>
                            <td><span className={`status-pill ${d.dispute_status?.replace(" ", "\\ ")}`}>{d.dispute_status}</span></td>
                            <td style={{ color: "var(--text3)" }}>
                              {d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {d.dispute_status === "Open" && (
                                  <button className="btn btn-sm btn-ghost"
                                    onClick={() => updateDispute(d.id, "In Review")}>
                                    🔍 Review
                                  </button>
                                )}
                                {(d.dispute_status === "Open" || d.dispute_status === "In Review") && (
                                  <>
                                    <button className="btn btn-sm btn-success"
                                      onClick={() => updateDispute(d.id, "Resolved")}>
                                      ✅ Resolve
                                    </button>
                                    <button className="btn btn-sm btn-danger"
                                      onClick={() => updateDispute(d.id, "Rejected")}>
                                      ❌ Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* ESCROWS */}
            {tab === "escrows" && (
              <>
                <div className="section-header">
                  <span className="section-title">Escrows ({escrows.length})</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Order ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Release Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {escrows.map((e) => (
                        <tr key={e.id}>
                          <td style={{ color: "var(--text)", fontWeight: 600 }}>#{e.id}</td>
                          <td>Order #{e.order_id}</td>
                          <td style={{ color: "var(--accent)", fontWeight: 600 }}>
                            ${Number(e.amount).toFixed(2)}
                          </td>
                          <td><span className={`status-pill ${e.escrow_status}`}>{e.escrow_status}</span></td>
                          <td style={{ color: "var(--text3)" }}>
                            {e.release_date ? new Date(e.release_date).toLocaleDateString() : "—"}
                          </td>
                          <td>
                            {e.escrow_status === "Held" && (
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className="btn btn-sm btn-success"
                                  onClick={() => updateEscrow(e.id, "Released")}>
                                  🔓 Release
                                </button>
                                <button className="btn btn-sm btn-danger"
                                  onClick={() => updateEscrow(e.id, "Refunded")}>
                                  ↩ Refund
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* USERS */}
            {tab === "users" && (
              <>
                <div className="section-header">
                  <span className="section-title">All Users ({users.length})</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td style={{ color: "var(--text3)" }}>#{u.id}</td>
                          <td style={{ color: "var(--text)", fontWeight: 600 }}>{u.username}</td>
                          <td style={{ color: "var(--text2)" }}>{u.email}</td>
                          <td><span className={`role-pill ${u.role}`}>{u.role}</span></td>
                          <td style={{ color: "var(--text3)" }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td>
                            {u.role !== "Admin" && (
                              <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.id)}>
                                🗑 Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* SELLERS */}
            {tab === "sellers" && (
              <>
                <div className="section-header">
                  <span className="section-title">Sellers ({sellers.length})</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Verification</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.map((s) => (
                        <tr key={s.id}>
                          <td style={{ color: "var(--text3)" }}>#{s.id}</td>
                          <td style={{ color: "var(--text)", fontWeight: 600 }}>{s.username}</td>
                          <td style={{ color: "var(--text2)" }}>{s.email}</td>
                          <td>
                            <span className={`status-pill ${s.verification_status}`}>
                              {s.verification_status}
                            </span>
                          </td>
                          <td style={{ color: "var(--text3)" }}>
                            {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                          </td>
                          
                            <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {s.verification_status === "Pending" && (
                          <button className="btn btn-sm btn-success" onClick={() => verifySeller(s.id)}>
                           ✅ Verify
                          </button>
                             )}
                          <button className="btn btn-sm btn-danger" onClick={() => deleteSeller(s.id)}>
                           🗑 Delete
                           </button>
                           </div>
                          </td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* VERIFICATIONS */}
            {tab === "verifications" && (
              <>
                <div className="section-header">
                  <span className="section-title">Verification Docs ({verDocs.length})</span>
                </div>
                {verDocs.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">🪪</span>
                    <p>No verification documents submitted</p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Seller ID</th>
                          <th>Full Name</th>
                          <th>Passport ID</th>
                          <th>Date of Birth</th>
                          <th>Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verDocs.map((v) => (
                          <tr key={v.id}>
                            <td style={{ color: "var(--text3)" }}>#{v.id}</td>
                            <td>Seller #{v.seller_id}</td>
                            <td style={{ color: "var(--text)", fontWeight: 600 }}>
                              {v.f_name} {v.l_name}
                            </td>
                            <td style={{ color: "var(--text2)" }}>{v.passport_id}</td>
                            <td style={{ color: "var(--text3)" }}>
                              {v.dob && v.dob !== "0000-00-00" ? v.dob : "—"}
                            </td>
                            <td style={{ color: "var(--text3)" }}>
                              {v.created_at ? new Date(v.created_at).toLocaleDateString() : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default AdminPanel;