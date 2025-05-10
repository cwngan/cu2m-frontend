"use client";
import { CoursePlanResponseModel } from "@/app/types/ApiResponseModel";
import {
  ReactFlow,
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  OnNodesChange,
  OnEdgesChange,
  Edge,
  Node,
} from "@xyflow/react";
import { useState, useCallback } from "react";
import "@xyflow/react/dist/style.css";
import GraphNode from "./GraphNode";

const initialEdges: Edge[] = [{ id: "1-2", source: "1", target: "2", animated: true }];

const initialNodes: Node[] = [
  {
    id: "1",
    data: { label: "Hello" },
    type: "defaultNode",
    position: { x: 0, y: 0 },
  },
  {
    id: "2",
    data: { label: "Test" },
    type: "defaultNode",
    position: { x: 100, y: 100 },
  },
];

const nodeTypes = { defaultNode: GraphNode };

interface SemesterPlanGridProps {
  coursePlanId: string;
  coursePlanResponse: CoursePlanResponseModel;
}
export default function GraphView({
  coursePlanResponse,
}: SemesterPlanGridProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        fitView
        nodeTypes={nodeTypes}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
