"use client";
import { useCallback, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SearchBlock from "./SearchBlock";
import SemesterPlanGridContent from "./SemesterPlanGridContent";
import DeleteZone from "./DeleteZone";
import {
  CourseRead,
  SemesterPlanRead,
  SemesterPlanReadWithCourseDetails,
} from "@/app/types/Models";
import {
  getCourseWarningType as _getCourseWarningType,
  handleRemoveCourseFromSemsterPlan as _handleRemoveCourseToSemesterPlan,
  handleAddCourseToSemesterPlan as _handleAddCourseToSemesterPlan,
} from "../utils";
import {
  fetchSemesterPlans,
  fetchDetailedSemesterPlans,
} from "../FetchHelpers";

export default function SemesterPlanGrid({
  coursePlanId,
}: {
  coursePlanId: string;
}) {
  const [semesterPlans, setSemesterPlans] = useState<SemesterPlanRead[] | null>(
    null,
  );
  const [detailedSemesterPlans, setDetailedSemesterPlans] = useState<
    SemesterPlanReadWithCourseDetails[] | null
  >(null);
  const [semesterPlansByYear, setSemesterPlansByYear] = useState<{
    [year: number]: SemesterPlanReadWithCourseDetails[];
  } | null>(null);
  const [takenBeforeMap, setTakenBeforeMap] = useState<
    Map<string, Set<string>>
  >(new Map());
  const [isDragging, setIsDragging] = useState<boolean>(true);

  const handleRemoveCourseFromSemsterPlan = useCallback(
    async (courseCode: string | null, semesterPlanId: string | null) => {
      return _handleRemoveCourseToSemesterPlan(
        courseCode,
        semesterPlanId,
        detailedSemesterPlans,
        setDetailedSemesterPlans,
      );
    },
    [detailedSemesterPlans],
  );

  const handleAddCourseToSemesterPlan = useCallback(
    async (
      course: CourseRead,
      semesterPlanId: string,
      sourcePlanId: string | null,
    ) => {
      return _handleAddCourseToSemesterPlan(
        course,
        semesterPlanId,
        sourcePlanId,
        detailedSemesterPlans,
        setDetailedSemesterPlans,
        setTakenBeforeMap,
      );
    },
    [detailedSemesterPlans],
  );

  useEffect(() => {
    fetchSemesterPlans(coursePlanId).then((plans) => setSemesterPlans(plans));
  }, [coursePlanId]);

  useEffect(() => {
    if (semesterPlans === null) return;
    fetchDetailedSemesterPlans(semesterPlans).then((plans) =>
      setDetailedSemesterPlans(plans),
    );
  }, [semesterPlans]);

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

  const getCourseWarningType = useCallback(
    (courseId: string, currentPlanId: string) => {
      return _getCourseWarningType(
        courseId,
        currentPlanId,
        detailedSemesterPlans,
        takenBeforeMap,
      );
    },
    [detailedSemesterPlans, takenBeforeMap],
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <SemesterPlanGridContent
        coursePlanId={coursePlanId}
        semesterPlans={detailedSemesterPlans}
        setSemesterPlans={setDetailedSemesterPlans}
        semesterPlansByYear={semesterPlansByYear}
        handleAddCourseToSemesterPlan={handleAddCourseToSemesterPlan}
        getCourseWarningType={getCourseWarningType}
        setIsDragging={setIsDragging}
      />
      <DeleteZone
        setIsDragging={setIsDragging}
        onRemove={handleRemoveCourseFromSemsterPlan}
      />
      <SearchBlock isDragging={isDragging} setIsDragging={setIsDragging} />
    </DndProvider>
  );
}
