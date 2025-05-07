"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SemesterPlanData } from "../types/SemesterPlan";
import { RawSemesterPlanData } from "../types/RawSemesterPlan";
import SemesterPlanOfYear from "./SemesterPlanOfYear";
import SearchBlock from "./SearchBlock";
import { CoursePlanResponseModel } from "@/app/types/ApiResponseModel";
import { apiClient } from "@/apiClient";
import { CourseBasicInfo } from "../types/Course";
// import { CoursePlanRead } from "@/app/types/Models";

interface SemesterPlanGridProps {
  coursePlanId: string;
  coursePlanResponse: CoursePlanResponseModel;
}
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
    (courseId: string, semesterPlanId: string) => {
      setSemesterPlans((prevPlans) => {
        const updatedPlans = prevPlans.map((plan) => {
          if (plan._id === semesterPlanId) {
            const updatedCourses = plan.courses.filter(
              (course) => course._id !== courseId,
            );
            return { ...plan, courses: updatedCourses };
          }
          return plan;
        });
        return updatedPlans;
      });
    },
    [],
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

  const fetchCourseDetails = async (courseCodes: string[]): Promise<CourseBasicInfo[]> => {
    try {
      console.log('Fetching details for course codes:', courseCodes);
      const response = await apiClient.get("/api/courses/", {
        params: {
          code: courseCodes
        },
        paramsSerializer: {
          indexes: null // This will make axios repeat the parameter name for each value
        }
      });
      
      console.log('API Response:', response.data);
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
        const response = await apiClient.get(`/api/course-plans/${coursePlanId}`);
        console.log('Raw semester plans:', response.data.data.semester_plans);
        if (response.status === 200 && response.data.data) {
          const rawSemesterPlans = response.data.data.semester_plans || [];
          
          // Fetch course details for each semester plan
          const semesterPlansWithDetails = await Promise.all(
            rawSemesterPlans.map(async (plan: any) => {
              console.log('Processing plan:', plan);
              const courseDetails = await fetchCourseDetails(plan.courses);
              console.log('Course details for plan:', courseDetails);
              return {
                ...plan,
                courses: courseDetails
              };
            })
          );
          
          console.log('Final semester plans with details:', semesterPlansWithDetails);
          setSemesterPlans(semesterPlansWithDetails);
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
    setSemesterPlansByYear(plansByYear);
  }, [semesterPlans]);

  return (
    <DndProvider backend={HTML5Backend}>
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
            Object.entries(semesterPlansByYear).map(([yearNumber, plans]) => {
              return (
                <SemesterPlanOfYear
                  yearNumber={parseInt(yearNumber)}
                  plans={plans}
                  key={yearNumber}
                  handleRemoveCourseFromSemsterPlan={
                    handleRemoveCourseFromSemsterPlan
                  }
                />
              );
            })
          ) : (
            <div className="flex h-96 w-full flex-col items-center justify-center gap-4">
              <div className="text-2xl text-gray-600">No semester plans found</div>
              <button
                onClick={() => handleCreateSemesterPlan(1, 1)}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
              >
                Create First Semester Plan
              </button>
            </div>
          )}
          {/* <div className="container-padding-block-px-4 fixed top-0 left-0 h-full bg-gradient-to-l from-transparent to-white to-25%"></div>
          <div className="container-padding-block-px-4 fixed top-0 right-0 h-full bg-gradient-to-r from-transparent to-white to-25%"></div> */}
        </div>
      </div>
      <SearchBlock />
    </DndProvider>
  );
}
