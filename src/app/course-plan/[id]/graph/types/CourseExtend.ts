import { CourseRead } from "@/app/types/Models";

export interface CourseExtend extends CourseRead, Record<string, unknown> {
  year: number;
  semester: number;
}
