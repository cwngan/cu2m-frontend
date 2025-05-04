import clsx from "clsx";
import { useEffect, useState } from "react";

export default function AddCoursePlanBlock({
  isUpdating: allUpdating,
}: {
  isUpdating: boolean;
}) {
  const [isUpdating, setIsUpdating] = useState<boolean>(allUpdating);
  useEffect(() => {
    setIsUpdating(allUpdating);
  }, [allUpdating]);
  return (
    <div
      className={clsx(
        "group relative flex h-52 w-42 flex-col items-center justify-center overflow-hidden rounded-2xl border p-4",
        isUpdating
          ? "cursor-not-allowed opacity-25 select-none"
          : "cursor-pointer opacity-100",
      )}
      onClick={() => {}}
    >
      <span className="text-9xl">+</span>
    </div>
  );
}
