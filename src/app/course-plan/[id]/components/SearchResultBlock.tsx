import { useRef } from "react";
import { CourseBasicInfo } from "../types/Course";
import { useDrag } from "react-dnd";
import clsx from "clsx";

interface SearchResultBlockProps {
  res: CourseBasicInfo;
}
export default function SearchResultBlock({ res }: SearchResultBlockProps) {
  const drag = useRef<HTMLDivElement>(null);
  const [{ isDragging }, dragConnector] = useDrag(() => ({
    type: "COURSE",
    item: { semesterPlanId: null, course: res },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  dragConnector(drag);
  return (
    <div
      className={clsx(
        "flex flex-col gap-1 bg-neutral-200 p-3 leading-none",
        isDragging ? "opacity-50" : "",
      )}
      ref={drag}
    >
      <div className="text-sm">
        {res.code} - {res.units} {res.units !== 1 ? "Units" : "Unit"}
      </div>
      <div>{res.title}</div>
    </div>
  );
}
