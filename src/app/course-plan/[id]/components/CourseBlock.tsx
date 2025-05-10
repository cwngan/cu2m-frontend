import clsx from "clsx";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import DraggableBlock from "@/app/components/DraggableBlock";
import { getCourseColor } from "../utils";
import { CourseRead } from "@/app/types/Models";

interface CourseBlockProps {
  semesterPlanId: string;
  course: CourseRead;
  warningType?: string;
}

export default function CourseBlock({
  semesterPlanId,
  course,
  warningType,
}: CourseBlockProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [color, setColor] = useState<string>("bg-neutral-200");

  useEffect(() => {
    if (course.code === null) {
      throw new Error("Course code is null");
    }
    setColor(getCourseColor(course.code));
  }, [course.code]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (warningType) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 40,
        left: rect.left + rect.width / 2,
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const getWarningMessage = () => {
    if (!warningType) return "Warning";
  
    const warnings = warningType.split(",");
    const messages = warnings.map((warning) => {
      if (warning.includes(":")) {
        const [type, details] = warning.split(":");
        const courseCodes = details.split("|");
        if (type === "not_for_taken_previous") {
          return `Cannot be taken after ${courseCodes.join(", ")}`;
        } else {
          return warning; // Fallback for unrecognized types
        }
      } else {
        switch (warning) {
          case "duplicate":
            return "Duplicated course";
          case "prerequisite":
            return "Prerequisite not satisfied";
          case "corequisite":
            return "Corequisite not satisfied";
          default:
            return warning;
        }
      }
    });
  
    return messages.join("\n");
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
          warningType && "ring-2 ring-red-500",
        )}
        setIsDragging={null}
      >
        <div className="flex items-center gap-1">
          <span>{course.code}</span>
          {warningType && (
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
        warningType &&
        createPortal(
          <div
            className="fixed z-50 rounded bg-gray-800 px-2 py-1 text-sm whitespace-pre-line text-white"
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
