"use client";
import { useEffect, useState } from "react";
import SemesterPlan from "./SemesterPlan";
import { SemesterPlanData } from "../types/SemesterPlan";
import { RawSemesterPlanData } from "../types/RawSemesterPlan";
import clsx from "clsx";

const template: { data: RawSemesterPlanData[] } = {
  data: [
    {
      _id: "1",
      courses: [
        {
          _id: "1",
          code: "ENGG1110",
          title: "Problem Solving with Programming",
          units: 3,
        },
      ],
      semester: 1,
      year: 1,
    },
    {
      _id: "2",
      courses: [],
      semester: 2,
      year: 1,
    },
    {
      _id: "3",
      courses: [],
      semester: 1,
      year: 2,
    },
    {
      _id: "4",
      courses: [],
      semester: 2,
      year: 2,
    },
    {
      _id: "5",
      courses: [],
      semester: 1,
      year: 3,
    },
    {
      _id: "6",
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
    <div className="mt-12 flex w-full justify-center">
      <div className="flex max-w-full items-start justify-start gap-3 overflow-auto px-4 py-8 md:px-8 lg:px-12">
        {Object.keys(semesterPlansByYear).length > 0 ? (
          Object.entries(semesterPlansByYear).map((year) => {
            const [yearNumber, plans] = year;
            return (
              <div
                key={yearNumber}
                className="flex h-auto flex-col items-center border border-r-0"
              >
                <div
                  className={clsx(
                    "w-full border-r border-b text-center text-2xl font-bold",
                  )}
                >{`Year ${yearNumber}`}</div>
                <div className={clsx("flex items-center justify-center")}>
                  {plans.map((plan) => (
                    <SemesterPlan key={plan._id} plan={plan} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-96 w-full items-center justify-center">
            <div className="text-2xl">Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
}
