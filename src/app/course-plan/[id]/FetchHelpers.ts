import { apiClient } from "@/apiClient";
import {
  CoursesResponseModel,
  CoursePlanWithSemestersResponseModel,
} from "@/app/types/ApiResponseModel";
import {
  CourseRead,
  SemesterPlan,
  SemesterPlanReadWithCourseDetails,
} from "@/app/types/Models";

export async function fetchCourseDetails(
  courseCodes: string[],
): Promise<CourseRead[]> {
  try {
    if (!courseCodes || courseCodes.length === 0) {
      return [];
    }
    console.log("Fetching details for course codes:", courseCodes);
    const response = await apiClient.get<CoursesResponseModel>(
      "/api/courses/",
      {
        params: {
          keywords: courseCodes,
          strict: true,
        },
      },
    );
    console.log("API Response:", response.data);
    if (response.status === 200 && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching course details:", error);
    return [];
  }
}

export async function fetchSemesterPlans(
  coursePlanId: string,
): Promise<SemesterPlan[]> {
  try {
    const response = await apiClient.get<CoursePlanWithSemestersResponseModel>(
      `/api/course-plans/${coursePlanId}`,
    );
    if (response.status === 200) {
      return response.data.data!.semester_plans;
    } else {
      throw new Error("Failed to fetch semester plans");
    }
  } catch (error) {
    throw new Error("Failed to fetch semester plans: " + error);
  }
}

export async function fetchDetailedSemesterPlans(
  semesterPlans: SemesterPlan[],
): Promise<SemesterPlanReadWithCourseDetails[]> {
  try {
    const detailedPlans = await Promise.all(
      semesterPlans.map(async (plan) => {
        const courseDetails = await fetchCourseDetails(plan.courses);
        return {
          ...plan,
          courses: courseDetails,
        };
      }),
    );
    return detailedPlans;
  } catch (error) {
    throw new Error("Error fetching detailed semester plans: " + error);
  }
}
