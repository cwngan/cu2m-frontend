import Skeleton from "react-loading-skeleton";

export default function SearchResultLoadingBlock({}: object) {
  return (
    <div className="group relative flex h-16 w-48 flex-none flex-col justify-between gap-1 rounded-lg bg-neutral-50 p-3 leading-none">
      <Skeleton count={1} containerClassName="w-8" />
      <Skeleton count={1} containerClassName="w-full" />
    </div>
  );
}
