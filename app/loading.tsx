export default function Loading() {
  return (
    <div className="p-4 md:p-6 animate-pulse">
      <div className="skeleton h-7 w-32 mb-4 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="skeleton h-3 w-16 mb-2 rounded" />
            <div className="skeleton h-7 w-12 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="skeleton h-48 rounded-lg" />
        <div className="skeleton h-48 rounded-lg" />
      </div>
    </div>
  );
}
