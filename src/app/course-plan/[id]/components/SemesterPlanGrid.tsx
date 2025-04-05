"use client";
import { useCallback, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SemesterPlanData } from "../types/SemesterPlan";
import { RawSemesterPlanData } from "../types/RawSemesterPlan";
import SemesterPlanOfYear from "./SemesterPlanOfYear";

const template: { data: RawSemesterPlanData[] } = {
  data: [
    {
      _id: crypto.randomUUID(),
      courses: [
        {
          _id: crypto.randomUUID(),
          code: "ENGG1110",
          title: "Problem Solving with Programming",
          units: 3,
        },
        {
          _id: crypto.randomUUID(),
          code: "MATH1510",
          title: "Calculus for Engineers",
          units: 3,
        },
      ],
      semester: 1,
      year: 1,
    },
    {
      _id: crypto.randomUUID(),
      courses: [],
      semester: 2,
      year: 1,
    },
    {
      _id: crypto.randomUUID(),
      courses: [],
      semester: 1,
      year: 2,
    },
    {
      _id: crypto.randomUUID(),
      courses: [],
      semester: 2,
      year: 2,
    },
    {
      _id: crypto.randomUUID(),
      courses: [
        {
          _id: crypto.randomUUID(),
          code: "UGCP1001",
          title: "Understanding China",
          units: 1,
        },
      ],
      semester: 3,
      year: 2,
    },
    {
      _id: crypto.randomUUID(),
      courses: [],
      semester: 1,
      year: 3,
    },
    {
      _id: crypto.randomUUID(),
      courses: [],
      semester: 2,
      year: 3,
    },
  ],
};
interface SemesterPlanGridProps {
  coursePlanId: string;
}
export default function SemesterPlanGrid({
  coursePlanId,
}: SemesterPlanGridProps) {
  const [semesterPlans, setSemesterPlans] = useState<SemesterPlanData[]>([]);
  const [semesterPlansByYear, setSemesterPlansByYear] = useState<{
    [year: number]: SemesterPlanData[];
  }>([]);
  const handleRemoveCourseFromSemsterPlan = useCallback(
    (courseId: string, semesterPlanId: string) => {
      // Simulate removing the course from the semester plan
      // To be replaced by an API call
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
  useEffect(() => {
    const fetchData = async () => {
      // Simulate an API call
      const response = await new Promise<{ data: RawSemesterPlanData[] }>(
        (resolve) => setTimeout(() => resolve(template), 400),
      );
      const semesterPlans = response.data.map((plan: RawSemesterPlanData) => {
        return {
          _id: plan._id,
          courses: plan.courses,
          semester: plan.semester,
          year: plan.year,
        };
      });
      setSemesterPlans(semesterPlans);
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
      <div className="mt-12 flex w-full justify-center">
        <div className="flex max-w-full items-start justify-start gap-3 overflow-auto px-4 py-8 md:px-8 lg:px-12">
          {Object.keys(semesterPlansByYear).length > 0 ? (
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
            <div className="flex h-96 w-full items-center justify-center">
              <div className="text-2xl">Loading...</div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
