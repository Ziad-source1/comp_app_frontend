import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "../public/checkout.css";

const API = "http://localhost:8080";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const game = location.state?.game;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // 💳 CARD STATE
  const [card, setCard] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: "",
  });

  function handleCardChange(e) {
    setCard({ ...card, [e.target.name]: e.target.value });
  }

  // 🛑 no product fallback
  if (!game) {
    return (
      <div className="checkout-page">
        <div className="checkout-card">
          <h2>⚠️ No product found</h2>
          <p>Please select a product again.</p>

          <button className="checkout-btn" onClick={() => navigate("/home")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // 💳 CONFIRM PAYMENT
  async function confirmPayment() {
  setLoading(true);
  setError("");
  setSuccess("");

  try {
    await axios.post(`${API}/orders`, {
      buyer_id: user.id,
      game_id: game.id,
      total_price: game.price,
      order_status: "Pending",
      sellers_id: game.seller_id,
    });

    setSuccess("🎉 Payment successful!");

    setTimeout(() => {
      navigate("/my-orders");
    }, 2000);

  } catch (err) {
    setError("❌ Payment failed. Please try again.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="checkout-page">

      <div className="checkout-card">

        <h1>🧾 Checkout</h1>
        <p className="subtext">Complete your payment securely</p>

        {/* PRODUCT INFO */}
        <div className="checkout-items">

          <div className="checkout-item">
            <span>Product</span>
            <span>{game.name}</span>
          </div>

          <div className="checkout-item">
            <span>Title</span>
            <span>{game.title}</span>
          </div>

          <div className="checkout-item">
            <span>Category</span>
            <span>{game.category}</span>
          </div>

          <div className="checkout-item">
            <span>Seller</span>
            <span>#{game.seller_id}</span>
          </div>

        </div>

        {/* TOTAL */}
        <div className="checkout-total">
          <span>Total</span>
          <span>${Number(game.price).toFixed(2)}</span>
        </div>

        {/* 💳 CARD FORM */}
        <div className="card-form">

          <h3>💳 Payment Details</h3>

          <input
            type="text"
            name="name"
            placeholder="Card Holder Name"
            value={card.name}
            onChange={handleCardChange}
          />

          <input
            type="text"
            name="number"
            placeholder="Card Number"
            maxLength="19"
            value={card.number}
            onChange={handleCardChange}
          />

          <div className="card-row">
            <input
              type="text"
              name="expiry"
              placeholder="MM/YY"
              maxLength="5"
              value={card.expiry}
              onChange={handleCardChange}
            />

            <input
              type="text"
              name="cvc"
              placeholder="CVC"
              maxLength="3"
              value={card.cvc}
              onChange={handleCardChange}
            />
          </div>

        </div>

        {/* ERROR / SUCCESS */}
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        {/* BUTTONS */}
        <button
          className="checkout-btn"
          onClick={confirmPayment}
          disabled={
            loading ||
            !card.name ||
            !card.number ||
            !card.expiry ||
            !card.cvc
          }
        >
          {loading ? "Processing..." : "Confirm Payment"}
        </button>

        <button
          className="checkout-btn"
          style={{
            marginTop: 10,
            background: "transparent",
            border: "1px solid #555"
          }}
          onClick={() => navigate("/home")}
        >
          Cancel
        </button>

      </div>

    </div>
  );
}

export default Checkout;