"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "@/components/icons/paideio-icons"

type Theme = "light" | "dark"

function getTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    queueMicrotask(() => setTheme(getTheme()))
  }, [])

  function toggleTheme() {
    const nextTheme: Theme = theme === "light" ? "dark" : "light"
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
    document.documentElement.dataset.theme = nextTheme
    localStorage.setItem("paideio-theme", nextTheme)
    setTheme(nextTheme)
    window.dispatchEvent(new CustomEvent("paideio-theme-change"))
  }

  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Attiva modalità giorno" : "Attiva modalità notte"}
      aria-pressed={isDark}
      className="theme-toggle min-h-11"
    >
      <Sun aria-hidden="true" className="theme-toggle__sun size-4" />
      <Moon aria-hidden="true" className="theme-toggle__moon size-4" />
      <span aria-hidden="true" className="theme-toggle__ball" />
    </button>
  )
}
