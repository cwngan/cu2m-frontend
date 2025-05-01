import { useRef } from "react";
import { CourseBasicInfo } from "../types/Course";
import { useDrag } from "react-dnd";
import clsx from "clsx";
import { useState } from "react";
import { useEffect } from "react";

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

  function colorFilter(input: string) {
    if (input.length < 5) return;
    let semNum: number = Number(input[4]);

    switch (semNum) {
      case 1:
        setColor("bg-green-800/30 text-gray-80");
        break;
      case 2:
        setColor("bg-zinc-500/40");
        break;
      case 3:
        setColor("bg-teal-700/30");
        break;
      case 4:
        setColor("bg-stone-600/40 text-stone-800");
        break;
      default:
        setColor("bg-neutral-200");
    }
  }
  useEffect(() => {
    colorFilter(course.code);
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
