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

// Define AST node types for prerequisite parsing
type ASTNode =
  | { type: "course"; code: string }
  | { type: "and"; left: ASTNode; right: ASTNode }
  | { type: "or"; left: ASTNode; right: ASTNode };

// Parse prerequisite string into an AST
function parsePrerequisite(prereq: string): ASTNode {
  const tokens = prereq.trim().split(/\s+/).filter((token) => token !== "");
  let index = 0;

  function parseExpression(): ASTNode {
    let left = parseTerm();
    while (index < tokens.length && tokens[index] === "or") {
      index++;
      const right = parseTerm();
      left = { type: "or", left, right };
    }
    return left;
  }

  function parseTerm(): ASTNode {
    let left = parseFactor();
    while (index < tokens.length && tokens[index] === "and") {
      index++;
      const right = parseFactor();
      left = { type: "and", left, right };
    }
    return left;
  }

  function parseFactor(): ASTNode {
    if (index >= tokens.length) {
      throw new Error("Unexpected end of prerequisite string");
    }
    const token = tokens[index];
    if (token === "(") {
      index++;
      const expr = parseExpression();
      if (index >= tokens.length || tokens[index] !== ")") {
        throw new Error("Mismatched parentheses");
      }
      index++;
      return expr;
    } else {
      index++;
      return { type: "course", code: token };
    }
  }

  const result = parseExpression();
  if (index < tokens.length) {
    throw new Error("Extra tokens after parsing");
  }
  return result;
}

// Evaluate the AST against taken courses
function evaluatePrerequisite(node: ASTNode, takenCourses: Set<string>): boolean {
  switch (node.type) {
    case "course":
      return takenCourses.has(node.code);
    case "and":
      return (
        evaluatePrerequisite(node.left, takenCourses) &&
        evaluatePrerequisite(node.right, takenCourses)
      );
    case "or":
      return (
        evaluatePrerequisite(node.left, takenCourses) ||
        evaluatePrerequisite(node.right, takenCourses)
      );
    default:
      return false;
  }
}

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
  const [takenBeforeMap, setTakenBeforeMap] = useState<Map<string, Set<string>>>(
    new Map(),
  );

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

      // Check for duplicate warning
      const isDuplicate = detailedSemesterPlans.some((plan) => {
        if (plan._id === currentPlanId) return false;
        return plan.courses.some((course) => course._id === courseId);
      });
      if (isDuplicate) return "duplicate";

      // Check for not_for_taken warning
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

      // Check for prerequisite warning
      const takenBefore = takenBeforeMap.get(currentPlanId);
      if (
        takenBefore &&
        currentCourse.prerequisites &&
        !/permission|equivalent/i.test(currentCourse.prerequisites)
      ) {
        try {
          const ast = parsePrerequisite(currentCourse.prerequisites);
          const isSatisfied = evaluatePrerequisite(ast, takenBefore);
          if (!isSatisfied) {
            return "prerequisite";
          }
        } catch (error) {
          console.error("Error parsing prerequisite:", error);
          // Skip warning on parse error
        }
      }

      return undefined;
    },
    [detailedSemesterPlans, takenBeforeMap],
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
        setDetailedSemesterPlans(detailedPlans);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching detailed semester plans:", error);
      }
    };

    fetchDetailedSemesterPlans();
  }, [semesterPlans]);

  useEffect(() => {
    if (detailedSemesterPlans === null) return;

    // Compute takenBeforeMap
    const sortedPlans = [...detailedSemesterPlans].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.semester - b.semester;
    });
    const map = new Map<string, Set<string>>();
    let takenCourses = new Set<string>();
    for (const plan of sortedPlans) {
      map.set(plan._id, new Set(takenCourses));
      for (const course of plan.courses) {
        if (course.code) takenCourses.add(course.code);
      }
    }
    setTakenBeforeMap(map);

    // Group plans by year
    const plansByYear: { [year: number]: SemesterPlanReadWithCourseDetails[] } = {};
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