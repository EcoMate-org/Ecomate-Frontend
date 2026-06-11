
"use client";

import { useState, useEffect } from "react";
import { Menu, X, Leaf } from "lucide-react";
import { scrollToSection } from "../lib/utils";

const navLinks = [
  { label: "Home", href: "home", isBookmark: true },
  { label: "Our Why", href: "our-why", isBookmark: true },
  { label: "Playground", href: "/Playground", isBookmark: false },
  { label: "Feed", href: "/Feed", isBookmark: false },
  { label: "Contact Us", href: "contact-us", isBookmark: true },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Track active section for highlighting
      const sections = ["home", "our-why", "contact-us"];
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string, isBookmark: boolean) => {
    setIsMobileMenuOpen(false);
    if (isBookmark) {
      scrollToSection(href);
    } else {
      window.location.href = href;
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-ecomate-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("home");
            }}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-ecomate-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span
              className={`text-xl font-bold transition-colors ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              EcoMate{" "}
              <span className="text-ecomate-500">AI</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href, link.isBookmark)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  link.isBookmark && activeSection === link.href
                    ? "bg-ecomate-100 text-ecomate-700"
                    : isScrolled
                    ? "text-gray-700 hover:text-ecomate-600 hover:bg-ecomate-50"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Sign In Button */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/signin"
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isScrolled
                  ? "bg-ecomate-600 text-white hover:bg-ecomate-700 shadow-md hover:shadow-lg"
                  : "bg-white text-ecomate-700 hover:bg-ecomate-50 shadow-md"
              }`}
            >
              Sign In
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled
                ? "text-gray-700 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border-t border-gray-100 px-4 py-4 space-y-2 shadow-xl">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href, link.isBookmark)}
              className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                link.isBookmark && activeSection === link.href
                  ? "bg-ecomate-50 text-ecomate-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-ecomate-600"
              }`}
            >
              {link.label}
            </button>
          ))}
          <a
            href="/signin"
            className="block w-full text-center px-4 py-3 rounded-lg text-sm font-semibold bg-ecomate-600 text-white hover:bg-ecomate-700 transition-colors mt-2"
          >
            Sign In
          </a>
        </div>
      </div>
    </nav>
  );
}