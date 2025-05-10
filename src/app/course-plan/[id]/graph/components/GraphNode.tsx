import { Handle, Node, Position } from "@xyflow/react";

const handleStyle = { left: 10 };

type GraphNodeData = { label: string };
type GraphNode = Node<GraphNodeData, "label">;

export default function GraphNode({ data }: { data: GraphNodeData }) {
  return (
    <div className="flex h-16 w-32 rounded-xl bg-white p-2">
      <Handle type="target" position={Position.Left} />
      <div className="text-2xl">{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
