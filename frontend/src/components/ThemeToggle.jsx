import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      className="btn-icon h-10 w-10 border border-transparent hover:border-[#ded8cb]"
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === "dark"}
      title={`Switch to ${nextTheme} mode`}
      onClick={toggleTheme}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}
