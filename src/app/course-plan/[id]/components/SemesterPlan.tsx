import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import CourseBlock from "./CourseBlock";
import SemesterPlanTitle from "./SemesterPlanTitle";
import { useDrop } from "react-dnd";
import clsx from "clsx";
import {
  CourseRead,
  SemesterPlanReadWithCourseDetails,
} from "@/app/types/Models";
// import { apiClient } from "@/apiClient";

interface SemesterPlanProps {
  plan: SemesterPlanReadWithCourseDetails;
  addSummerSession: boolean;
  handleAddSummerSession?: () => void;
  // handleRemoveCourseFromSemsterPlan: (
  //   courseId: string,
  //   semesterPlanId: string,
  // ) => void;
  onSemesterPlanDeleted?: (planId: string) => void;
  handleAddSemesterPlan?: (semester: number) => void;
  showAddButton?: {
    semester: number;
    position: "before" | "after";
  };
  isCourseDuplicate: (courseId: string, currentPlanId: string) => boolean;
  handleAddCourseToSemesterPlan: (
    course: CourseRead,
    semesterPlanId: string,
    sourcePlanId: string | null,
  ) => Promise<void>;
}

// This component represents an individual year column in the course plan grid
export default function SemesterPlan({
  plan,
  addSummerSession,
  handleAddSummerSession,
  // handleRemoveCourseFromSemsterPlan,
  onSemesterPlanDeleted,
  handleAddSemesterPlan,
  showAddButton,
  isCourseDuplicate,
  handleAddCourseToSemesterPlan,
}: SemesterPlanProps) {
  const [semesterPlan, setSemesterPlan] =
    useState<SemesterPlanReadWithCourseDetails>(plan);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  useEffect(() => {
    setSemesterPlan(plan);
  }, [plan]);

  const drop = useRef<HTMLDivElement>(null);
  const [{ isOver }, dropConnector] = useDrop(
    () => ({
      accept: "COURSE",
      drop: async (item: {
        course: CourseRead;
        semesterPlanId: string | null;
        setIsDragging: Dispatch<SetStateAction<boolean>> | null;
      }) => {
        // If dropping in the same plan, do nothing
        if (item.semesterPlanId === semesterPlan._id) {
          return undefined;
        }
        if (item.setIsDragging !== null) {
          item.setIsDragging(false);
        }
        try {
          await handleAddCourseToSemesterPlan(
            item.course,
            semesterPlan._id,
            item.semesterPlanId,
          );
          return { allowedDrop: true };
        } catch (error) {
          console.error("Error updating semester plan:", error);
          alert("Failed to update semester plan");
          return { allowedDrop: false };
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [handleAddCourseToSemesterPlan],
  );
  dropConnector(drop);

  const [isDuplicate, setIsDuplicate] = useState<boolean[] | null>(null);
  useEffect(() => {
    setIsDuplicate(
      plan.courses.map((course) =>
        isCourseDuplicate(course._id, semesterPlan._id),
      ),
    );
  }, [plan, semesterPlan, isCourseDuplicate]);

  return (
    <div className="relative flex items-center">
      {/* Left margin hover area */}
      {showAddButton?.position === "before" && (
        <div
          className="absolute -left-3 z-10 flex h-full w-6 items-center justify-center"
          onMouseEnter={() => setShowLeftButton(true)}
          onMouseLeave={() => setShowLeftButton(false)}
        >
          <button
            className={clsx(
              "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-600 text-xl font-extrabold text-white opacity-0 shadow-lg transition-opacity duration-200 hover:bg-green-700",
              showLeftButton && "opacity-100",
            )}
            onClick={() => handleAddSemesterPlan?.(showAddButton.semester)}
            tabIndex={0}
            aria-label="Add semester"
          >
            +
          </button>
        </div>
      )}

      {/* Main semester plan content */}
      <div
        ref={drop}
        data-semplan-id={plan._id}
        className={clsx(
          "from-stone-60 relative flex w-44 flex-col items-center justify-center gap-3 rounded-lg border-1 border-neutral-300 bg-gradient-to-br via-neutral-100 to-stone-100 ring-3 inset-ring ring-white inset-ring-white",
          isOver &&
            "bg-linear-to-t from-neutral-200 to-neutral-300 transition duration-300",
        )}
      >
        <SemesterPlanTitle
          plan={semesterPlan}
          onSemesterPlanDeleted={() => {
            onSemesterPlanDeleted?.(semesterPlan._id);
          }}
        />
        <div className="flex h-128 w-full flex-col gap-5 overflow-x-visible overflow-y-auto rounded-xl p-4">
          {semesterPlan.courses && semesterPlan.courses.length > 0 ? (
            semesterPlan.courses.map((course, idx) => {
              return (
                <CourseBlock
                  course={course}
                  key={course._id}
                  semesterPlanId={plan._id}
                  isDuplicate={isDuplicate === null ? false : isDuplicate[idx]}
                  warningType={isDuplicate ? "Duplicated Course" : undefined}
                />
              );
            })
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No courses
            </div>
          )}
        </div>
      </div>

      {/* Right margin hover area */}
      {((addSummerSession && handleAddSummerSession) ||
        showAddButton?.position === "after") && (
        <div
          className="absolute -right-3 z-10 flex h-full w-6 items-center justify-center"
          onMouseEnter={() => setShowRightButton(true)}
          onMouseLeave={() => setShowRightButton(false)}
        >
          <button
            className={clsx(
              "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-600 text-xl font-extrabold text-white opacity-0 shadow-lg transition-opacity duration-200 hover:bg-green-700",
              showRightButton && "opacity-100",
            )}
            onClick={() => {
              if (addSummerSession && handleAddSummerSession) {
                handleAddSummerSession();
              } else if (showAddButton?.position === "after") {
                handleAddSemesterPlan?.(showAddButton.semester);
              }
            }}
            tabIndex={0}
            aria-label="Add semester or summer session"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
