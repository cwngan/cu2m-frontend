"use client";
import { useCallback, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SearchBlock from "./SearchBlock";
import {
  CoursePlanWithSemestersResponseModel,
  CoursesResponseModel,
  SemesterPlanResponseModel,
} from "@/app/types/ApiResponseModel";
import { apiClient } from "@/apiClient";
import SemesterPlanGridContent from "./SemesterPlanGridContent";
import DeleteZone from "./DeleteZone";
import {
  CourseRead,
  SemesterPlanReadWithCourseDetails,
} from "@/app/types/Models";

interface SemesterPlanGridProps {
  coursePlanId: string;
  coursePlanResponse: CoursePlanWithSemestersResponseModel;
}

// Main component that provides the DndProvider context
export default function SemesterPlanGrid({
  coursePlanId,
  coursePlanResponse,
}: SemesterPlanGridProps) {
  const semesterPlans = coursePlanResponse.data!.semester_plans;
  const [detailedSemesterPlans, setDetailedSemesterPlans] = useState<
    SemesterPlanReadWithCourseDetails[] | null
  >(null);
  const [semesterPlansByYear, setSemesterPlansByYear] = useState<{
    [year: number]: SemesterPlanReadWithCourseDetails[];
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourseDetails = useCallback(async (
    courseCodes: string[],
  ): Promise<CourseRead[]> => {
    try {
      if (!courseCodes || courseCodes.length === 0) {
        return [];
      }

      const response = await apiClient.get<CoursesResponseModel>(
        "/api/courses/",
        {
          params: {
            keywords: courseCodes,
            strict: true,
            basic: true,
          },
        },
      );
      if (response.status === 200 && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error: unknown) {
      console.error("Error fetching course details:", error);
      return [];
    }
  }, []);

  const handleRemoveCourseFromSemsterPlan = useCallback(
    async (courseCode: string | null, semesterPlanId: string) => {
      if (!courseCode) {
        console.error("No course code provided for removal");
        return;
      }

      if (detailedSemesterPlans === null) {
        try {
          const response = await apiClient.get(`/api/semester-plans/${semesterPlanId}`);
          if (response.status !== 200) {
            throw new Error("Failed to fetch semester plan");
          }
          const currentPlan = response.data.data;
          if (!currentPlan) {
            throw new Error("Semester plan not found: " + semesterPlanId);
          }
          
          const updatedCourses = currentPlan.courses.filter(
            (code: string) => code !== courseCode
          );
          
          const payload = {
            courses: updatedCourses,
          };
          
          const updateResponse = await apiClient
            .patch(`/api/semester-plans/${semesterPlanId}`, payload);
          
          if (updateResponse.status !== 200) {
            throw new Error(`Failed to update semester plan: ${updateResponse.data.error || 'Unknown error'}`);
          }

          // Fetch fresh data for all semester plans
          const freshPlans = await Promise.all(
            semesterPlans.map(async (plan) => {
              const response = await apiClient.get(`/api/semester-plans/${plan._id}`);
              if (response.status !== 200) {
                throw new Error(`Failed to fetch semester plan ${plan._id}`);
              }
              const courseDetails = await fetchCourseDetails(response.data.data.courses);
              return {
                ...response.data.data,
                courses: courseDetails,
              };
            })
          );
          setDetailedSemesterPlans(freshPlans);
        } catch (error: unknown) {
          if (error instanceof Error) {
            alert(`Failed to remove course: ${error.message}`);
          } else if (typeof error === 'object' && error !== null && 'response' in error) {
            const axiosError = error as { response?: { data?: { error?: string } } };
            alert(`Failed to remove course: ${axiosError.response?.data?.error || 'Unknown error'}`);
          } else {
            alert("Failed to remove course from semester plan");
          }
        }
        return;
      }

      try {
        const currentPlan = detailedSemesterPlans.find(
          (plan) => plan._id === semesterPlanId,
        );
        if (!currentPlan) {
          throw new Error("Semester plan not found: " + semesterPlanId);
        }
        
        const currentCourseCodes = currentPlan.courses.map(course => course.code);
        const updatedCourseCodes = currentCourseCodes.filter(
          (code: string | null): code is string => code !== null && code !== courseCode
        );
        
        const payload = {
          courses: updatedCourseCodes,
        };
        
        const updateResponse = await apiClient
          .patch(`/api/semester-plans/${semesterPlanId}`, payload);
        
        if (updateResponse.status !== 200) {
          throw new Error(`Failed to update semester plan: ${updateResponse.data.error || 'Unknown error'}`);
        }

        // Fetch fresh data for all semester plans
        const freshPlans = await Promise.all(
          semesterPlans.map(async (plan) => {
            const response = await apiClient.get(`/api/semester-plans/${plan._id}`);
            if (response.status !== 200) {
              throw new Error(`Failed to fetch semester plan ${plan._id}`);
            }
            const courseDetails = await fetchCourseDetails(response.data.data.courses);
            return {
              ...response.data.data,
              courses: courseDetails,
            };
          })
        );
        setDetailedSemesterPlans(freshPlans);
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert(`Failed to remove course: ${error.message}`);
        } else if (typeof error === 'object' && error !== null && 'response' in error) {
          const axiosError = error as { response?: { data?: { error?: string } } };
          alert(`Failed to remove course: ${axiosError.response?.data?.error || 'Unknown error'}`);
        } else {
          alert("Failed to remove course from semester plan");
        }
      }
    },
    [detailedSemesterPlans, semesterPlans, fetchCourseDetails],
  );

  const handleAddCourseToSemesterPlan = useCallback(
    async (
      course: CourseRead,
      semesterPlanId: string,
      sourcePlanId: string | null,
    ) => {
      if (detailedSemesterPlans === null) {
        throw new Error("Detailed semester plans are null");
      }
      try {
        // Get the current semester plan
        const currentPlan = detailedSemesterPlans.find(
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

        const response = await apiClient.patch<SemesterPlanResponseModel>(
          `/api/semester-plans/${semesterPlanId}`,
          {
            courses: updatedCourses.map((course) => course.code),
          },
        );

        if (response.status === 200) {
          // Update all semester plans to trigger re-render and warning checks
          setDetailedSemesterPlans((prevPlans) => {
            if (prevPlans === null) {
              throw new Error("Detailed semester plans are null");
            }
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
            handleRemoveCourseFromSemsterPlan(course.code, sourcePlanId);
          }
        } else {
          throw new Error("Failed to update semester plan");
        }
      } catch (error) {
        console.error("Error updating semester plan:", error);
        alert("Failed to update semester plan");
      }
    },
    [detailedSemesterPlans, handleRemoveCourseFromSemsterPlan],
  );

  // Function to check if a course is duplicated across semester plans
  const isCourseDuplicate = useCallback(
    (courseId: string, currentPlanId: string) => {
      if (detailedSemesterPlans === null) {
        throw new Error("Detailed semester plans are null");
      }
      // Find the course in the current plan
      const currentPlan = detailedSemesterPlans.find(
        (plan) => plan._id === currentPlanId,
      );
      if (!currentPlan) return false;

      // Check if this course appears in any other plan
      const isDuplicate = detailedSemesterPlans.some((plan) => {
        if (plan._id === currentPlanId) return false;
        return plan.courses.some((course) => course._id === courseId);
      });

      return isDuplicate;
    },
    [detailedSemesterPlans],
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
        setDetailedSemesterPlans(detailedPlans);
      } catch (error) {
        console.error("Error fetching detailed semester plans:", error);
      }
    };

    fetchDetailedSemesterPlans();
  }, [semesterPlans, fetchCourseDetails]);

  useEffect(() => {
    if (detailedSemesterPlans === null) {
      return;
    }
    const plansByYear: { [year: number]: SemesterPlanReadWithCourseDetails[] } =
      {};
    detailedSemesterPlans.forEach((plan) => {
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
  }, [detailedSemesterPlans]);

  return (
    <DndProvider backend={HTML5Backend}>
      <SemesterPlanGridContent
        coursePlanId={coursePlanId}
        semesterPlans={detailedSemesterPlans}
        setSemesterPlans={setDetailedSemesterPlans}
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
