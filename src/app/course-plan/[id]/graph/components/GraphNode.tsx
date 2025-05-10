import { CourseRead } from "@/app/types/Models";
import { Handle, Node, Position } from "@xyflow/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { getCourseColor } from "../../utils";

type GraphNodeData = CourseRead & Record<string, unknown>;
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
  }, [course]);

  return (
    <div className={clsx("flex flex-col h-16 w-32 rounded-xl items-center justify-center p-2", color)}>
      <Handle type="target" position={Position.Left} />
      <div>{course.code}</div>
      <div>
        {course.units} Unit{course.units != 1 && "s"}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
