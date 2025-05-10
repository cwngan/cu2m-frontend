import { CourseRead } from "@/app/types/Models";
import { Node } from "@xyflow/react";

export function craftGraphNode(course: CourseRead): Node {
  return {
    id: course._id,
    data: {...course},
    type: "defaultNode",
    position: { x: 0, y: 0 },
  };
}
