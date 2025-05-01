import clsx from "clsx";
import { SemesterPlanData } from "../types/SemesterPlan";
import SemesterPlan from "./SemesterPlan";
import { useCallback, useEffect, useState } from "react";

interface SemesterPlanOfYearProps {
  yearNumber: number;
  plans: SemesterPlanData[];
  handleRemoveCourseFromSemsterPlan: (
    courseId: string,
    semesterPlanId: string,
  ) => void;
}
export default function SemesterPlanOfYear({
  yearNumber,
  plans,
  handleRemoveCourseFromSemsterPlan,
}: SemesterPlanOfYearProps) {
  const [semesterPlans, setSemesterPlans] = useState<SemesterPlanData[]>(plans);
  const handleAddSummerSession = useCallback(() => {
    // Simulate adding a summer session to the semester plans
    // To be replaced by an API call
    setSemesterPlans((prevPlans) => {
      const updatedPlans = [...prevPlans];
      const summerSession = {
        _id: crypto.randomUUID(),
        courses: [],
        semester: 3,
        year: yearNumber,
      };
      updatedPlans.push(summerSession);
      return updatedPlans;
    });
  }, [yearNumber]);
  useEffect(() => {
    setSemesterPlans(plans);
  }, [plans]);
  return (
    <div className="flex h-auto flex-col items-center">
      <div
        className={clsx(
          "w-full rounded-xl border-4 border-white bg-gradient-to-r from-neutral-700 via-stone-700 to-zinc-700 p-3 text-center text-2xl font-bold text-neutral-200 inset-ring inset-ring-stone-800",
        )}
      >{`Year ${yearNumber}`}</div>
      <div className={clsx("flex items-center justify-center")}>
        {semesterPlans.map((plan) => (
          <SemesterPlan
            key={plan._id}
            plan={plan}
            // Add summer session if there are less than 3 semesters and it's the second semester
            addSummerSession={semesterPlans.length < 3 && plan.semester === 2}
            {...{ handleAddSummerSession, handleRemoveCourseFromSemsterPlan }}
          />
        ))}
      </div>
    </div>
  );
}
