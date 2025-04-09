import { UserRead } from "./Models";

export interface ApiResponseModel {
  status: "OK" | "ERROR";
  error?: string;
}

export interface UserResponseModel extends ApiResponseModel {
  data: UserRead;
}
