"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact-us" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal">
          <span className="text-ecomate-600 font-semibold text-sm uppercase tracking-wider">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Contact <span className="gradient-text">Us</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-lg">
            Have questions about EcoMate AI? We'd love to hear from you. 
            Reach out and let's build a sustainable future together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="reveal space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-ecomate-100 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-ecomate-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                <p className="text-gray-600">hello@ecomate.ai</p>
                <p className="text-gray-600">support@ecomate.ai</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-ecomate-100 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-ecomate-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                <p className="text-gray-600">+234 800 ECOMATE</p>
                <p className="text-gray-600">+234 1 234 5678</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-ecomate-100 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-ecomate-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Visit Us</h3>
                <p className="text-gray-600">
                  Innovation Hub, University of Lagos
                  <br />
                  Akoka, Yaba, Lagos, Nigeria
                </p>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-gray-100 rounded-2xl h-48 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-ecomate-400" />
                <p className="text-sm">Lagos, Nigeria</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="reveal">
            <form
              onSubmit={handleSubmit}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ecomate-500 focus:ring-2 focus:ring-ecomate-200 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ecomate-500 focus:ring-2 focus:ring-ecomate-200 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ecomate-500 focus:ring-2 focus:ring-ecomate-200 outline-none transition-all bg-white">
                    <option>General Inquiry</option>
                    <option>Partnership</option>
                    <option>Technical Support</option>
                    <option>Media</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-ecomate-500 focus:ring-2 focus:ring-ecomate-200 outline-none transition-all resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {submitted ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Message Sent!
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}