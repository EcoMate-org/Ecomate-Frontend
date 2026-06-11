"use client";

import { ArrowRight, Scan, Recycle, TrendingUp, Users } from "lucide-react";
import Image from "next/image";

const stats = [
  { icon: Recycle, label: "Items Recycled", value: "50K+" },
  { icon: Users, label: "Active Users", value: "12K+" },
  { icon: TrendingUp, label: "Waste Diverted", value: "200T" },
  { icon: Scan, label: "AI Scans", value: "100K+" },
];

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1920&q=80"
          alt="Green nature background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-br from-gray-900/90 via-gray-900/80 to-ecomate-900/70" />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-ecomate-400/20 animate-bounce-slow"
            style={{
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-ecomate-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">
              AI-Powered Recycling Marketplace
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
            Turn Waste Into{" "}
            <span className="text-ecomate-400">Value</span>
            <br />
            With <span className="text-ecomate-300">EcoMate AI</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
            The digital platform connecting individuals, NGOs, and companies 
            to transform recyclables into raw materials, art, and environmental impact. 
            Powered by AI material scanning technology.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <a href="/signin" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#our-why" className="btn-outline text-white border-white/30 hover:bg-white/10 hover:text-white text-lg px-8 py-4 inline-flex items-center justify-center gap-2">
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-all duration-300"
              >
                <stat.icon className="w-6 h-6 text-ecomate-400 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}