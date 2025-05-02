"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
export default function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(theme === "dark");
  }, [theme]);

  const handleChange = () => {
    setChecked(!checked);
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        readOnly
      />
      <div
        onClick={handleChange}
        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 flex items-center justify-between px-1"
      >
        <Moon
          className={`w-4 h-4 text-gray-500 dark:text-gray-100 transition-opacity ${
            checked ? "opacity-100 translate-x-6" : "opacity-0"
          }`}
        />
        <Sun
          className={`w-4 h-4 text-gray-500 dark:text-gray-100 transition-opacity ${
            checked ? "opacity-0" : "opacity-100 -translate-x-2"
          }`}
        />
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
            checked ? "-translate-x-5" : "translate-x-0"
          }`}
        ></div>
      </div>
    </label>
  );
}
