import { useEffect, useState } from "react";
import { CourseBasicInfo } from "../types/Course";
import DraggableBlock from "@/app/components/DraggableBlock";
import { getCourseColor } from "../utils";
import clsx from "clsx";
import CourseDetailButton from "./CourseDetailButton";
import { Course, CourseRead } from "@/app/types/Models";
import { apiClient } from "@/apiClient";
import { CoursesResponseModel } from "@/app/types/ApiResponseModel";
import CourseDetailBlock from "./CourseDetailBlock";

interface SearchResultBlockProps {
  res: CourseRead;
}
export default function SearchResultBlock({ res }: SearchResultBlockProps) {
  const [color, setColor] = useState<string>("bg-neutral-200");

  const [showPopupDetail, setShowPopupDetail] = useState<boolean>(false);
  const [popupDetail, setPopupDetail] = useState<Course | null>(null);

  const handleCourseDetailFetch = () => {
    apiClient
      .get<CoursesResponseModel>(`/api/courses/?keywords=${res.code}`)
      .then((res) => {
        const response = res.data;
        if (response.status === "ERROR" || response.data === null) {
          throw new Error(response.error);
        }

        const detailCourse = response.data[0] as Course;
        setShowPopupDetail(true);
        setPopupDetail(detailCourse);
      })
      .catch((err) => {
        console.log(err);
        alert("Course detail fetch failed");
      });
  };

  const onClose = () => {
    setShowPopupDetail(false);
  };

  useEffect(() => {
    if (res.code !== null) {
      setColor(getCourseColor(res.code));
    } else {
      throw new Error("Course code is null");
    }
  }, [res.code]);
  return (
    <>
      <DraggableBlock
        blockType="COURSE"
        dragItem={{ semesterPlanId: null, course: res }}
        className={clsx(
          "group relative flex cursor-pointer flex-col gap-1 p-3 leading-none",
          color,
        )}
      >
        <div className="group relative flex flex-row justify-between">
          <div className="text-sm">
            {res.code} - {res.units} {res.units !== 1 ? "Units" : "Unit"}
          </div>
          <CourseDetailButton
            className="group relative opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleCourseDetailFetch}
          ></CourseDetailButton>
        </div>
        <div>{res.title}</div>
      </DraggableBlock>
      <CourseDetailBlock
        course={popupDetail}
        isOpen={showPopupDetail}
        onClose={onClose}
      ></CourseDetailBlock>
    </>
  );
}
