"use client";

import Image from "next/image";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Adeola Ogunlesi",
    role: "Eco Artist",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 5,
    text: "EcoMate AI transformed my passion for recycled art into a thriving business. I've sold over 50 artworks and connected with amazing buyers who care about sustainability.",
  },
  {
    name: "Chinedu Okonkwo",
    role: "Recycling Collector",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    rating: 5,
    text: "The AI scanner is incredible! I can now identify materials instantly and get better prices from companies. My income has doubled since joining the platform.",
  },
  {
    name: "Fatima Abdullahi",
    role: "NGO Coordinator",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    rating: 5,
    text: "We launched a community recycling challenge through EcoMate and had 2,000+ participants in the first month. The impact tracking features are exactly what we needed.",
  },
  {
    name: "Oluwaseun Adeyemi",
    role: "Manufacturing Company",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    rating: 5,
    text: "As a plastic manufacturer, EcoMate connects us directly with quality recyclable materials. We've reduced raw material costs by 30% while supporting local communities.",
  },
  {
    name: "Ngozi Eze",
    role: "University Student",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    rating: 4,
    text: "I participate in environmental challenges and earn rewards while making a real difference. The gamification makes sustainability actually fun!",
  },
  {
    name: "Ibrahim Mohammed",
    role: "E-Waste Dealer",
    image: "https://randomuser.me/api/portraits/men/78.jpg",
    rating: 5,
    text: "The e-waste classification AI is spot-on. I used to guess material types; now I scan and get instant, accurate results. Game changer for my business.",
  },
];

export default function ReviewsSection() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal">
          <span className="text-ecomate-600 font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Loved by the <span className="gradient-text">Community</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-lg">
            Hear from users, companies, and NGOs who are already making an impact with EcoMate AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 reveal"
              style={{ transitionDelay: `${0.05 * i}s` }}
            >
              <Quote className="w-8 h-8 text-ecomate-200 mb-4" />
              <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                "{review.text}"
              </p>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${
                      j < review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Image
                  src={review.image}
                  alt={review.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {review.name}
                  </div>
                  <div className="text-xs text-ecomate-600">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}