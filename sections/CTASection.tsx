//Final Call to Action Page

"use client";

import { ArrowRight, Leaf } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 bg-ecomate-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
        <Leaf className="w-12 h-12 text-ecomate-300 mx-auto mb-6" />
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to Make an Impact?
        </h2>
        <p className="text-ecomate-100 text-lg max-w-2xl mx-auto mb-10">
          Join thousands of users, NGOs, and companies already transforming waste into value. 
          Start your sustainability journey with EcoMate AI today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/signin"
            className="bg-white text-ecomate-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-ecomate-50 transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="#our-why"
            className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 inline-flex items-center justify-center"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}