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

  //set the color of course block base on number of semester
  const [color, setColor] = useState<string>("bg-neutral-200");

  useEffect(() => {
    // Extract the first digit from the numeric part of the course code (e.g., CSCI2100 -> 2)
    const match = course.code.match(/\d/);
    const level = match ? parseInt(match[0]) : undefined;
    setColor(level !== undefined ? levelColors[level] || "bg-neutral-200" : "bg-neutral-200");
  }, [course.code]);

  return (
    <div
      ref={drag}
      className={clsx(
        "flex transform flex-col items-center justify-center rounded-xl p-2 transition-transform duration-150 duration-200 hover:scale-110 hover:transition active:scale-90",
        color,
        isDragging ? "opacity-50" : "",
      )}
    >
      <div>{course.code}</div>
      <div>
        {course.units} Unit{course.units != 1 && "s"}
      </div>
    </div>
  );
}
