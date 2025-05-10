import clsx from "clsx";
import { useState } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import DraggableBlock from "@/app/components/DraggableBlock";
import { getCourseColor } from "../utils";
import { CourseRead } from "@/app/types/Models";

interface CourseBlockProps {
  semesterPlanId: string;
  course: CourseRead;
  isDuplicate?: boolean;
  warningType?: string;
}

export default function CourseBlock({
  semesterPlanId,
  course,
  isDuplicate = false,
  warningType,
}: CourseBlockProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  //set the color of course block base on number of semester
  const [color, setColor] = useState<string>("bg-neutral-200");

  useEffect(() => {
    if (course.code === null) {
      throw new Error("Course code is null");
    }
    setColor(getCourseColor(course.code));
  }, [course.code]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (warningType || isDuplicate) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 40, // Position above the element
        left: rect.left + rect.width / 2, // Center horizontally
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const getWarningMessage = () => {
    switch (warningType?.split(":")[0]) {
      case "duplicate":
        return "Duplicated course";
      case "not_for_taken":
        const conflictingCourse = warningType.split(":")[1];
        return `This course cannot be taken with ${conflictingCourse}`;
      default:
        return warningType || "Warning";
    }
  };

  return (
    <>
      <DraggableBlock
        blockType="COURSE"
        dragItem={{
          semesterPlanId: semesterPlanId,
          course: course,
          setIsDragging: null,
        }}
        className={clsx(
          "group flex flex-col items-center justify-center p-2",
          color,
          (warningType || isDuplicate) && "ring-2 ring-red-500",
        )}
        setIsDragging={null}
      >
        <div className="flex items-center gap-1">
          <span>{course.code}</span>
          {(warningType || isDuplicate) && (
            <div
              className="group relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span className="cursor-help font-bold text-red-500">!</span>
            </div>
          )}
        </div>
        <div>
          {course.units} Unit{course.units != 1 && "s"}
        </div>
      </DraggableBlock>
      {showTooltip &&
        (warningType || isDuplicate) &&
        createPortal(
          <div
            className="fixed z-50 rounded bg-gray-800 px-2 py-1 text-sm whitespace-nowrap text-white"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              transform: "translateX(-50%)",
            }}
          >
            {getWarningMessage()}
          </div>,
          document.body,
        )}
    </>
  );
}
