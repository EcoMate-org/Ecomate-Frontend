"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Leaf, Sun, Moon } from "lucide-react";
import { scrollToSection } from "../lib/utils";
import { useTheme } from "../lib/ThemeContext";

const navLinks = [
  { label: "Home", href: "/", bookmark: "home" },
  { label: "Our Why", href: "/", bookmark: "our-why" },
  { label: "Playground", href: "/Playground", bookmark: null },
  { label: "Feed", href: "/Feed", bookmark: null },
  { label: "Contact Us", href: "/", bookmark: "contact-us" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeBookmark, setActiveBookmark] = useState("home");
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Track active bookmark section only on the home page
      if (isHomePage) {
        const sections = ["home", "our-why", "contact-us"];
        for (const section of [...sections].reverse()) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 120) {
              setActiveBookmark(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleNavClick = (link: (typeof navLinks)[number]) => {
    setIsMobileMenuOpen(false);

    if (link.bookmark) {
      if (isHomePage) {
        // Already on home page, just scroll
        scrollToSection(link.bookmark);
      } else {
        // Navigate to home page with hash
        window.location.href = `/#${link.bookmark}`;
      }
    }
    // Route links are handled by Next.js Link component, no extra logic needed
  };

  const isActive = (link: (typeof navLinks)[number]) => {
    if (link.bookmark) {
      // Bookmark links: active only when on home page and scrolled to that section
      return isHomePage && activeBookmark === link.bookmark;
    }
    // Route links: active when pathname matches
    return pathname === link.href;
  };

  // --- Style logic ---
  // Home page: transparent → solid on scroll (original behavior)
  // Inner pages: always solid background
  const showTransparentBg = isHomePage && !isScrolled;

  // Background classes
  const navBgClass = showTransparentBg
    ? "bg-transparent"
    : theme === "dark"
    ? "bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800"
    : "bg-white/95 backdrop-blur-md shadow-lg border-b border-ecomate-100";

  // Text classes for nav links (inactive state)
  const inactiveTextClass = showTransparentBg
    ? "text-white/90 hover:text-white hover:bg-white/10"
    : theme === "dark"
    ? "text-gray-300 hover:text-ecomate-400 hover:bg-gray-800"
    : "text-gray-700 hover:text-ecomate-600 hover:bg-ecomate-50";

  // Text class for active link
  const activeTextClass =
    theme === "dark"
      ? "bg-ecomate-900/50 text-ecomate-400"
      : "bg-ecomate-100 text-ecomate-700";

  // Logo text class
  const logoTextClass = showTransparentBg
    ? "text-white"
    : theme === "dark"
    ? "text-white"
    : "text-gray-900";

  // Mobile menu button class
  const mobileButtonClass = showTransparentBg
    ? "text-white hover:bg-white/10"
    : theme === "dark"
    ? "text-gray-300 hover:bg-gray-800"
    : "text-gray-700 hover:bg-gray-100";

  // Sign-in button class
  const signInClass = showTransparentBg
    ? "bg-white text-ecomate-700 hover:bg-ecomate-50 shadow-md"
    : theme === "dark"
    ? "bg-ecomate-600 text-white hover:bg-ecomate-500 shadow-md hover:shadow-lg"
    : "bg-ecomate-600 text-white hover:bg-ecomate-700 shadow-md hover:shadow-lg";

  // Theme toggle button class
  const themeToggleClass = showTransparentBg
    ? "text-white/80 hover:text-white hover:bg-white/10"
    : theme === "dark"
    ? "text-yellow-400 hover:text-yellow-300 hover:bg-gray-800"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (isHomePage) {
                e.preventDefault();
                scrollToSection("home");
              }
            }}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-ecomate-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span
              className={`text-xl font-bold transition-colors ${logoTextClass}`}
            >
              EcoMate{" "}
              <span className="text-ecomate-500">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.bookmark ? (
                // Bookmark links use button + scrollToSection
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link) ? activeTextClass : inactiveTextClass
                  }`}
                >
                  {link.label}
                </button>
              ) : (
                // Route links use Next.js Link for client-side navigation
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link) ? activeTextClass : inactiveTextClass
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Actions: Theme Toggle + Sign In */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-all duration-300 ${themeToggleClass}`}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* Sign In */}
            <Link
              href="/signin"
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${signInClass}`}
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${themeToggleClass}`}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${mobileButtonClass}`}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`border-t px-4 py-4 space-y-2 shadow-xl ${
            theme === "dark"
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-100"
          }`}
        >
          {navLinks.map((link) =>
            link.bookmark ? (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link)
                    ? theme === "dark"
                      ? "bg-ecomate-900/50 text-ecomate-400"
                      : "bg-ecomate-50 text-ecomate-700"
                    : theme === "dark"
                    ? "text-gray-300 hover:bg-gray-800 hover:text-ecomate-400"
                    : "text-gray-700 hover:bg-gray-50 hover:text-ecomate-600"
                }`}
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link)
                    ? theme === "dark"
                      ? "bg-ecomate-900/50 text-ecomate-400"
                      : "bg-ecomate-50 text-ecomate-700"
                    : theme === "dark"
                    ? "text-gray-300 hover:bg-gray-800 hover:text-ecomate-400"
                    : "text-gray-700 hover:bg-gray-50 hover:text-ecomate-600"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
          <Link
            href="/signin"
            className="block w-full text-center px-4 py-3 rounded-lg text-sm font-semibold bg-ecomate-600 text-white hover:bg-ecomate-700 transition-colors mt-2"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}