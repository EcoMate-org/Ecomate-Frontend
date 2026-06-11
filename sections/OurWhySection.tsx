"use client";

import { Scan, Heart, Handshake, Lightbulb } from "lucide-react";

const pillars = [
  {
    icon: Scan,
    title: "AI-Powered Identification",
    desc: "Our computer vision technology instantly identifies recyclable materials — plastic, metal, glass, e-waste, and rubber — making sorting effortless for everyone.",
  },
  {
    icon: Heart,
    title: "Community First",
    desc: "We believe sustainability starts with people. Our platform empowers individuals to monetize their waste while contributing to environmental preservation.",
  },
  {
    icon: Handshake,
    title: "Connecting Stakeholders",
    desc: "We bridge the gap between waste generators, NGOs driving environmental challenges, and companies seeking sustainable raw materials.",
  },
  {
    icon: Lightbulb,
    title: "Circular Economy",
    desc: "From recyclables to recycled art, we enable a complete circular economy where waste becomes a resource and creativity flourishes.",
  },
];

export default function OurWhySection() {
  return (
    <section id="our-why" className="section-padding bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal">
          <span className="text-ecomate-400 font-semibold text-sm uppercase tracking-wider">
            Our Why
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">
            Why EcoMate <span className="text-ecomate-400">AI Exists</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            We exist because the current waste management system is broken. 
            Africa recycles less than 1% of its e-waste. 
            We're here to change that through technology and community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 hover:bg-gray-800 transition-all duration-300 hover:border-ecomate-500/30 reveal"
              style={{ transitionDelay: `${0.1 * i}s` }}
            >
              <div className="w-14 h-14 bg-ecomate-600/20 rounded-xl flex items-center justify-center mb-5">
                <pillar.icon className="w-7 h-7 text-ecomate-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">{pillar.title}</h3>
              <p className="text-gray-400 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-16 text-center reveal">
          <blockquote className="text-2xl md:text-3xl font-light italic text-gray-300 max-w-3xl mx-auto">
            "The greatest threat to our planet is the belief that someone else will save it."
          </blockquote>
          <cite className="text-ecomate-400 font-medium mt-4 block">
            — Robert Swan, Environmentalist
          </cite>
        </div>
      </div>
    </section>
  );
}