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
  }>([]);
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
    [setSemesterPlans], // Add setSemesterPlans to dependency array
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
          code: courseCodes, // Pass each course code as a separate 'code' parameter
        },
        paramsSerializer: {
          indexes: null, // This makes axios repeat the parameter name for each value: code=ENGG1110&code=CSCI1130
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
            rawSemesterPlans.map(
              async (plan: {
                courses: Array<string | CourseBasicInfo>;
                _id: string;
                semester: number;
                year: number;
              }) => {
                console.log("Processing plan:", plan);
                // Handle both cases where courses might be strings or CourseBasicInfo objects
                const courseCodes = Array.isArray(plan.courses)
                  ? plan.courses.map((course: string | CourseBasicInfo) =>
                      typeof course === "string" ? course : course.code,
                    )
                  : [];
                const courseDetails = await fetchCourseDetails(courseCodes);
                console.log("Course details for plan:", courseDetails);
                return {
                  ...plan,
                  courses: courseDetails,
                };
              },
            ),
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
