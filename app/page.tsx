"use client";

import { useScrollReveal } from "../hooks/useScrollReveal";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../sections/HeroSection";
import StatsSection from "../sections/StatsSection";
import SDGSection from "../sections/SDGSection";
import OurWhySection from "../sections/OurWhySection"
import PartnersSection from "../sections/PartnersSection";
import ReviewsSection from "../sections/ReviewsSection";
import ContactSection from "../sections/ContactSection";
import CTASection from "../sections/CTASection";

export default function Home() {
  useScrollReveal();

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <SDGSection />
      <OurWhySection />
      <PartnersSection />
      <ReviewsSection />
      <ContactSection />
      <CTASection />
      <Footer />
    </main>
  );
}