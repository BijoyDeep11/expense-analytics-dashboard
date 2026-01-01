import Skeleton from "./Skeleton";

const SkeletonList = ({ rows = 4 }) => {
  return (
    <ul className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="
            rounded-lg
            border border-slate-200 dark:border-slate-800
            bg-white dark:bg-slate-900
            p-4
          "
        >
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-3 w-24" />
        </li>
      ))}
    </ul>
  );
};

export default SkeletonList;
