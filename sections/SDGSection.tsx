"use client";

import Image from "next/image";
import { Globe, Award, Target, Leaf } from "lucide-react";

const sdgs = [
  { num: "12", title: "Responsible Consumption & Production", desc: "Our core mission" },
  { num: "13", title: "Climate Action", desc: "Reducing emissions through recycling" },
  { num: "14", title: "Life Below Water", desc: "Preventing ocean plastic pollution" },
  { num: "15", title: "Life on Land", desc: "Protecting ecosystems from waste" },
];

export default function SDGSection() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="reveal">
            <span className="text-ecomate-600 font-semibold text-sm uppercase tracking-wider">
              United Nations SDG
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-6">
              Contributing to the UN's{" "}
              <span className="gradient-text">17 Global Goals</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              EcoMate AI directly addresses{" "}
              <strong>SDG 12: Responsible Consumption and Production</strong> — 
              one of the 17 Sustainable Development Goals adopted by all UN Member States in 2015. 
              By creating a digital marketplace for recyclables, we help reduce waste generation, 
              improve recycling rates, and promote sustainable practices across Africa and beyond.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              The UN's Global E-waste Monitor reveals that e-waste is rising{" "}
              <strong>5 times faster</strong> than documented recycling. 
              Africa recycles less than <strong>1%</strong> of its e-waste. 
              EcoMate AI bridges this gap with technology.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {sdgs.map((sdg, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-ecomate-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-ecomate-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {sdg.num}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{sdg.title}</div>
                    <div className="text-xs text-gray-500">{sdg.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image & Awards */}
          <div className="reveal space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80"
                alt="Sustainable future"
                width={600}
                height={400}
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 text-white mb-2">
                  <Globe className="w-5 h-5" />
                  <span className="font-semibold">Global Impact</span>
                </div>
                <p className="text-white/80 text-sm">
                  Aligning with the UN 2030 Agenda for Sustainable Development
                </p>
              </div>
            </div>

            {/* Recognition Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-ecomate-50 border border-ecomate-100 rounded-xl p-4">
                <Award className="w-8 h-8 text-ecomate-600 mb-2" />
                <div className="font-bold text-gray-900 text-sm">UN Recognition</div>
                <div className="text-xs text-gray-600 mt-1">
                  Contributing to SDG 12 implementation across Africa
                </div>
              </div>
              <div className="bg-ecomate-50 border border-ecomate-100 rounded-xl p-4">
                <Target className="w-8 h-8 text-ecomate-600 mb-2" />
                <div className="font-bold text-gray-900 text-sm">2030 Target</div>
                <div className="text-xs text-gray-600 mt-1">
                  Helping nations reach 60% e-waste recycling rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}