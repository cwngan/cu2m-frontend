import clsx from "clsx";
import { SemesterPlanData, SemesterTypes } from "../types/SemesterPlan";
import SemesterPlan from "./SemesterPlan";
import { useCallback } from "react";
import { apiClient } from "@/apiClient";

interface SemesterPlanOfYearProps {
  yearNumber: number;
  plans: SemesterPlanData[];
  handleRemoveCourseFromSemsterPlan: (
    courseId: string,
    semesterPlanId: string,
  ) => void;
  coursePlanId: string;
  isLastYear?: boolean;
  onYearAdded?: (newPlans: SemesterPlanData[]) => void;
  onPlanDeleted?: (planId: string) => void;
}

export default function SemesterPlanOfYear({
  yearNumber,
  plans,
  handleRemoveCourseFromSemsterPlan,
  coursePlanId,
  isLastYear = false,
  onYearAdded,
  onPlanDeleted,
}: SemesterPlanOfYearProps) {
  const handleAddSemesterPlan = useCallback(
    async (semester: number) => {
      try {
        const response = await apiClient.post("/api/semester-plans/", {
          course_plan_id: coursePlanId,
          year: yearNumber,
          semester,
        });

        if (response.status === 200) {
          onYearAdded?.([response.data.data]);
        } else {
          throw new Error("Failed to add semester");
        }
      } catch (error) {
        console.error("Error adding semester:", error);
        alert("Failed to add semester");
      }
    },
    [yearNumber, coursePlanId, onYearAdded],
  );

  const handleAddSummerSession = useCallback(async () => {
    try {
      const response = await apiClient.post("/api/semester-plans/", {
        course_plan_id: coursePlanId,
        year: yearNumber,
        semester: SemesterTypes.SUMMER,
      });

      if (response.status === 200) {
        onYearAdded?.([response.data.data]);
      } else {
        throw new Error("Failed to add summer session");
      }
    } catch (error) {
      console.error("Error adding summer session:", error);
      alert("Failed to add summer session");
    }
  }, [yearNumber, coursePlanId, onYearAdded]);

  const handleAddNextYear = useCallback(async () => {
    try {
      // Create Autumn semester
      const autumnResponse = await apiClient.post("/api/semester-plans/", {
        course_plan_id: coursePlanId,
        year: yearNumber + 1,
        semester: SemesterTypes.AUTUMN,
      });

      // Create Spring semester
      const springResponse = await apiClient.post("/api/semester-plans/", {
        course_plan_id: coursePlanId,
        year: yearNumber + 1,
        semester: SemesterTypes.SPRING,
      });

      if (autumnResponse.status === 200 && springResponse.status === 200) {
        const newPlans = [autumnResponse.data.data, springResponse.data.data];
        onYearAdded?.(newPlans);
      } else {
        throw new Error("Failed to create new year plan");
      }
    } catch (error) {
      console.error("Error creating new year plan:", error);
      alert("Failed to create new year plan");
    }
  }, [yearNumber, coursePlanId, onYearAdded]);

  const handleSemesterPlanDeleted = useCallback(
    (planId: string) => {
      onPlanDeleted?.(planId);
    },
    [onPlanDeleted],
  );

  // Always use the plans prop directly instead of local state
  const hasSpring = plans.some(
    (plan) => plan.semester === SemesterTypes.SPRING,
  );
  const hasAutumn = plans.some(
    (plan) => plan.semester === SemesterTypes.AUTUMN,
  );

  // Determine which plans have add buttons and their positions
  const getAddButtonConfig = (plan: SemesterPlanData) => {
    // When only one plan exists
    if (plans.length === 1) {
      if (!hasSpring && plan.semester === SemesterTypes.AUTUMN) {
        return { semester: SemesterTypes.SPRING, position: "after" as const };
      }
      if (!hasAutumn && plan.semester === SemesterTypes.SPRING) {
        return { semester: SemesterTypes.AUTUMN, position: "before" as const };
      }
    }
    // If we have Spring but no Autumn, show add button before Spring
    if (!hasAutumn && plan.semester === SemesterTypes.SPRING) {
      return { semester: SemesterTypes.AUTUMN, position: "before" as const };
    }
    // If we have Autumn but no Spring, show add button after Autumn
    if (!hasSpring && plan.semester === SemesterTypes.AUTUMN) {
      return { semester: SemesterTypes.SPRING, position: "after" as const };
    }
    // No add button in other cases
    return undefined;
  };

  return (
    <div className="flex h-auto flex-col items-center">
      <div
        className={clsx(
          "w-full rounded-xl border-4 border-white bg-gradient-to-r from-neutral-700 via-stone-700 to-zinc-700 p-3 text-center text-2xl font-bold text-neutral-200 inset-ring inset-ring-stone-800",
        )}
      >{`Year ${yearNumber}`}</div>
      <div className="relative flex items-center justify-center">
        <div className={clsx("flex items-center justify-center")}>
          {plans.map((plan) => (
            <SemesterPlan
              key={plan._id}
              plan={plan}
              addSummerSession={
                plans.length === 2 && plan.semester === SemesterTypes.SPRING
              }
              handleAddSummerSession={handleAddSummerSession}
              handleRemoveCourseFromSemsterPlan={
                handleRemoveCourseFromSemsterPlan
              }
              onSemesterPlanDeleted={handleSemesterPlanDeleted}
              handleAddSemesterPlan={handleAddSemesterPlan}
              showAddButton={getAddButtonConfig(plan)}
            />
          ))}
        </div>
        {/* Add Year Button - only show if this is the last year */}
        {isLastYear && (
          <div className="absolute -right-12 flex h-full items-center justify-center">
            <div
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 font-extrabold text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-700"
              onClick={handleAddNextYear}
            >
              +
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
