import { getBezierPath, type EdgeProps, type Edge } from "@xyflow/react";
// import clsx from "clsx";

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
        style={{
          stroke: data?.conflict
            ? "#e11d48"
            : data?.fulfilled
              ? "#16a34a"
              : "#a1a1aa",
          strokeWidth: data?.conflict ? 4 : 2,
          fill: "none",
        }}
        d={edgePath}
      />
    </g>
  );
}
