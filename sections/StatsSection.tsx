"use client";

import {
  EwasteGrowthChart,
  WasteCompositionChart,
  RecyclingRateChart,
} from "../components/WasteStatsChart";

export default function StatsSection() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal">
          <span className="text-ecomate-600 font-semibold text-sm uppercase tracking-wider">
            The Crisis
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Global Waste is a <span className="gradient-text">Growing Crisis</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            The world generates <strong>2.56 billion tonnes</strong> of municipal solid waste annually. 
            Without action, this will reach <strong>3.86 billion tonnes by 2050</strong>. 
            E-waste alone is rising 5x faster than documented recycling.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="reveal">
            <EwasteGrowthChart />
          </div>
          <div className="reveal" style={{ transitionDelay: "0.1s" }}>
            <WasteCompositionChart />
          </div>
          <div className="reveal" style={{ transitionDelay: "0.2s" }}>
            <RecyclingRateChart />
          </div>
        </div>

        {/* Key Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "62M", label: "Tonnes of E-Waste (2022)", color: "bg-red-50 text-red-700" },
            { value: "22.3%", label: "Properly Recycled", color: "bg-yellow-50 text-yellow-700" },
            { value: "$62B", label: "Resources Wasted", color: "bg-orange-50 text-orange-700" },
            { value: "0.7%", label: "Africa's Recycling Rate", color: "bg-ecomate-50 text-ecomate-700" },
          ].map((stat, i) => (
            <div
              key={i}
              className={`${stat.color} rounded-2xl p-6 text-center reveal`}
              style={{ transitionDelay: `${0.1 * i}s` }}
            >
              <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm font-medium opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}