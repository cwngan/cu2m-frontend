import { apiClient } from "@/apiClient";
import { useRef, useState, useEffect, useCallback } from "react";
import { useDragLayer } from "react-dnd";
import { SemesterPlanData, SemesterTypes } from "../types/SemesterPlan";
import SemesterPlanOfYear from "./SemesterPlanOfYear";
import { CourseBasicInfo } from "../types/Course";

export default function SemesterPlanGridContent({
  coursePlanId,
  setSemesterPlans,
  semesterPlansByYear,
  isLoading,
  handleCreateSemesterPlan,
  isCourseDuplicate,
  handleAddCourseToSemesterPlan,
}: {
  coursePlanId: string;
  semesterPlans: SemesterPlanData[];
  setSemesterPlans: React.Dispatch<React.SetStateAction<SemesterPlanData[]>>;
  semesterPlansByYear: { [year: number]: SemesterPlanData[] };
  isLoading: boolean;
  handleCreateSemesterPlan: (year: number, semester: number) => Promise<void>;
  isCourseDuplicate: (courseId: string, currentPlanId: string) => boolean;
  handleAddCourseToSemesterPlan: (
    course: CourseBasicInfo,
    semesterPlanId: string,
    sourcePlanId: string | null
  ) => Promise<void>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setIsDragging] = useState(false);

  // Monitor drag state
  const { isDragging: isItemDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));

  useEffect(() => {
    setIsDragging(isItemDragging);
  }, [isItemDragging]);

  const handleRemoveCourseFromSemsterPlan = useCallback(
    async (courseId: string, semesterPlanId: string) => {
      try {
        // Get the current semester plan using fresh state
        setSemesterPlans((prevPlans) => {
          const currentPlan = prevPlans.find(
            (plan) => plan._id === semesterPlanId,
          );
          if (!currentPlan) {
            console.error("Semester plan not found:", semesterPlanId);
            return prevPlans;
          }

          // Create updated courses array without the removed course
          const updatedCourses = currentPlan.courses
            .filter((course) => course._id !== courseId)
            .map((course) => course.code);

          // Update the semester plan in the backend
          apiClient
            .patch(`/api/semester-plans/${semesterPlanId}`, {
              courses: updatedCourses,
            })
            .then((response) => {
              if (response.status !== 200) {
                throw new Error("Failed to update semester plan");
              }
            })
            .catch((error) => {
              console.error("Error updating semester plan:", error);
              alert("Failed to update semester plan");
            });

          // Update the frontend state immediately
          return prevPlans.map((plan) => {
            if (plan._id === semesterPlanId) {
              const updatedCourses = plan.courses.filter(
                (course) => course._id !== courseId,
              );
              return { ...plan, courses: updatedCourses };
            }
            return plan;
          });
        });
      } catch (error) {
        console.error("Error removing course from semester plan:", error);
        alert("Failed to remove course from semester plan");
      }
    },
    [setSemesterPlans], // Add setSemesterPlans to dependency array
  );

  const handleNewYearAdded = useCallback(
    (newPlans: SemesterPlanData[]) => {
      setSemesterPlans((prevPlans) => [...prevPlans, ...newPlans]);
    },
    [setSemesterPlans],
  );

  const handleCreateInitialYearPlan = async () => {
    try {
      // Create Autumn semester
      const autumnResponse = await apiClient.post("/api/semester-plans/", {
        course_plan_id: coursePlanId,
        year: 1,
        semester: SemesterTypes.AUTUMN,
      });

      // Create Spring semester
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
  };

  const handlePlanDeleted = useCallback(
    (planId: string) => {
      setSemesterPlans((prevPlans) =>
        prevPlans.filter((plan) => plan._id !== planId),
      );
    },
    [setSemesterPlans],
  );

  const years = Object.keys(semesterPlansByYear).map(Number);
  const maxYear = years.length > 0 ? Math.max(...years) : 0;

  return (
    <div className="mt-20 flex w-full items-start justify-center overflow-auto pb-18">
      <div
        ref={containerRef}
        className="semester-plan-grid-horizontal-scrollbar container-px-4 relative flex items-start justify-start gap-3 overflow-auto pt-8"
      >
        {isLoading ? (
          <div className="flex h-96 w-full items-center justify-center">
            <div className="text-2xl">Loading...</div>
          </div>
        ) : Object.keys(semesterPlansByYear).length > 0 ? (
          <>
            {Object.entries(semesterPlansByYear).map(([yearNumber, plans]) => (
              <SemesterPlanOfYear
                yearNumber={parseInt(yearNumber)}
                plans={plans}
                key={yearNumber}
                handleRemoveCourseFromSemsterPlan={
                  handleRemoveCourseFromSemsterPlan
                }
                coursePlanId={coursePlanId}
                isLastYear={parseInt(yearNumber) === maxYear}
                onYearAdded={handleNewYearAdded}
                onPlanDeleted={handlePlanDeleted}
                isCourseDuplicate={isCourseDuplicate}
                handleAddCourseToSemesterPlan={handleAddCourseToSemesterPlan}
              />
            ))}
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
