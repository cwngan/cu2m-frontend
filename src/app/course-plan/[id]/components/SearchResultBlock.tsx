import { useRef } from "react";
import { CourseBasicInfo } from "../types/Course";
import DraggableBlock from "@/app/components/DraggableBlock";
import clsx from "clsx";

interface SearchResultBlockProps {
  res: CourseBasicInfo;
}
export default function SearchResultBlock({ res }: SearchResultBlockProps) {
  return (
    <DraggableBlock
      blockType="COURSE"
      dragItem={{ semesterPlanId: null, course: res }}
      className={clsx("flex flex-col p-3 leading-none")}
    >
      <div className="text-sm">
        {res.code} - {res.units} {res.units !== 1 ? "Units" : "Unit"}
      </div>
      <div>{res.title}</div>
    </DraggableBlock>
  );
}
