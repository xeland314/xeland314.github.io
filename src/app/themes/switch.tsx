import { useTheme } from './index';
import { useState, useEffect } from 'react';

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(theme === 'dark');
  }, [theme]);

  const handleChange = () => {
    setChecked(!checked);
    toggleTheme();
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        readOnly
      />
      <div
        onClick={handleChange}
        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700"
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        ></div>
      </div>
      <span
       className="ml-3 text-sm font-medium"
       >
        Tema {theme === 'light' ? 'claro' : 'oscuro'}
      </span>
    </label>
  );
}
