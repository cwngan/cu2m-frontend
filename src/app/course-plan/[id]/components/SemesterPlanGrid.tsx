"use client";
import { useCallback, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SemesterPlanData } from "../types/SemesterPlan";
import SearchBlock from "./SearchBlock";
import { CoursePlanResponseModel } from "@/app/types/ApiResponseModel";
import { apiClient } from "@/apiClient";
import { CourseBasicInfo } from "../types/Course";
import SemesterPlanGridContent from "./SemesterPlanGridContent";
import DeleteZone from "./DeleteZone";

interface SemesterPlanGridProps {
  coursePlanId: string;
  coursePlanResponse: CoursePlanResponseModel;
}

// Main component that provides the DndProvider context
export default function SemesterPlanGrid({
  coursePlanId,
}: SemesterPlanGridProps) {
  const [semesterPlans, setSemesterPlans] = useState<SemesterPlanData[]>([]);
  const [semesterPlansByYear, setSemesterPlansByYear] = useState<{
    [year: number]: SemesterPlanData[];
  }>({});
  const [isLoading, setIsLoading] = useState(true);

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
    [setSemesterPlans],
  );

  const handleAddCourseToSemesterPlan = useCallback(
    async (
      course: CourseBasicInfo,
      semesterPlanId: string,
      sourcePlanId: string | null,
    ) => {
      try {
        // Get the current semester plan
        const currentPlan = semesterPlans.find(
          (plan) => plan._id === semesterPlanId,
        );
        if (!currentPlan) {
          console.error("Semester plan not found:", semesterPlanId);
          return;
        }

        // Remove any existing course with the same code
        const filteredCourses = currentPlan.courses.filter(
          (existingCourse) => existingCourse.code !== course.code,
        );
        const updatedCourses = [...filteredCourses, course];

        const response = await apiClient.patch(
          `/api/semester-plans/${semesterPlanId}`,
          {
            courses: updatedCourses.map((course) => course.code),
          },
        );

        if (response.status === 200) {
          // Update all semester plans to trigger re-render and warning checks
          setSemesterPlans((prevPlans) => {
            return prevPlans.map((plan) => {
              if (plan._id === semesterPlanId) {
                return {
                  ...plan,
                  courses: updatedCourses,
                };
              }
              return plan;
            });
          });

          // If the course was moved from another semester plan, remove it from there
          if (sourcePlanId !== null) {
            handleRemoveCourseFromSemsterPlan(course._id, sourcePlanId);
          }
        } else {
          throw new Error("Failed to update semester plan");
        }
      } catch (error) {
        console.error("Error updating semester plan:", error);
        alert("Failed to update semester plan");
      }
    },
    [semesterPlans, handleRemoveCourseFromSemsterPlan],
  );


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
          keywords: courseCodes,
          strict: true, // Only match exact course codes
          basic: true, // Only get basic course info
        },
      });

      console.log("API Response:", response.data);
      if (response.status === 200 && response.data.data) {
        // Make sure we only return courses in the same order as requested
        const courseMap = new Map(
          response.data.data.map((course: CourseBasicInfo) => [
            course.code,
            course,
          ]),
        );
        return courseCodes
          .map((code) => courseMap.get(code))
          .filter((course): course is CourseBasicInfo => course !== undefined);
      }
      return [];
    } catch (error) {
      console.error("Error fetching course details:", error);
      return [];
    }
  };

  // Function to check if a course is duplicated across semester plans
  const isCourseDuplicate = useCallback(
    (courseId: string, currentPlanId: string) => {
      // Find the course in the current plan
      const currentPlan = semesterPlans.find(
        (plan) => plan._id === currentPlanId,
      );
      if (!currentPlan) return false;

      const currentCourse = currentPlan.courses.find(
        (course) => course._id === courseId,
      );
      if (!currentCourse) return false;

      // Check if this course appears in any other plan
      const isDuplicate = semesterPlans.some((plan) => {
        if (plan._id === currentPlanId) return false;

        return plan.courses.some((course) => course._id === currentCourse._id);
      });

      return isDuplicate;
    },
    [semesterPlans],
  );

  useEffect(() => {
    const fetchDetailedSemesterPlans = async () => {
      try {
        setIsLoading(true);
        const detailedPlans = await Promise.all(
          semesterPlans.map(async (plan) => {
            const courseDetails = await fetchCourseDetails(plan.courses);
            return {
              ...plan,
              courses: courseDetails,
            };
          }),
        );
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
        // handleCreateSemesterPlan={handleCreateSemesterPlan}
        isCourseDuplicate={isCourseDuplicate}
        handleAddCourseToSemesterPlan={handleAddCourseToSemesterPlan}
      />
      <DeleteZone onRemove={handleRemoveCourseFromSemsterPlan} />
      <SearchBlock />
    </DndProvider>
  );
}
