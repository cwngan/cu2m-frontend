import { useEffect, useState } from "react";
import { CourseBasicInfo } from "../types/Course";
import DraggableBlock from "@/app/components/DraggableBlock";
import { getCourseColor } from "../utils";
import clsx from "clsx";

interface SearchResultBlockProps {
  res: CourseBasicInfo;
}
export default function SearchResultBlock({ res }: SearchResultBlockProps) {
  const [color, setColor] = useState<string>("bg-neutral-200");

  useEffect(() => {
    setColor(getCourseColor(res.code));
  }, [res.code]);
  return (
    <DraggableBlock
      blockType="COURSE"
      dragItem={{ semesterPlanId: null, course: res }}
      className={clsx("flex flex-col gap-1 p-3 leading-none", color)}
    >
      <div className="text-sm">
        {res.code} - {res.units} {res.units !== 1 ? "Units" : "Unit"}
      </div>
      <div>{res.title}</div>
    </DraggableBlock>
  );
}
