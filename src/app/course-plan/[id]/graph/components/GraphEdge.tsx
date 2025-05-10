import { getBezierPath, type EdgeProps, type Edge } from "@xyflow/react";
import clsx from "clsx";

type GraphEdgeData = { fulfilled: boolean; conflict: boolean };
type GraphEdge = Edge<GraphEdgeData>;

export default function GraphEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
}: EdgeProps<GraphEdge>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  return (
    <g>
      <path
        id={id}
        markerEnd={markerEnd}
        className={clsx(
          data?.conflict
            ? "stroke-rose-500 stroke-4"
            : "stroke-zinc-400 stroke-2",
          "fill-none",
        )} // TailwindCSS classes
        d={edgePath}
      />
    </g>
  );
}
