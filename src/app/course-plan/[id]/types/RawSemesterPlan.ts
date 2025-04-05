import { CourseBasicInfo } from "./Course";

export interface RawSemesterPlanData {
  _id: string;
  courses: CourseBasicInfo[];
  semester: number;
  year: number;
}
