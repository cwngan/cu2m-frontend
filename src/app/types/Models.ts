import { Moment } from "moment";

export interface PreUser {
  _id: string;
  email: string;
  license_key_hash: string;
  activated_at: Moment;
}

export interface User extends PreUser {
  first_name: string;
  last_login: Moment;
  last_name: string;
  major: string;
  password_hash: string;
  username: string;
}

export interface UserCreate {
  email: string;
  first_name: string;
  last_name: string;
  major: string;
  password: string;
  username: string;
  license_key: string;
}

export interface UserRead {
  _id: string;
  email: string;
  first_name: string;
  last_login: Moment;
  last_name: string;
  major: string;
  username: string;
}

export interface UserUpMoment {
  major?: string;
  password?: string;
  username?: string;
  last_login?: Moment;
}

export interface Course {
  _id: string;
  code: string;
  corequisites: string;
  description: string;
  is_graded: boolean;
  not_for_major: string;
  not_for_taken: string;
  prerequisites: string;
  title: string;
  units: number;
}

export interface CourseRead {
  _id: string;
  code: string | null;
  corequisites: string | null;
  description: string | null;
  is_graded: boolean | null;
  not_for_major: string | null;
  not_for_taken: string | null;
  prerequisites: string | null;
  title: string | null;
  units: number | null;
}

export interface SemesterPlan {
  _id: string;
  course_plan_id: string;
  courses: string[];
  semester: number;
  year: number;
}

export interface CoursePlan {
  _id: string;
  description: string;
  favourite: boolean;
  name: string;
  updated_at: Moment;
  user_id: string;
}

export interface RawCoursePlan {
  _id: string;
  description: string;
  favourite: boolean;
  name: string;
  updated_at: string;
  user_id: string;
}

export interface CoursePlanRead {
  _id: string;
  description: string;
  favourite: boolean;
  name: string;
  updated_at: Moment;
  user_id: string;
}

export interface CoursePlanCreate {
  description: string;
  name: string;
}

export interface CoursePlanUpdate {
  description?: string;
  favourite?: boolean;
  name?: string;
}
