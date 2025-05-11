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
  const tokens = prereq
    .trim()
    .split(/\s+/)
    .filter((token) => token !== "");
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
function evaluatePrerequisite(
  node: ASTNode,
  takenCourses: Set<string>,
): boolean {
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
  const [takenBeforeMap, setTakenBeforeMap] = useState<
    Map<string, Set<string>>
  >(new Map());

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

  const fetchCourseDetails = useCallback(
    async (courseCodes: string[]): Promise<CourseRead[]> => {
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
    },
    [], // Removed apiClient from dependencies for fucking lintign since it's a singleton
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
      if (course.code === null) {
        console.error("Cannot add course with null code");
        return;
      }
      try {
        const fullCourseDetails = await fetchCourseDetails([course.code]);
        if (fullCourseDetails.length === 0) {
          console.error("Failed to fetch full course details for", course.code);
          return;
        }
        const fullCourse = fullCourseDetails[0];

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
                .includes(fullCourse.code || ""),
            ) ||
              plan.courses.some((existingCourse) =>
                fullCourse.not_for_taken
                  ?.split(" or ")
                  .map((code) => code.trim())
                  .includes(existingCourse.code || ""),
              )),
        );

        const filteredCourses = currentPlan.courses.filter(
          (existingCourse) => existingCourse.code !== fullCourse.code,
        );
        const updatedCourses = [...filteredCourses, fullCourse];

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
                return { ...plan, courses: updatedCourses };
              }
              if (
                potentiallyAffectedPlans.some(
                  (affected) => affected._id === plan._id,
                )
              ) {
                return { ...plan };
              }
              return plan;
            });

            const sortedPlans = [...newPlans].sort((a, b) => {
              if (a.year !== b.year) return a.year - b.year;
              return a.semester - b.semester;
            });
            const map = new Map<string, Set<string>>();
            const takenCourses = new Set<string>();
            for (const plan of sortedPlans) {
              map.set(plan._id, new Set(takenCourses));
              for (const course of plan.courses) {
                if (course.code) takenCourses.add(course.code);
              }
            }
            setTakenBeforeMap(map);

            return newPlans;
          });

          if (sourcePlanId !== null) {
            handleRemoveCourseFromSemsterPlan(fullCourse.code, sourcePlanId);
          }
        } else {
          throw new Error("Failed to update semester plan");
        }
      } catch (error) {
        console.error("Error updating semester plan:", error);
        alert("Failed to update semester plan");
      }
    },
    [
      detailedSemesterPlans,
      handleRemoveCourseFromSemsterPlan,
      fetchCourseDetails,
    ],
  );

  const getCourseWarningType = useCallback(
    (courseId: string, currentPlanId: string): string | undefined => {
      if (detailedSemesterPlans === null) {
        return undefined;
      }

      const currentPlan = detailedSemesterPlans.find(
        (plan) => plan._id === currentPlanId,
      );
      if (!currentPlan) return undefined;

      const currentCourse = currentPlan.courses.find(
        (course) => course._id === courseId,
      );
      if (!currentCourse) return undefined;

      const warnings: string[] = [];

      // Check for duplicate warning
      const isDuplicate = detailedSemesterPlans.some((plan) => {
        if (plan._id === currentPlanId) return false;
        return plan.courses.some((course) => course._id === courseId);
      });
      if (isDuplicate) {
        warnings.push("duplicate");
      }

      // Check for not_for_taken in previous semesters
      const takenBefore = takenBeforeMap.get(currentPlanId);
      const notForTakenCourses =
        currentCourse.not_for_taken?.split(" or ").map((code) => code.trim()) ||
        [];
      if (takenBefore) {
        const notForTakenPrevious = notForTakenCourses.filter((code) =>
          takenBefore.has(code),
        );
        if (notForTakenPrevious.length > 0) {
          warnings.push(
            `not_for_taken_previous:${notForTakenPrevious.join("|")}`,
          );
        }
      }

      // Check prerequisites
      if (takenBefore && currentCourse.prerequisites) {
        try {
          const ast = parsePrerequisite(currentCourse.prerequisites);
          const isSatisfied = evaluatePrerequisite(ast, takenBefore);
          if (!isSatisfied) {
            warnings.push("prerequisite");
          }
        } catch (error) {
          console.error("Error parsing prerequisite:", error);
          warnings.push("prerequisite");
        }
      }

      // Check corequisites
      if (currentCourse.corequisites) {
        try {
          const ast = parsePrerequisite(currentCourse.corequisites);
          const currentCoursesSet = new Set(
            currentPlan.courses
              .map((c) => c.code)
              .filter((code) => code !== null),
          );
          const availableCourses = new Set([
            ...(takenBefore || []),
            ...currentCoursesSet,
          ]);
          const isSatisfied = evaluatePrerequisite(ast, availableCourses);
          if (!isSatisfied) {
            warnings.push("corequisite");
          }
        } catch (error) {
          console.error("Error parsing corequisite:", error);
          warnings.push("corequisite");
        }
      }

      //check for anti-requisites within the same semester
      // i think i should actually include the code due to the fact that it can be changed
      // if we get more information about how cusis work
      /*
      const currentCourses = new Set(
        currentPlan.courses
          .filter((c) => c._id !== courseId)
          .map((c) => c.code)
          .filter((code) => code !== null),
      );
      const notForTakenSame = notForTakenCourses.filter((code) =>
        currentCourses.has(code),
      );
      if (notForTakenSame.length > 0) {
        warnings.push(`not_for_taken_same:${notForTakenSame.join("|")}`);
      }
      */

      return warnings.length > 0 ? warnings.join(",") : undefined;
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
  }, [semesterPlans, fetchCourseDetails]);

  useEffect(() => {
    if (detailedSemesterPlans === null) return;

    const sortedPlans = [...detailedSemesterPlans].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.semester - b.semester;
    });
    const map = new Map<string, Set<string>>();
    const takenCourses = new Set<string>();
    for (const plan of sortedPlans) {
      map.set(plan._id, new Set(takenCourses));
      for (const course of plan.courses) {
        if (course.code) takenCourses.add(course.code);
      }
    }
    setTakenBeforeMap(map);

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
