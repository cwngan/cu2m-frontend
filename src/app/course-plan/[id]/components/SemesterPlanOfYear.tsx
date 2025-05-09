import clsx from "clsx";
import { SemesterPlanData, SemesterTypes } from "../types/SemesterPlan";
import SemesterPlan from "./SemesterPlan";
import { useCallback } from "react";
import { apiClient } from "@/apiClient";
import { CourseBasicInfo } from "../types/Course";

interface SemesterPlanOfYearProps {
  yearNumber: number;
  plans: SemesterPlanData[];
  // handleRemoveCourseFromSemsterPlan: (
  //   courseId: string,
  //   semesterPlanId: string,
  // ) => void;
  coursePlanId: string;
  isLastYear?: boolean;
  onYearAdded?: (newPlans: SemesterPlanData[]) => void;
  onPlanDeleted?: (planId: string) => void;
  isCourseDuplicate: (courseId: string, currentPlanId: string) => boolean;
  handleAddCourseToSemesterPlan: (
    course: CourseBasicInfo,
    semesterPlanId: string,
    sourcePlanId: string | null
  ) => Promise<void>;
}

export default function SemesterPlanOfYear({
  yearNumber,
  plans,
  // handleRemoveCourseFromSemsterPlan,
  coursePlanId,
  isLastYear = false,
  onYearAdded,
  onPlanDeleted,
  isCourseDuplicate,
  handleAddCourseToSemesterPlan,
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
  // const hasSpring = plans.some(
  //   (plan) => plan.semester === SemesterTypes.SPRING,
  // );
  // const hasAutumn = plans.some(
  //   (plan) => plan.semester === SemesterTypes.AUTUMN,
  // );

  /**
   * Determines where to show the "+" button for adding new semesters in a year.
   * The function handles different scenarios of semester combinations and returns
   * the appropriate configuration for the add button.
   * 
   * Rules for adding semesters:
   * 1. A year should have at most 3 semesters (Autumn, Spring, Summer)
   * 2. Autumn and Spring are the main semesters, Summer is optional
   * 3. When adding a new semester, we need to maintain the correct order:
   *    - Autumn should come before Spring
   *    - Summer can be added between Autumn and Spring
   * 
   * @param plan The current semester plan being rendered
   * @returns Configuration for the add button, or undefined if no button should be shown
   */
  const getAddButtonConfig = (plan: SemesterPlanData) => {
    // Get all semesters that currently exist in this year
    const present = new Set(plans.map(p => p.semester));
    const isAutumn = present.has(SemesterTypes.AUTUMN);
    const isSpring = present.has(SemesterTypes.SPRING);
    const isSummer = present.has(SemesterTypes.SUMMER);

    // Case 1: Only one semester exists in the year
    if (plans.length === 1) {
      if (plan.semester === SemesterTypes.AUTUMN) {
        // If only Autumn exists, we can add Spring after it
        return { semester: SemesterTypes.SPRING, position: "after" as const };
      }
      if (plan.semester === SemesterTypes.SPRING) {
        // If only Spring exists, we can add Autumn before it
        return { semester: SemesterTypes.AUTUMN, position: "before" as const };
      }
      if (plan.semester === SemesterTypes.SUMMER) {
        // If only Summer exists, we can add Spring after it
        return { semester: SemesterTypes.SPRING, position: "before" as const };
      }
    }

    // Case 2: Two semesters exist in the year
    if (plans.length === 2) {
      // If we have both Autumn and Spring, no add button needed
      // (Summer should be added via the special summer session button)
      if (isAutumn && isSpring) return undefined;

      // If we have Autumn and Summer, we can add Spring between them
      if (isAutumn && isSummer && plan.semester === SemesterTypes.AUTUMN) {
        return { semester: SemesterTypes.SPRING, position: "after" as const };
      }

      // If we have Spring and Summer, we can add Autumn before Spring
      if (isSpring && isSummer && plan.semester === SemesterTypes.SPRING) {
        return { semester: SemesterTypes.AUTUMN, position: "before" as const };
      }
    }

    // Case 3: Handle edge cases for maintaining semester order
    // If we have Spring but no Autumn, show add button before Spring
    if (!isAutumn && plan.semester === SemesterTypes.SPRING) {
      return { semester: SemesterTypes.AUTUMN, position: "before" as const };
    }
    // If we have Autumn but no Spring, show add button after Autumn
    if (!isSpring && plan.semester === SemesterTypes.AUTUMN) {
      return { semester: SemesterTypes.SPRING, position: "after" as const };
    }

    // No add button needed in other cases
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
                !plans.some(p => p.semester === SemesterTypes.SUMMER) && plan.semester === SemesterTypes.SPRING
              }
              handleAddSummerSession={handleAddSummerSession}
              // handleRemoveCourseFromSemsterPlan={
              //   handleRemoveCourseFromSemsterPlan
              // }
              onSemesterPlanDeleted={handleSemesterPlanDeleted}
              handleAddSemesterPlan={handleAddSemesterPlan}
              showAddButton={getAddButtonConfig(plan)}
              isCourseDuplicate={isCourseDuplicate}
              handleAddCourseToSemesterPlan={handleAddCourseToSemesterPlan}
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
