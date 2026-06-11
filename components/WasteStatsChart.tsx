"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const eWasteData = [
  { year: "2014", amount: 44.4 },
  { year: "2016", amount: 48.2 },
  { year: "2018", amount: 51.8 },
  { year: "2020", amount: 55.5 },
  { year: "2022", amount: 62.0 },
  { year: "2025", amount: 65.3 },
  { year: "2030", amount: 82.0 },
];

const wasteComposition = [
  { name: "Plastic", value: 12, color: "#16a34a" },
  { name: "Metal", value: 8, color: "#22c55e" },
  { name: "E-Waste", value: 5, color: "#4ade80" },
  { name: "Glass", value: 5, color: "#86efac" },
  { name: "Paper", value: 17, color: "#15803d" },
  { name: "Organic", value: 44, color: "#14532d" },
  { name: "Other", value: 9, color: "#dcfce7" },
];

const recyclingRates = [
  { continent: "Europe", rate: 42.8 },
  { continent: "Oceania", rate: 41.4 },
  { continent: "Americas", rate: 30.0 },
  { continent: "Asia", rate: 11.8 },
  { continent: "Africa", rate: 0.7 },
];

export function EwasteGrowthChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Global E-Waste Generation (Million Tonnes)
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        E-waste is growing 5x faster than documented recycling
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={eWasteData}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#16a34a"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorAmount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WasteCompositionChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Global Waste Composition
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Less than 20% of waste is recycled annually
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={wasteComposition}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {wasteComposition.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value: string) => (
              <span className="text-xs text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RecyclingRateChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        E-Waste Recycling Rates by Continent (%)
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Africa recycles less than 1% of its e-waste
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={recyclingRates} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" domain={[0, 50]} />
          <YAxis
            dataKey="continent"
            type="category"
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
            }}
          />
          <Bar dataKey="rate" fill="#16a34a" radius={[0, 8, 8, 0]} barSize={24}>
            {recyclingRates.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.continent === "Africa"
                    ? "#ef4444"
                    : entry.continent === "Europe"
                    ? "#16a34a"
                    : "#22c55e"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}