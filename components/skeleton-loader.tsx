const SkeletonLoader = () => {
  return (
    <div className="border rounded-lg shadow-sm p-6 space-y-4 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-1/3" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-24" />
          <div className="h-6 bg-gray-200 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
