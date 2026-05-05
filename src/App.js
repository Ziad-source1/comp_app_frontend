import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import GameDetail from "./pages/GameDetail";
import SellerDashboard from "./pages/SellerDashboard";
import AdminPanel from "./pages/AdminPanel";
import ApplyVerification from "./pages/ApplyVerification";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import "./styles/globals.css";
import Checkout from "./pages/Checkout";

const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

function ProtectedRoute({ children, roles }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <Navigate to="/" replace />;

  // ✅ FIXED REDIRECTION LOGIC
  if (roles && !roles.includes(user.role)) {
    if (user.role === "Seller") return <Navigate to="/seller" replace />;
    if (user.role === "Buyer") return <Navigate to="/home" replace />;
    if (user.role === "Admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/game/:id" element={<ProtectedRoute><GameDetail /></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/apply-verification" element={<ProtectedRoute roles={["Buyer"]}><ApplyVerification /></ProtectedRoute>} />
        <Route path="/seller" element={<ProtectedRoute roles={["Seller"]}><SellerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["Admin"]}><AdminPanel /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;