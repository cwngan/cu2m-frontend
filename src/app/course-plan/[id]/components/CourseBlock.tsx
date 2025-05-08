import { useRef } from "react";
import { CourseBasicInfo } from "../types/Course";
import { useDrag } from "react-dnd";
import clsx from "clsx";
import { useState } from "react";
import { useEffect } from "react";

const levelColors: { [key: number]: string } = {
  1: "bg-green-800/30 text-gray-80",
  2: "bg-zinc-500/40",
  3: "bg-teal-700/30",
  4: "bg-stone-600/40 text-stone-800",
};

interface CourseBlockProps {
  semesterPlanId: string;
  course: CourseBasicInfo;
}

interface DropResultType {
  allowedDrop?: boolean;
}

export default function CourseBlock({
  semesterPlanId,
  course,
}: CourseBlockProps) {
  const drag = useRef<HTMLDivElement>(null);
  const [didBounce, setDidBounce] = useState(false);

  const [{ isDragging }, dragConnector] = useDrag(() => ({
    type: "COURSE",
    item: { semesterPlanId, course },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<DropResultType>();
      // If no drop result or drop was not allowed, trigger bounce animation
      if (!dropResult || !dropResult.allowedDrop) {
        setDidBounce(true);
        setTimeout(() => setDidBounce(false), 300); // Reset after animation
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  dragConnector(drag);

  //set the color of course block base on number of semester
  const [color, setColor] = useState<string>("bg-neutral-200");

  useEffect(() => {
    // Extract the first digit from the numeric part of the course code (e.g., CSCI2100 -> 2)
    const match = course.code.match(/\d/);
    const level = match ? parseInt(match[0]) : undefined;
    setColor(
      level !== undefined
        ? levelColors[level] || "bg-neutral-200"
        : "bg-neutral-200",
    );
  }, [course.code]);

  return (
    <div
      ref={drag}
      className={clsx(
        "flex transform flex-col items-center justify-center rounded-xl p-2 transition-all duration-150",
        color,
        isDragging ? "scale-105 opacity-50" : "",
        didBounce && "animate-bounce",
      )}
    >
      <div>{course.code}</div>
      <div>
        {course.units} Unit{course.units != 1 && "s"}
      </div>
    </div>
  );
}
