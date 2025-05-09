import { CourseBasicInfo } from "../types/Course";
import clsx from "clsx";
import { useState } from "react";
import { useEffect } from "react";
import DraggableBlock from "@/app/components/DraggableBlock";
import { getCourseColor } from "../utils";

interface CourseBlockProps {
  semesterPlanId: string;
  course: CourseBasicInfo;
}

export default function CourseBlock({
  semesterPlanId,
  course,
}: CourseBlockProps) {
  //set the color of course block base on number of semester
  const [color, setColor] = useState<string>("bg-neutral-200");

  useEffect(() => {
    setColor(getCourseColor(course.code));
  }, [course.code]);

  return (
    <DraggableBlock
      blockType="COURSE"
      dragItem={{
        semesterPlanId: semesterPlanId,
        course: course,
        setIsDragging: null,
      }}
      className={clsx("flex flex-col items-center justify-center p-2", color)}
      setIsDragging={null}
    >
      <div>{course.code}</div>
      <div>
        {course.units} Unit{course.units != 1 && "s"}
      </div>
    </DraggableBlock>
  );
}
