"use client";

import Link from "next/link";

export default function Custom404() {
  return (
    <div className="tiny5-regular h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-700 text-white font-sans">
      <h1 className="text-4xl font-bold mb-4 text-black dark:text-white">404 - Page Not Found</h1>
      <Link
        href="/"
        className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold rounded"
      >
        Go Home
      </Link>
    </div>
  );
}