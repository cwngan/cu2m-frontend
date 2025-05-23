import { Dispatch, SetStateAction, useRef, useState } from "react";
import CourseBlock from "./CourseBlock";
import SemesterPlanTitle from "./SemesterPlanTitle";
import { useDrop } from "react-dnd";
import clsx from "clsx";
import {
  CourseRead,
  SemesterPlanReadWithCourseDetails,
} from "@/app/types/Models";

interface SemesterPlanProps {
  plan: SemesterPlanReadWithCourseDetails;
  addSummerSession: boolean;
  handleAddSummerSession?: () => void;
  onSemesterPlanDeleted?: (planId: string) => void;
  handleAddSemesterPlan?: (semester: number) => void;
  showAddButton?: {
    semester: number;
    position: "before" | "after";
  };
  handleAddCourseToSemesterPlan: (
    course: CourseRead,
    semesterPlanId: string,
    sourcePlanId: string | null,
  ) => Promise<void>;
  getCourseWarningType: (
    courseId: string,
    currentPlanId: string,
  ) => string | undefined;
  setIsDragging: Dispatch<SetStateAction<boolean>>;
}

export default function SemesterPlan({
  plan,
  addSummerSession,
  handleAddSummerSession,
  onSemesterPlanDeleted,
  handleAddSemesterPlan,
  showAddButton,
  handleAddCourseToSemesterPlan,
  getCourseWarningType,
  setIsDragging,
}: SemesterPlanProps) {
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const drop = useRef<HTMLDivElement>(null);
  const [{ isOver }, dropConnector] = useDrop(
    () => ({
      accept: "COURSE",
      drop: async (item: {
        course: CourseRead;
        semesterPlanId: string | null;
      }) => {
        if (item.semesterPlanId === plan._id) {
          return undefined;
        }
        setIsDragging(false);
        try {
          await handleAddCourseToSemesterPlan(
            item.course,
            plan._id,
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
    [handleAddCourseToSemesterPlan, plan],
  );
  dropConnector(drop);

  const hasAnyCourses = plan.courses && plan.courses.length > 0;

  return (
    <div className="relative flex items-center">
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

      <div
        ref={drop}
        data-semplan-id={plan._id}
        className={clsx(
          "relative flex w-44 flex-col items-center justify-center rounded-lg border-1 border-neutral-300 ring-3 inset-ring ring-white inset-ring-white",
          isOver
            ? "bg-gradient-to-br from-stone-300/75 to-neutral-200/75"
            : "bg-gradient-to-br from-stone-100/75 via-neutral-100/75 to-stone-100/75",
        )}
      >
        <SemesterPlanTitle
          plan={plan}
          onSemesterPlanDeleted={() => {
            onSemesterPlanDeleted?.(plan._id);
          }}
        />
        <div className="flex h-128 w-full flex-col gap-5 overflow-x-visible overflow-y-auto rounded-xl p-4">
          {hasAnyCourses ? (
            plan.courses.map((course) => (
              <CourseBlock
                key={course._id}
                course={course}
                semesterPlanId={plan._id}
                warningType={getCourseWarningType(course._id, plan._id)}
                setIsDragging={setIsDragging}
              />
            ))
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No courses
            </div>
          )}
        </div>
      </div>

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
