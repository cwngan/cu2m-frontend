import { apiClient } from "@/apiClient";
import { useRef, useCallback, Dispatch, SetStateAction } from "react";
import { SemesterTypes } from "../types/SemesterPlan";
import SemesterPlanOfYear from "./SemesterPlanOfYear";
import {
  CourseRead,
  SemesterPlanReadWithCourseDetails,
} from "@/app/types/Models";

export default function SemesterPlanGridContent({
  coursePlanId,
  setSemesterPlans,
  semesterPlansByYear,
  handleAddCourseToSemesterPlan,
  getCourseWarningType,
  setIsDragging,
}: {
  coursePlanId: string;
  semesterPlans: SemesterPlanReadWithCourseDetails[] | null;
  setSemesterPlans: Dispatch<
    SetStateAction<SemesterPlanReadWithCourseDetails[] | null>
  >;
  semesterPlansByYear: {
    [year: number]: SemesterPlanReadWithCourseDetails[];
  } | null;
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
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNewYearAdded = useCallback(
    (newPlans: SemesterPlanReadWithCourseDetails[]) => {
      setSemesterPlans((prevPlans) => {
        if (prevPlans === null) {
          throw new Error("Previous plans are null");
        }
        return [...prevPlans, ...newPlans];
      });
    },
    [setSemesterPlans],
  );

  const handleCreateInitialYearPlan = useCallback(async () => {
    try {
      const autumnResponse = await apiClient.post("/api/semester-plans/", {
        course_plan_id: coursePlanId,
        year: 1,
        semester: SemesterTypes.AUTUMN,
      });

      const springResponse = await apiClient.post("/api/semester-plans/", {
        course_plan_id: coursePlanId,
        year: 1,
        semester: SemesterTypes.SPRING,
      });

      if (autumnResponse.status === 200 && springResponse.status === 200) {
        const newPlans = [autumnResponse.data.data, springResponse.data.data];
        setSemesterPlans(newPlans);
      } else {
        throw new Error("Failed to create initial year plan");
      }
    } catch (error) {
      console.error("Error creating initial year plan:", error);
      alert("Failed to create initial year plan");
    }
  }, [coursePlanId, setSemesterPlans]);

  const handlePlanDeleted = useCallback(
    (planId: string) => {
      setSemesterPlans((prevPlans) => {
        if (prevPlans === null) {
          throw new Error("Previous plans are null");
        }
        return prevPlans.filter((plan) => plan._id !== planId);
      });
    },
    [setSemesterPlans],
  );

  return (
    <div className="mt-20 flex w-full items-start justify-center overflow-visible pb-18">
      <div
        ref={containerRef}
        className="semester-plan-grid-horizontal-scrollbar container-px-4 relative flex items-start justify-start gap-3 overflow-x-auto overflow-y-visible pt-8"
      >
        {semesterPlansByYear === null ? (
          <div className="flex h-96 w-full items-center justify-center">
            <div className="text-2xl">Loading...</div>
          </div>
        ) : Object.keys(semesterPlansByYear).length > 0 ? (
          <>
            {Object.entries(semesterPlansByYear).map(
              ([yearNumber, plans], idx) => (
                <SemesterPlanOfYear
                  yearNumber={parseInt(yearNumber)}
                  plans={plans}
                  key={yearNumber}
                  coursePlanId={coursePlanId}
                  isLastYear={
                    idx === Object.keys(semesterPlansByYear).length - 1
                  }
                  onYearAdded={handleNewYearAdded}
                  onPlanDeleted={handlePlanDeleted}
                  handleAddCourseToSemesterPlan={handleAddCourseToSemesterPlan}
                  getCourseWarningType={getCourseWarningType}
                  setIsDragging={setIsDragging}
                />
              ),
            )}
          </>
        ) : (
          <div className="flex h-96 w-full flex-col items-center justify-center gap-4">
            <div className="text-2xl text-gray-600">
              No semester plans found
            </div>
            <button
              onClick={handleCreateInitialYearPlan}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
            >
              Create First Year Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
