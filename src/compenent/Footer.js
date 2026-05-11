import { Link } from "react-router-dom";
import { FaXTwitter, FaYoutube, FaDiscord, FaInstagram } from "react-icons/fa6";

function Footer() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (user?.role === "Admin") return null;

  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      background: "var(--bg2)",
      marginTop: "auto",
    }}>

      {/* Main footer content */}
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "48px 32px 32px",
        display: "grid",
        gridTemplateColumns: "280px 1fr 1fr 1fr",
        gap: 40,
      }}>

        {/* Col 1 — Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <img
              src="/logo.png"
              alt="Level-Up Logo"
              style={{ width: 40, height: 40, objectFit: "contain" }}
            />
              <span style={{
                fontFamily: "Rajdhani, sans-serif",
                fontWeight: 700, fontSize: 22,
                letterSpacing: "0.05em", color: "var(--text)",
                }}>LEVEL-UP</span>
             </div>
          <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.7, marginBottom: 20 }}>
            The trusted marketplace for gamers. Buy and sell boosting services,
            in-game currency, and more — protected by escrow.
          </p>

          {/* Social icons */}
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { icon: <FaXTwitter />,  label: "Twitter",   href: "https://twitter.com" },
              { icon: <FaYoutube />,   label: "YouTube",   href: "https://youtube.com" },
              { icon: <FaDiscord />,   label: "Discord",   href: "https://discord.com" },
              { icon: <FaInstagram />, label: "Instagram", href: "https://instagram.com" },
            ].map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                title={label}
                style={{
                  width: 34, height: 34,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, cursor: "pointer", color: "var(--text3)",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text3)";
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Marketplace */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "var(--text3)", marginBottom: 16
          }}>
            Marketplace
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Browse Games",     to: "/home" },
              { label: "My Orders",        to: "/my-orders" },
              { label: "My Profile",       to: "/profile" },
              ...(user?.role === "Buyer"
                ? [{ label: "Become a Seller", to: "/apply-verification" }]
                : []),
              ...(user?.role === "Seller"
                ? [{ label: "Seller Dashboard", to: "/seller" }]
                : []),
              ...(user?.role === "Admin"
                ? [{ label: "Admin Panel", to: "/admin" }]
                : []),
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                style={{ fontSize: 13, color: "var(--text2)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.target.style.color = "var(--accent)"}
                onMouseLeave={(e) => e.target.style.color = "var(--text2)"}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Col 3 — Buyer Protection */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "var(--text3)", marginBottom: 16
          }}>
            Buyer Protection
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Escrow System",
              "Dispute Resolution",
              "Verified Sellers Only",
              "Secure Payments",
              "Refund Policy",
            ].map((item) => (
              <span key={item} style={{ fontSize: 13, color: "var(--text2)" }}>{item}</span>
            ))}
          </div>
        </div>

        {/* Col 4 — Sellers */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "var(--text3)", marginBottom: 16
          }}>
            Sellers
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Seller Rules",
              "Verification Process",
              "How Escrow Works",
              "Seller Dashboard",
              "Contact Support",
            ].map((item) => (
              <span key={item} style={{ fontSize: 13, color: "var(--text2)" }}>{item}</span>
            ))}
          </div>

          {/* Escrow badge */}
          <div style={{
            marginTop: 24,
            background: "rgba(0, 212, 255, 0.06)",
            border: "1px solid rgba(0, 212, 255, 0.15)",
            borderRadius: 8, padding: "12px 14px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 20 }}>🔐</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.05em" }}>
                ESCROW PROTECTED
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>
                All payments held until delivery
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid var(--border)",
        padding: "16px 32px",
        maxWidth: 1280,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div style={{ fontSize: 12, color: "var(--text3)" }}>
          © {new Date().getFullYear()} Level-Up. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Terms of Service", "Privacy Policy", "Cookie Policy"].map((item) => (
            <span
              key={item}
              style={{ fontSize: 12, color: "var(--text3)", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.target.style.color = "var(--text)"}
              onMouseLeave={(e) => e.target.style.color = "var(--text3)"}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

    </footer>
  );
}

export default Footer;