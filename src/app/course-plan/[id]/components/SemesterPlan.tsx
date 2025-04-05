import { useEffect, useRef, useState } from "react";
import { SemesterPlanData } from "../types/SemesterPlan";
import CourseBlock from "./CourseBlock";
import SemesterPlanTitle from "./SemesterPlanTitle";
import { useDrop } from "react-dnd";
import { CourseBasicInfo } from "../types/Course";

interface SemesterPlanProps {
  plan: SemesterPlanData;
  addSummerSession: boolean;
  handleAddSummerSession?: () => void;
  handleRemoveCourseFromSemsterPlan: (
    courseId: string,
    semesterPlanId: string,
  ) => void;
}
export default function SemesterPlan({
  plan,
  addSummerSession,
  handleAddSummerSession,
  handleRemoveCourseFromSemsterPlan,
}: SemesterPlanProps) {
  const [semesterPlan, setSemesterPlan] = useState<SemesterPlanData>(plan);
  useEffect(() => {
    setSemesterPlan(plan);
  }, [plan]);
  const drop = useRef<HTMLDivElement>(null);
  const [{ isOver }, dropConnector] = useDrop(() => ({
    accept: "COURSE",
    drop: (item: { course: CourseBasicInfo; semesterPlanId: string }) => {
      // Prevent dropping on the same semester plan
      if (item.semesterPlanId === semesterPlan._id) {
        return;
      }
      // console.log("Dropped item:", item);
      // console.log("Dropped on plan:", plan);
      // Handle the dropped course here
      // Simulate adding the course to the semester plan
      // To be replaced by an API call
      setSemesterPlan((prevPlan) => {
        const updatedPlan = { ...prevPlan };
        const courseIndex = updatedPlan.courses.findIndex(
          (course) => course._id === item.course._id,
        );
        if (courseIndex === -1) {
          updatedPlan.courses.push(item.course);
        }
        return updatedPlan;
      });
      handleRemoveCourseFromSemsterPlan(item.course._id, item.semesterPlanId);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  dropConnector(drop);

  return (
    <div
      ref={drop}
      className={`relative flex w-44 flex-col items-center justify-center border-r ${
        isOver ? "bg-blue-100" : ""
      }`}
    >
      <SemesterPlanTitle plan={semesterPlan} />
      <div className="flex h-128 w-full flex-col gap-3 p-3">
        {semesterPlan.courses.map((course) => (
          <CourseBlock
            course={course}
            key={course._id}
            semesterPlanId={plan._id}
          />
        ))}
      </div>
      {addSummerSession && handleAddSummerSession && (
        <div className="absolute -right-3 flex h-full w-6 items-center justify-center overflow-visible opacity-0 hover:opacity-100">
          <div
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-green-600 leading-none font-extrabold text-white"
            onClick={() => {
              handleAddSummerSession();
            }}
          >
            +
          </div>
        </div>
      )}
    </div>
  );
}
