// apps/web/src/components/ui/theme-toggle.jsx
import { useEffect, useState, useRef } from "react";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const buttonRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const dark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

    setIsDark(dark);
    if (dark) document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = (event) => {
    // 1. Check if the browser supports the View Transition API
    if (!document.startViewTransition) {
      setIsDark(!isDark);
      document.documentElement.classList.toggle("dark");
      return;
    }

    // 2. Telegram-style Circle Transition logic
    const transition = document.startViewTransition(() => {
      setIsDark(!isDark);
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", !isDark ? "dark" : "light");
    });

    // 3. Coordinate the circle expansion from the button click position
    transition.ready.then(() => {
      const x = event.clientX;
      const y = event.clientY;
      const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y),
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors z-[100]"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? "sun" : "moon"}
          initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? (
            <HiOutlineSun className="h-5 w-5 text-yellow-400" />
          ) : (
            <HiOutlineMoon className="h-5 w-5 text-slate-700" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
