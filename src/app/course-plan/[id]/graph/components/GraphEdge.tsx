import {
  getBezierPath,
  type EdgeProps,
  type Edge,
  Position,
} from "@xyflow/react";
import { useContext } from "react";
import { FocusedNodesContext } from "./GraphView";
import clsx from "clsx";
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
  source,
  target,
}: EdgeProps<GraphEdge>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
  });
  const focusedNodes = useContext(FocusedNodesContext);

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
        className={clsx(
          "transition-opacity duration-200",
          focusedNodes.nodes.size === 0 ||
            (focusedNodes.nodes.has(source) && focusedNodes.nodes.has(target))
            ? "opacity-100"
            : "opacity-10",
        )}
        d={edgePath}
      />
    </g>
  );
}
