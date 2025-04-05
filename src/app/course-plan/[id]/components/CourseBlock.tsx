import { useRef } from "react";
import { CourseBasicInfo } from "../types/Course";
import { useDrag } from "react-dnd";

interface CourseBlockProps {
  semesterPlanId: string;
  course: CourseBasicInfo;
}

export default function CourseBlock({
  semesterPlanId,
  course,
}: CourseBlockProps) {
  const drag = useRef<HTMLDivElement>(null);
  const [{ isDragging }, dragConnector] = useDrag(() => ({
    type: "COURSE",
    item: { semesterPlanId, course },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  dragConnector(drag);

  return (
    <div
      ref={drag}
      className={`flex flex-col items-center justify-center bg-neutral-200 p-2 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div>{course.code}</div>
      <div>
        {course.units} Unit{course.units != 1 && "s"}
      </div>
    </div>
  );
}
