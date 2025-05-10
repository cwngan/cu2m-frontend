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

  const handleRemoveCourseFromSemsterPlan = useCallback(
    async (courseCode: string | null, semesterPlanId: string) => {
      if (detailedSemesterPlans === null) {
        throw new Error("Detailed semester plans are null");
      }
      try {
        const currentPlan = detailedSemesterPlans.find(
          (plan) => plan._id === semesterPlanId,
        );
        if (!currentPlan) {
          throw new Error("Semester plan not found: " + semesterPlanId);
        }
        const updatedCourses = currentPlan.courses.filter(
          (course) => course.code !== courseCode,
        );
        await apiClient
          .patch(`/api/semester-plans/${semesterPlanId}`, {
            courses: updatedCourses.map((course) => course.code),
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
        setDetailedSemesterPlans((prevPlans) => {
          if (prevPlans === null) {
            throw new Error("Detailed semester plans are null");
          }
          return prevPlans.map((plan) => {
            if (plan._id === semesterPlanId) {
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
    [detailedSemesterPlans],
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
        const currentPlan = detailedSemesterPlans.find(
          (plan) => plan._id === semesterPlanId,
        );
        if (!currentPlan) {
          console.error("Semester plan not found:", semesterPlanId);
          return;
        }

        const potentiallyAffectedPlans = detailedSemesterPlans.filter(
          (plan) =>
            plan._id !== semesterPlanId &&
            (plan.courses.some((existingCourse) =>
              existingCourse.not_for_taken
                ?.split(" or ")
                .map((code) => code.trim())
                .includes(course.code || ""),
            ) ||
              plan.courses.some((existingCourse) =>
                course.not_for_taken
                  ?.split(" or ")
                  .map((code) => code.trim())
                  .includes(existingCourse.code || ""),
              )),
        );

        console.log(
          "Affected plans:",
          potentiallyAffectedPlans.map((p) => p._id),
        );

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
          setDetailedSemesterPlans((prevPlans) => {
            if (prevPlans === null) {
              throw new Error("Detailed semester plans are null");
            }

            const newPlans = prevPlans.map((plan) => {
              if (plan._id === semesterPlanId) {
                console.log("Updating target plan:", plan._id);
                return {
                  ...plan,
                  courses: updatedCourses,
                };
              }
              if (
                potentiallyAffectedPlans.some(
                  (affected) => affected._id === plan._id,
                )
              ) {
                console.log("Force updating affected plan:", plan._id);
                return { ...plan };
              }
              return plan;
            });

            return newPlans;
          });

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

  const fetchCourseDetails = async (
    courseCodes: string[],
  ): Promise<CourseRead[]> => {
    try {
      if (!courseCodes || courseCodes.length === 0) {
        return [];
      }

      console.log("Fetching details for course codes:", courseCodes);
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

  const getCourseWarningType = useCallback(
    (courseId: string, currentPlanId: string): string | undefined => {
      if (detailedSemesterPlans === null) {
        throw new Error("Detailed semester plans are null");
      }
      const currentPlan = detailedSemesterPlans.find(
        (plan) => plan._id === currentPlanId,
      );
      if (!currentPlan) return undefined;

      const currentCourse = currentPlan.courses.find(
        (course) => course._id === courseId,
      );
      if (!currentCourse) return undefined;

      const notForTakenCourses =
        currentCourse.not_for_taken?.split(" or ").map((code) => code.trim()) ||
        [];

      for (const otherCourse of currentPlan.courses) {
        if (otherCourse._id === courseId) continue;

        const otherNotForTaken =
          otherCourse.not_for_taken?.split(" or ").map((code) => code.trim()) ||
          [];

        if (
          otherNotForTaken.includes(currentCourse.code || "") ||
          notForTakenCourses.includes(otherCourse.code || "")
        ) {
          return `not_for_taken:${otherCourse.code}`;
        }
      }

      for (const plan of detailedSemesterPlans) {
        if (plan._id === currentPlanId) continue;
        for (const otherCourse of plan.courses) {
          const otherNotForTaken =
            otherCourse.not_for_taken?.split(" or ").map((code) => code.trim()) ||
            [];
          if (otherNotForTaken.includes(currentCourse.code || "")) {
            return `not_for_taken:${otherCourse.code}`;
          }
          if (notForTakenCourses.includes(otherCourse.code || "")) {
            return `not_for_taken:${otherCourse.code}`;
          }
        }
      }

      const isDuplicate = detailedSemesterPlans.some((plan) => {
        if (plan._id === currentPlanId) return false;
        return plan.courses.some((course) => course._id === courseId);
      });

      return isDuplicate ? "duplicate" : undefined;
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
  }, [semesterPlans]);

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
        handleAddCourseToSemesterPlan={handleAddCourseToSemesterPlan}
        getCourseWarningType={getCourseWarningType}
      />
      <DeleteZone onRemove={handleRemoveCourseFromSemsterPlan} />
      <SearchBlock />
    </DndProvider>
  );
}