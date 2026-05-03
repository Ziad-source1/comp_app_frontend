import { useEffect, useState } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") !== "light";
  });

  useEffect(() => {
    const theme = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="nav-chip"
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{ fontSize: 16, padding: "6px 10px" }}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

export default ThemeToggle;