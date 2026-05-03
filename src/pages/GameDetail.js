import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../compenent/Navbar";
import Footer from "../compenent/Footer";

function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content" style={{ flex: 1 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
          ← Back
        </button>
        <div className="card">
          <h2>Game #{id}</h2>
          <p style={{ color: "var(--text2)", marginTop: 8 }}>Detail view coming soon</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default GameDetail;