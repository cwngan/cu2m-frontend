export interface PreUser {
  id: string;
  email: string;
  license_key_hash: string;
  activated_at: Date;
}

export interface User extends PreUser {
  first_name: string;
  last_login: Date;
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
  last_login: Date;
  last_name: string;
  major: string;
  username: string;
}

export interface UserUpdate {
  major?: string;
  password?: string;
  username?: string;
  last_login?: Date;
}

export interface Course {
  id: string;
  code: string;
  corequisites: string;
  description: string;
  is_graded: boolean;
  not_for_major: string;
  not_for_taken: string;
  prerequisites: string;
  title: string;
  units: string;
}

export interface SemesterPlan {
  id: string;
  course_plan_id: string;
  courses: string[];
  semester: number;
  year: number;
}

export interface CoursePlan {
  id: string;
  description: string;
  favourite: boolean;
  name: string;
  updated_at: Date;
  user_id: string;
}

export interface CoursePlanRead {
  id: string;
  description: string;
  favourite: boolean;
  name: string;
  updated_at: Date;
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
