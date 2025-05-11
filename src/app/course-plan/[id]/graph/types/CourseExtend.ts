import { CourseRead } from "@/app/types/Models";

export type CourseExtend = CourseRead & {
  year: number;
  semester: number;
  warnings?: string[];
  [key: string]: unknown; // Add index signature to satisfy Record<string, unknown>
};
