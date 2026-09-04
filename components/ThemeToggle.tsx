"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("onchain-poaps-theme");
    const isDark = saved ? saved === "dark" : true;
    document.documentElement.classList.toggle("dark", isDark);
    setDark(isDark);
  }, []);
  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("onchain-poaps-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("onchain-poaps-theme-change"));
    setDark(next);
  }
  return (
    <button type="button" aria-label={`Switch to ${dark ? "light" : "dark"} mode`} aria-pressed={dark} onClick={toggle} className="reference-theme-toggle">
      <span className="sun">☀</span><span className="moon">☾</span><span className={`reference-theme-knob ${dark ? "dark" : ""}`}/>
    </button>
  );
}
