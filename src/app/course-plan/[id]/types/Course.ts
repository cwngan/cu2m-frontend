export interface CourseBasicInfo {
  _id: string;
  title: string;
  code: string;
  units: number;
}

export type CourseFullInfo = CourseBasicInfo & {
  description: string;
  prerequisites: string;
  corequisites: string;
  is_graded: boolean;
  not_for_major: string;
  not_for_taken: string;
};
