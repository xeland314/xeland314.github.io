"use client";

import { useTheme } from "next-themes";

const themes = [
  { name: "light", color: "bg-gray-200", label: "🌞 Light" },
  { name: "dark", color: "bg-gray-900", label: "🌑 Dark" },
  { name: "orange", color: "bg-orange-500", label: "🟠 Orange" },
  { name: "green", color: "bg-green-500", label: "🟢 Green" },
  { name: "blue", color: "bg-blue-500", label: "🔵 Blue" },
];

export default function ThemeSelector() {
  const { setTheme } = useTheme();

  return (
    <section className="max-w-md mx-auto my-4 p-4 rounded-lg border-2 bg-white dark:bg-gray-800 dark:border-gray-200 blue:bg-blue-800 blue:border-blue-200 blue:text-white orange:bg-orange-600 orange:border-orange-200 orange:text-white green:bg-green-800 green:border-green-200 green:text-white">
      <h2 className="text-lg font-semibold text-center mb-4">
        Selecciona un tema:
      </h2>
      <div className="grid grid-cols-5 gap-4">
        {themes.map((theme) => (
          <button
            title={`Cambiar al tema ${theme.name}`}
            key={theme.name}
            className={`h-6 w-6 mobile:h-12 mobile:w-12 rounded-full ${theme.color} transition-transform transform hover:scale-110 duration-300`}
            onClick={() => setTheme(theme.name)}
            aria-label={`Cambiar al tema ${theme.name}`}
          />
        ))}
      </div>
    </section>
  );
}
