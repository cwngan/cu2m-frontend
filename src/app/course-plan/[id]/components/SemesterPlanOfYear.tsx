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
    <div className="flex h-auto flex-col items-center border border-r-0">
      <div
        className={clsx(
          "w-full border-r border-b p-2 text-center text-2xl font-bold",
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
