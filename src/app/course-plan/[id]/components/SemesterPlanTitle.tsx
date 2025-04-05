import { useState, useEffect } from "react";
import { SemesterPlanData, SemesterTypes } from "../types/SemesterPlan";

interface SemesterPlanTitleProps {
  plan: SemesterPlanData;
}

export default function SemesterPlanTitle({ plan }: SemesterPlanTitleProps) {
  const [totalUnits, setTotalUnits] = useState<number>(0);
  useEffect(() => {
    setTotalUnits(plan.courses.reduce((prev, curr) => prev + curr.units, 0));
  }, [plan]);
  return (
    <div className="w-full border-b py-2 text-center">
      <div className="text-lg leading-none">
        {plan.semester == SemesterTypes.AUTUMN
          ? "Autumn"
          : plan.semester == SemesterTypes.SPRING
            ? "Spring"
            : plan.semester == SemesterTypes.SUMMER
              ? "Summer Session"
              : `Semester ${plan.semester}`}
      </div>
      <div className="mt-1 text-sm leading-none">
        {totalUnits != 1 ? (
          <span>{totalUnits} Units</span>
        ) : (
          <span>{totalUnits} Unit</span>
        )}
      </div>
    </div>
  );
}
