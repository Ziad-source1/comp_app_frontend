import { useState } from "react";
import axios from "axios";
import Navbar from "../compenent/Navbar";
import Footer from "../compenent/Footer";

const API = "http://localhost:8080";

function ApplyVerification() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [form, setForm] = useState({
    passport_id: "",
    f_name: "",
    l_name: "",
    dob: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // First create a seller record with pending status
      const sellerRes = await axios.post(`${API}/sellers`, {
        username: user.username,
        email: user.email,
        password: user.password || "placeholder",
        verification_status: "Pending",
      });
      const sellerId = sellerRes.data.Message?.match(/\d+/)?.[0] || sellerRes.data.insertId;

      // Submit verification doc
      await axios.post(`${API}/verification_doc`, {
        passport_id: Number(form.passport_id),
        seller_id: user.seller_id || sellerId || user.id,
        f_name: form.f_name,
        l_name: form.l_name,
        dob: form.dob,
        selfie_holding_id_img: "pending_upload.png",
      });

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.Message || err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content" style={{ maxWidth: 600 }}>
        <div className="page-header">
          <h1>🪪 Apply to Become a Seller</h1>
          <p>Submit your identity verification to start selling on Level-Up</p>
        </div>

        {success ? (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ marginBottom: 8 }}>Application Submitted!</h2>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>
              Your verification documents are under review. Admin will process your request
              and upgrade your account to Seller status.
            </p>
          </div>
        ) : (
          <div className="card">
            <div style={{
              background: "rgba(0, 212, 255, 0.06)",
              border: "1px solid rgba(0, 212, 255, 0.15)",
              borderRadius: 8,
              padding: "14px 16px",
              marginBottom: 24,
              fontSize: 13,
              color: "var(--text2)",
            }}>
              ℹ Your information will be reviewed by our admin team. Once verified, your account
              role will be upgraded from <strong>Buyer</strong> to <strong>Seller</strong>.
            </div>

            {error && <div className="alert alert-error">⚠ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    name="f_name"
                    value={form.f_name}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    name="l_name"
                    value={form.l_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Passport / National ID Number</label>
                <input
                  name="passport_id"
                  type="number"
                  value={form.passport_id}
                  onChange={handleChange}
                  placeholder="1234567890"
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Selfie with ID (Upload coming soon)</label>
                <div style={{
                  border: "2px dashed var(--border)",
                  borderRadius: 8,
                  padding: "24px",
                  textAlign: "center",
                  color: "var(--text3)",
                  fontSize: 13,
                }}>
                  📷 File upload will be available in the next update
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Verification →"}
              </button>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default ApplyVerification;