"use client";

import Image from "next/image";
import { Building2, TreePine, Users } from "lucide-react";

const trustedCompanies = [
  { name: "GreenTech Nigeria", logo: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "EcoVentures", logo: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "RecycleCorp", logo: "https://randomuser.me/api/portraits/men/67.jpg" },
  { name: "SustainAfrica", logo: "https://randomuser.me/api/portraits/women/28.jpg" },
  { name: "CleanEarth", logo: "https://randomuser.me/api/portraits/men/85.jpg" },
  { name: "WasteWise", logo: "https://randomuser.me/api/portraits/women/56.jpg" },
];

const partnerTypes = [
  {
    icon: Users,
    title: "Users",
    desc: "Individuals who scan, sell recyclables, create art, and participate in challenges",
    color: "bg-ecomate-100 text-ecomate-700",
  },
  {
    icon: Building2,
    title: "Companies",
    desc: "Manufacturers and recyclers bidding on raw materials for sustainable production",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: TreePine,
    title: "NGOs",
    desc: "Environmental organizations creating challenges and sponsoring rewards",
    color: "bg-purple-100 text-purple-700",
  },
];

export default function PartnersSection() {
  return (
    
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Trusted By */}
        <div className="text-center mb-20 reveal">
          <span className="text-ecomate-600 font-semibold text-sm uppercase tracking-wider">
            Trusted By
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
            Companies Building a <span className="gradient-text">Greener Future</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Forward-thinking organizations trust EcoMate AI for their recycling and sustainability needs.
          </p>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-70">
            {trustedCompanies.map((company, i) => (
              <div
                key={i}
                className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300"
              >
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="font-semibold text-gray-700">{company.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Our Partners Ecosystem */}
        <div className="reveal">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="gradient-text">Partner Ecosystem</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              EcoMate AI unites three key stakeholders in a circular economy marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partnerTypes.map((partner, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div
                  className={`w-16 h-16 ${partner.color} rounded-2xl flex items-center justify-center mx-auto mb-5`}
                >
                  <partner.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {partner.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{partner.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}