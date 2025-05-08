import { RawSemesterPlanData } from "./RawSemesterPlan";

export const SemesterTypes = {
  AUTUMN: 1,
  SPRING: 2,
  SUMMER: 3,
} as const;

export type SemesterPlanData = RawSemesterPlanData;
