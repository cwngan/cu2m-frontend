"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { DndProvider, useDragLayer, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SemesterPlanData, SemesterTypes } from "../types/SemesterPlan";
import { RawSemesterPlanData } from "../types/RawSemesterPlan";
import SemesterPlanOfYear from "./SemesterPlanOfYear";
import SearchBlock from "./SearchBlock";
import { CoursePlanResponseModel } from "@/app/types/ApiResponseModel";
import { apiClient } from "@/apiClient";
import { CourseBasicInfo } from "../types/Course";
import { clsx } from "clsx";

interface SemesterPlanGridProps {
  coursePlanId: string;
  coursePlanResponse: CoursePlanResponseModel;
}

// Inner component that uses drag and drop hooks
function SemesterPlanGridContent({
  coursePlanId,
  semesterPlans,
  setSemesterPlans,
  semesterPlansByYear,
  isLoading,
  handleCreateSemesterPlan,
}: {
  coursePlanId: string;
  semesterPlans: SemesterPlanData[];
  setSemesterPlans: React.Dispatch<React.SetStateAction<SemesterPlanData[]>>;
  semesterPlansByYear: { [year: number]: SemesterPlanData[] };
  isLoading: boolean;
  handleCreateSemesterPlan: (year: number, semester: number) => Promise<void>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    [], // Remove semesterPlans dependency since we're using callback form of setState
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

// Create a deletion zone component
function DeleteZone({
  onRemove,
}: {
  onRemove: (courseId: string, semesterPlanId: string) => void;
}) {
  const deleteRef = useRef<HTMLDivElement>(null);
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "COURSE",
    drop: (item: {
      course: CourseBasicInfo;
      semesterPlanId: string | null;
    }) => {
      if (item.semesterPlanId) {
        onRemove(item.course._id, item.semesterPlanId);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  drop(deleteRef);

  return (
    <div
      ref={deleteRef}
      className={clsx(
        "fixed right-8 bottom-8 z-50 flex h-16 w-16 items-center justify-center rounded-lg transition-all duration-200",
        isOver ? "scale-110 bg-red-500" : "bg-red-400 hover:bg-red-500",
        canDrop ? "opacity-100" : "opacity-70",
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="white"
        className={clsx(
          "h-8 w-8 transition-transform duration-200",
          isOver && "scale-110",
        )}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
        />
      </svg>
    </div>
  );
}

// Main component that provides the DndProvider context
export default function SemesterPlanGrid({
  coursePlanId,
  coursePlanResponse,
}: SemesterPlanGridProps) {
  const [semesterPlans, setSemesterPlans] = useState<SemesterPlanData[]>([]);
  const [semesterPlansByYear, setSemesterPlansByYear] = useState<{
    [year: number]: SemesterPlanData[];
  }>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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
    [], // Remove semesterPlans dependency since we're using callback form of setState
  );

  const handleCreateSemesterPlan = async (year: number, semester: number) => {
    try {
      const response = await apiClient.post("/api/semester-plans/", {
        course_plan_id: coursePlanId,
        year,
        semester,
      });

      if (response.status === 200) {
        const newPlan = response.data.data;
        setSemesterPlans((prevPlans) => [...prevPlans, newPlan]);
      } else {
        throw new Error("Failed to create semester plan");
      }
    } catch (error) {
      console.error("Error creating semester plan:", error);
      alert("Failed to create semester plan");
    }
  };

  const fetchCourseDetails = async (
    courseCodes: string[],
  ): Promise<CourseBasicInfo[]> => {
    try {
      // If there are no course codes, return an empty array
      if (!courseCodes || courseCodes.length === 0) {
        return [];
      }

      console.log("Fetching details for course codes:", courseCodes);
      const response = await apiClient.get("/api/courses/", {
        params: {
          code: courseCodes,
        },
        paramsSerializer: {
          indexes: null, // This will make axios repeat the parameter name for each value
        },
      });

      console.log("API Response:", response.data);
      if (response.status === 200 && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching course details:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch semester plans
        const response = await apiClient.get(
          `/api/course-plans/${coursePlanId}`,
        );
        console.log("Raw semester plans:", response.data.data.semester_plans);
        if (response.status === 200 && response.data.data) {
          const rawSemesterPlans = response.data.data.semester_plans || [];

          // Fetch course details for each semester plan
          const semesterPlansWithDetails = await Promise.all(
            rawSemesterPlans.map(async (plan: any) => {
              console.log("Processing plan:", plan);
              const courseDetails = await fetchCourseDetails(plan.courses);
              console.log("Course details for plan:", courseDetails);
              return {
                ...plan,
                courses: courseDetails,
              };
            }),
          );

          console.log(
            "Final semester plans with details:",
            semesterPlansWithDetails,
          );
          // Sort semester plans by semester before setting state
          const sortedPlans = [...semesterPlansWithDetails].sort(
            (a, b) => a.semester - b.semester,
          );
          setSemesterPlans(sortedPlans);
        }
      } catch (error) {
        console.error("Error fetching semester plans:", error);
        alert("Failed to fetch semester plans");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [coursePlanId]);

  useEffect(() => {
    const plansByYear: { [year: number]: SemesterPlanData[] } = {};
    semesterPlans.forEach((plan) => {
      if (!plansByYear[plan.year]) {
        plansByYear[plan.year] = [];
      }
      plansByYear[plan.year].push(plan);
    });
    // Sort plans by semester within each year
    Object.values(plansByYear).forEach((plans) => {
      plans.sort((a, b) => a.semester - b.semester);
    });
    setSemesterPlansByYear(plansByYear);
  }, [semesterPlans]);

  return (
    <DndProvider backend={HTML5Backend}>
      <SemesterPlanGridContent
        coursePlanId={coursePlanId}
        semesterPlans={semesterPlans}
        setSemesterPlans={setSemesterPlans}
        semesterPlansByYear={semesterPlansByYear}
        isLoading={isLoading}
        handleCreateSemesterPlan={handleCreateSemesterPlan}
      />
      <DeleteZone onRemove={handleRemoveCourseFromSemsterPlan} />
      <SearchBlock />
    </DndProvider>
  );
}
