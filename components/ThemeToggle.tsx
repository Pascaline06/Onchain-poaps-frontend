"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
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
  return <button type="button" aria-label={`Switch to ${dark ? "light" : "dark"} mode`} aria-pressed={dark} onClick={toggle} className="relative flex h-9 w-[62px] items-center rounded-full border border-ink/20 bg-paper p-1 transition hover:border-accent"><span className="absolute left-2 text-[11px]">☀</span><span className="absolute right-2 text-[11px]">☾</span><span className={`relative z-10 h-7 w-7 rounded-full bg-ink shadow-sm transition-transform ${dark ? "translate-x-[25px]" : "translate-x-0"}`}/></button>;
}
