"use client";

import { useTheme } from "../lib/ThemeContext";

type Props = {
  title: string;
  description: string;
  image?: string;
  url: string;
  source: string;
  publishedAt: string;
};

export default function FeedCard({
  title,
  description,
  image,
  url,
  source,
  publishedAt,
}: Props) {
  const { theme } = useTheme();

  return (
    <a
      href={url}
      target="_blank"
      className={`glass card-hover block rounded-xl overflow-hidden border transition-colors duration-300 ${
        theme === "dark"
          ? "border-gray-700 hover:border-ecomate-700"
          : "border-ecomate-100 hover:border-ecomate-200"
      }`}
    >
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-4 space-y-2">
        <div
          className={`flex justify-between text-xs ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <span>{source}</span>
          <span>{new Date(publishedAt).toLocaleDateString()}</span>
        </div>

        <h2
          className={`font-semibold text-lg transition-colors ${
            theme === "dark" ? "text-ecomate-300" : "text-ecomate-900"
          }`}
        >
          {title}
        </h2>

        <p
          className={`text-sm line-clamp-3 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {description}
        </p>

        <span
          className={`text-sm font-medium ${
            theme === "dark" ? "text-ecomate-400" : "text-ecomate-600"
          }`}
        >
          Read more →
        </span>
      </div>
    </a>
  );
}