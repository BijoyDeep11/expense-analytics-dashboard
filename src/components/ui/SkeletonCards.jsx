import Skeleton from "./Skeleton";

const SkeletonCard = () => {
  return (
    <div
      className="
        rounded-lg
        border border-slate-200 dark:border-slate-800
        bg-white dark:bg-slate-900
        p-4
      "
    >
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
};

export default SkeletonCard;
