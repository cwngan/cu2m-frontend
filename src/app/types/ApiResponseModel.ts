import {
  CoursePlanRead,
  CoursePlanWithSemestersData,
  CourseRead,
  SemesterPlanRead,
  UserRead,
} from "./Models";

export interface ApiResponseModel {
  status: "OK" | "ERROR";
  error?: string;
}

export interface UserResponseModel extends ApiResponseModel {
  data: UserRead | null;
}

export interface CoursePlanResponseModel extends ApiResponseModel {
  data: CoursePlanRead[] | null;
}

export interface CoursesResponseModel extends ApiResponseModel {
  data: CourseRead[] | null;
}

export interface CoursePlanWithSemestersResponseModel extends ApiResponseModel {
  data: CoursePlanWithSemestersData | null;
}

export interface SemesterPlanResponseModel extends ApiResponseModel {
  data: SemesterPlanRead | null;
}
