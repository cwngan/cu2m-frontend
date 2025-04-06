import { Moment } from "moment";

export interface CoursePlan {
  _id: string;
  name: string;
  updated_at: Moment;
  description: string;
  favourite: boolean;
}
