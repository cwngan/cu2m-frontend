import { useState, useEffect } from "react";
import { SemesterPlanData, SemesterTypes } from "../types/SemesterPlan";
import { apiClient } from "@/apiClient";
import clsx from "clsx";

interface SemesterPlanTitleProps {
  plan: SemesterPlanData;
  onSemesterPlanDeleted?: () => void;
}

export default function SemesterPlanTitle({
  plan,
  onSemesterPlanDeleted,
}: SemesterPlanTitleProps) {
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    setTotalUnits(plan.courses.reduce((prev, curr) => prev + curr.units, 0));
  }, [plan]);

  const handleDelete = async () => {
    try {
      const response = await apiClient.delete(
        `/api/semester-plans/${plan._id}`,
      );
      if (response.status === 200) {
        onSemesterPlanDeleted?.();
      } else {
        throw new Error("Failed to delete semester plan");
      }
    } catch (error) {
      console.error("Error deleting semester plan:", error);
      alert("Failed to delete semester plan");
    }
  };

  return (
    <div
      className="group relative flex w-full flex-col items-center justify-center rounded-t-lg border-t-1 border-neutral-300 bg-neutral-200 py-2 text-center min-h-[56px]"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {showDelete ? (
        <button
          className="flex items-center justify-center text-xl font-bold text-white bg-red-500 rounded-full w-8 h-8 mx-auto transition-all hover:bg-red-600 focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            if (
              confirm("Are you sure you want to delete this semester plan?")
            ) {
              handleDelete();
            }
          }}
        >
          &minus;
        </button>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2">
            <div className="text-bold text-lg leading-none">
              {plan.semester == SemesterTypes.AUTUMN
                ? "Autumn"
                : plan.semester == SemesterTypes.SPRING
                  ? "Spring"
                  : plan.semester == SemesterTypes.SUMMER
                    ? "Summer Session"
                    : `Semester ${plan.semester}`}
            </div>
          </div>
          <div className="mt-1 text-sm leading-none text-stone-700">
            {totalUnits != 1 ? (
              <span>{totalUnits} Units</span>
            ) : (
              <span>{totalUnits} Unit</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
