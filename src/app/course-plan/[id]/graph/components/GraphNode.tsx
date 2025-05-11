import {
  getIncomers,
  Handle,
  Node,
  Position,
  useReactFlow,
} from "@xyflow/react";
import clsx from "clsx";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { getCourseColor } from "../../utils";
import { CourseExtend } from "../types/CourseExtend";
import { FocusedNodesContext } from "./GraphView";

type GraphNodeData = CourseExtend;
type GraphNode = Node<GraphNodeData>;

export default function GraphNode({
  data,
  id,
}: {
  data: GraphNodeData;
  id: string;
}) {
  const [color, setColor] = useState<string>("bg-neutral-200");
  const [course, setCourse] = useState<GraphNodeData>(data);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const reactFlowInstance = useReactFlow();
  const focusedNodes = useContext(FocusedNodesContext);
  const incomers = useRef<Node[]>([]);

  useEffect(() => {
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();
    incomers.current = getIncomers({ id }, nodes, edges);
  }, [id, reactFlowInstance]);

  useEffect(() => {
    if (!course.code) {
      throw new Error("Course code not found");
    }
    setColor(getCourseColor(course.code));
  }, [course.code]);

  useEffect(() => {
    setCourse(data);
  }, [data]);

  const handleMouseEnter = useCallback(() => {
    if (data.warnings && data.warnings.length > 0) {
      const node = reactFlowInstance.getNode(id);
      if (node) {
        // Convert flow coordinates to screen coordinates
        const { x, y } = reactFlowInstance.flowToScreenPosition({
          x: node.position.x + (node.width || 128) / 2, // Default width if not set
          y: node.position.y + (node.height || 64) / 2, // Default height if not set
        });
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        // Position tooltip to the right of the node with an offset
        const tooltipWidth = 200; // Approximate tooltip width (adjust as needed)
        let left = x + scrollX + 8; // 8px offset from node's right edge
        const top = y + scrollY; // Center vertically relative to node

        // Ensure tooltip stays within viewport
        if (left + tooltipWidth > window.innerWidth + scrollX) {
          left = x + scrollX - tooltipWidth - 8; // Move to left side if it overflows
        }

        setTooltipPosition({ top, left });
        setShowTooltip(true);
      }
    }
  }, [data.warnings, id, reactFlowInstance]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const getWarningMessage = useCallback((): string => {
    if (!data.warnings || data.warnings.length === 0) return "";
    return data.warnings
      .map((warning) => {
        switch (warning) {
          case "duplicate":
            return "Course is duplicated in another semester";
          case "prerequisite":
            return "Prerequisites are not satisfied";
          case "corequisite":
            return "Corequisites are not satisfied";
          case "not_for_taken":
            return "Cannot be taken with/after certain courses";
          default:
            return warning;
        }
      })
      .join("\n");
  }, [data.warnings]);

  useEffect(() => {
    if (focusedNodes.nodes.has(id)) {
      const shouldUpdate = incomers.current.some((node) => {
        return !focusedNodes.nodes.has(node.id);
      });
      if (shouldUpdate) {
        focusedNodes.setNodes((prev) => {
          return new Set([...prev, ...incomers.current.map((node) => node.id)]);
        });
      }
    }
  }, [focusedNodes, id]);

  return (
    <>
      <div
        onClick={() => {
          console.log("clicked node", id);
          focusedNodes.setNodes(new Set<string>([id]));
        }}
        className={clsx(
          "flex h-16 w-32 flex-col items-center justify-center rounded-xl p-2 ring-gray-800/50 transition-opacity duration-150 hover:ring-2",
          color,
          data.warnings && data.warnings.length > 0 && "ring-2 ring-red-500",
          focusedNodes.nodes.size === 0 || focusedNodes.nodes.has(id)
            ? "opacity-100"
            : "opacity-25",
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Handle type="target" position={Position.Left} />
        <div className="flex items-center gap-1">
          <span>{course.code}</span>
          {data.warnings && data.warnings.length > 0 && (
            <span className="warning-icon animate-pulse cursor-help font-bold text-red-500">
              !
            </span>
          )}
        </div>
        <div>
          {course.units} Unit{course.units !== 1 && "s"}
        </div>
        <Handle type="source" position={Position.Right} />
      </div>
      {showTooltip && data.warnings && data.warnings.length > 0 && (
        <div
          className="fixed z-50 rounded bg-gray-800 px-2 py-1 text-sm whitespace-pre-line text-white shadow-lg"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: "translate(0, -50%)", // Center vertically
          }}
        >
          {getWarningMessage()}
        </div>
      )}
    </>
  );
}
