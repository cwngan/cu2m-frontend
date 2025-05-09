import clsx from "clsx";
import { ReactNode } from "react";

export function CourseDetailItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "text-graph-700 flex max-h-64 flex-col overflow-auto rounded-sm font-medium text-pretty hyphens-auto outline outline-offset-4 outline-stone-500 outline-solid",
        className,
      )}
      lang="en"
    >
      {children}
    </div>
  );
}
