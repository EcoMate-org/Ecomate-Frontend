export default function FeedSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-64 bg-gray-200 rounded-xl"
        />
      ))}
    </div>
  );
}