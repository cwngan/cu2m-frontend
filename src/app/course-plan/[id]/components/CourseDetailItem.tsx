import clsx from "clsx";
import { ReactNode } from "react";

export function CourseDetailItem({
  children,
  span,
  className,
}: {
  children: ReactNode;
  span: number;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "text-graph-700 flex max-h-64 flex-col overflow-auto rounded-sm font-medium text-pretty hyphens-auto outline outline-offset-4 outline-stone-500 outline-solid",
        `col-span-${span}`,
        className
      )}
      lang="en"
    >
      {children}
    </div>
  );
}
