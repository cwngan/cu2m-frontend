import { SemesterPlanData } from "../types/SemesterPlan";

interface SemesterPlanProps {
  plan: SemesterPlanData;
}
export default function SemesterPlan({ plan }: SemesterPlanProps) {
  console.log(plan);
  return (
    <div className="flex w-44 flex-col items-center justify-center border-r">
      <div className="w-full border-b text-center">
        Semester {plan.semester}
      </div>
      <div className="h-128 w-full p-3">
        {plan.courses.map((course) => (
          <div
            key={course._id}
            className="flex flex-col items-center justify-center bg-neutral-200 p-2"
          >
            <div>{course.code}</div>
            {/* <div>{course.title}</div> */}
            <div>
              {course.units} Unit{course.units != 1 && "s"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
