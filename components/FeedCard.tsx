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
  return (
    <a
      href={url}
      target="_blank"
      className="glass card-hover block rounded-xl overflow-hidden border border-ecomate-100"
    >
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{source}</span>
          <span>{new Date(publishedAt).toLocaleDateString()}</span>
        </div>

        <h2 className="font-semibold text-lg text-ecomate-900">
          {title}
        </h2>

        <p className="text-sm text-gray-600 line-clamp-3">
          {description}
        </p>

        <span className="text-ecomate-600 text-sm font-medium">
          Read more →
        </span>
      </div>
    </a>
  );
}