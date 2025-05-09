import { useRef } from "react";
import { CourseBasicInfo } from "../types/Course";
import { useDrag } from "react-dnd";
import clsx from "clsx";
import { useState } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

const levelColors: { [key: number]: string } = {
  1: "bg-green-800/30 text-gray-80",
  2: "bg-zinc-500/40",
  3: "bg-teal-700/30",
  4: "bg-stone-600/40 text-stone-800",
};

interface CourseBlockProps {
  semesterPlanId: string;
  course: CourseBasicInfo;
  isDuplicate?: boolean;
  warningType?: string;
}

interface DropResultType {
  allowedDrop?: boolean;
}

export default function CourseBlock({
  semesterPlanId,
  course,
  isDuplicate = false,
  warningType,
}: CourseBlockProps) {
  const drag = useRef<HTMLDivElement>(null);
  const [didBounce, setDidBounce] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

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

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isDuplicate) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 40, // Position above the element
        left: rect.left + (rect.width / 2), // Center horizontally
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <div
        ref={drag}
        className={clsx(
          "group flex transform flex-col items-center justify-center rounded-xl p-2 transition-all duration-150",
          color,
          isDragging ? "scale-105 opacity-50" : "",
          didBounce && "animate-bounce",
          isDuplicate && "ring-2 ring-red-500",
        )}
      >
        <div className="flex items-center gap-1">
          <span>{course.code}</span>
          {isDuplicate && (
            <div 
              className="relative group"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className="font-bold text-red-500 cursor-help">!</span>
            </div>
          )}
        </div>
        <div>
          {course.units} Unit{course.units != 1 && "s"}
        </div>
      </div>
      {showTooltip && isDuplicate && createPortal(
        <div 
          className="fixed px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-50"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: 'translateX(-50%)',
          }}
        >
          {warningType || "Course appears in another semester"}
        </div>,
        document.body
      )}
    </>
  );
}
