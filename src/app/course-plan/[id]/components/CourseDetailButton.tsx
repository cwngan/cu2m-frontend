import { InformationCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function CourseDetailButton({
  className,
  onClick,
}: {
  className?: string;
  onClick: () => void;
}) {
  return (
    <div className="pl-3" onClick={onClick}>
      <button className={clsx(className, "cursor-pointer")}>
        <InformationCircleIcon className="size-5 hover:text-slate-500" />
      </button>
    </div>
  );
}
