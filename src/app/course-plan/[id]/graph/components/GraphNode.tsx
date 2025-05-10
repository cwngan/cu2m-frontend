import { Handle, Node, Position } from "@xyflow/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { getCourseColor } from "../../utils";
import { CourseExtend } from "../types/CourseExtend";

type GraphNodeData = CourseExtend;
type GraphNode = Node<GraphNodeData>;

export default function GraphNode({ data }: { data: GraphNodeData }) {
  const [color, setColor] = useState<string>("bg-neutral-200");
  const [course, setCourse] = useState<GraphNodeData>(data);

  useEffect(() => {
    if (course.code === null) {
      throw new Error("Course code not found");
    }
    setColor(getCourseColor(course.code));
  }, [course.code]);

  useEffect(() => {
    setCourse(data);
  }, [data]);

  return (
    <div
      className={clsx(
        "flex h-16 w-32 flex-col items-center justify-center rounded-xl p-2",
        color,
      )}
    >
      <Handle type="target" position={Position.Left} />
      <div>{course.code}</div>
      <div>
        {course.units} Unit{course.units != 1 && "s"}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
