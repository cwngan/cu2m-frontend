import { apiClient } from "@/apiClient";
import { SemesterPlanResponseModel } from "@/app/types/ApiResponseModel";
import {
  CourseRead,
  SemesterPlanReadWithCourseDetails,
} from "@/app/types/Models";
import { Dispatch, SetStateAction } from "react";
import { parsePrerequisite, evaluatePrerequisite } from "./RequisiteParser";
import { fetchCourseDetails } from "./FetchHelpers";

const levelColors: { [key: number]: string } = {
  1: "bg-green-800/30 text-gray-80",
  2: "bg-zinc-500/40",
  3: "bg-teal-700/30",
  4: "bg-stone-600/40 text-stone-800",
};

const unitsColors: { [key: number]: string } = {
  0: "bg-lime-200/50",
  1: "bg-yellow-200/50",
  2: "bg-amber-300/50",
  3: "bg-orange-300/50",
  4: "bg-red-300/50",
  5: "bg-pink-300/50",
};

export const getCourseColor = (code: string): string => {
  // Extract the first digit from the numeric part of the course code (e.g., CSCI2100 -> 2)
  const match = code.match(/\d/);
  const level = match ? parseInt(match[0]) : undefined;
  return level !== undefined ? levelColors[level] : "bg-neutral-200";
};

export const getUnitsColor = (units: number): string => {
  const fixedUnits = Math.min(5, units);
  return unitsColors[fixedUnits];
};

export function getCourseWarningType(
  courseId: string,
  currentPlanId: string,
  detailedSemesterPlans: SemesterPlanReadWithCourseDetails[] | null,
  takenBeforeMap: Map<string, Set<string>>,
): string | undefined {
  if (detailedSemesterPlans === null) return undefined;
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
    currentCourse.not_for_taken?.split(" or ").map((code) => code.trim()) || [];
  if (takenBefore) {
    const notForTakenPrevious = notForTakenCourses.filter((code) =>
      takenBefore.has(code),
    );
    if (notForTakenPrevious.length > 0) {
      warnings.push(`not_for_taken_previous:${notForTakenPrevious.join("|")}`);
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
        currentPlan.courses.map((c) => c.code).filter((code) => code !== null),
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
}

export async function handleRemoveCourseFromSemsterPlan(
  courseCode: string | null,
  semesterPlanId: string | null,
  detailedSemesterPlans: SemesterPlanReadWithCourseDetails[] | null,
  callbackFn: Dispatch<
    SetStateAction<SemesterPlanReadWithCourseDetails[] | null>
  >,
) {
  if (semesterPlanId === null) {
    // skip removing course from semester plan because they do not belong to any semester plans
    return;
  }
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
    callbackFn((prevPlans) => {
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
}

export async function handleAddCourseToSemesterPlan(
  course: CourseRead,
  semesterPlanId: string,
  sourcePlanId: string | null,
  detailedSemesterPlans: SemesterPlanReadWithCourseDetails[] | null,
  setDetailedSemesterPlans: Dispatch<
    SetStateAction<SemesterPlanReadWithCourseDetails[] | null>
  >,
  setTakenBeforeMap: Dispatch<Map<string, Set<string>>>,
) {
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
        handleRemoveCourseFromSemsterPlan(
          fullCourse.code,
          sourcePlanId,
          detailedSemesterPlans,
          setDetailedSemesterPlans,
        );
      }
    } else {
      throw new Error("Failed to update semester plan");
    }
  } catch (error) {
    console.error("Error updating semester plan:", error);
    alert("Failed to update semester plan");
  }
}
