"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useTheme } from "../../lib/ThemeContext";

export default function PlaygroundPage() {
  const { theme } = useTheme();

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-950" : "bg-white"
      }`}
    >
      <Navbar />

      <div className="section-padding pt-28 mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold gradient-text">Playground</h1>
        <p
          className={`mt-3 transition-colors ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Coming soon.
        </p>
      </div>

      <Footer />
    </main>
  );
}
