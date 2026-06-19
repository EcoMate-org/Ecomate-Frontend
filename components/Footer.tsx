"use client";

import { Leaf, Mail, Phone, MapPin } from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useTheme } from "../lib/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      className={`transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-950 text-white" : "bg-gray-900 text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-ecomate-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                EcoMate <span className="text-ecomate-400">AI</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Transforming waste into value through AI-powered recycling. 
              Join our community of changemakers building a sustainable future.
            </p>
            <div className="flex gap-3">
              {[FaXTwitter, FaLinkedin, FaInstagram, FaGithub].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className={`w-9 h-9 rounded-lg flex items-center justify-center hover:bg-ecomate-600 transition-colors ${
                    theme === "dark" ? "bg-gray-800/80" : "bg-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {["Home", "Our Why", "Playground", "Feed", "Contact Us"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href={link === "Home" ? "/#home" : link === "Our Why" ? "/#our-why" : link === "Contact Us" ? "/#contact-us" : `/${link}`}
                      className="text-gray-400 hover:text-ecomate-400 transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-3">
              {["Marketplace", "AI Scanner", "Challenges", "Art Gallery", "Messaging"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-ecomate-400 transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-ecomate-400" />
                hello@ecomate.ai
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-ecomate-400" />
                +234 800 ECOMATE
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-ecomate-400" />
                Lagos, Nigeria
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t ${
            theme === "dark" ? "border-gray-800/60" : "border-gray-800"
          }`}
        >
          <p className="text-gray-500 text-sm">
            © 2026 EcoMate AI. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Built with 💚 for a sustainable planet
          </p>
        </div>
      </div>
    </footer>
  );
}