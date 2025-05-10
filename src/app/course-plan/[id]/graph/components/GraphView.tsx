"use client";
import {
  CoursePlanResponseModel,
  CoursePlanWithSemestersResponseModel,
  CoursesResponseModel,
} from "@/app/types/ApiResponseModel";
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
import { useState, useCallback, useEffect } from "react";
import "@xyflow/react/dist/style.css";
import GraphNode from "./GraphNode";
import { apiClient } from "@/apiClient";
import { craftGraphNode } from "../utils";

const initialEdges: Edge[] = [
  { id: "1-2", source: "1", target: "2", animated: true },
];

const nodeTypes = { defaultNode: GraphNode };

interface SemesterPlanGridProps {
  coursePlanId: string;
  coursePlanResponse: CoursePlanWithSemestersResponseModel;
}
export default function GraphView({
  coursePlanResponse,
}: SemesterPlanGridProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  useEffect(() => {
    if (coursePlanResponse.data === null) {
      throw new Error("Course plan data not found");
    }

    const semesterPlans = coursePlanResponse.data.semester_plans;
    const courses = semesterPlans
      .map((semesterPlan) => semesterPlan.courses)
      .flat();

    apiClient
      .get<CoursesResponseModel>("/api/courses", {
        params: {
          keywords: courses,
          includes: [
            "code",
            "title",
            "units",
            "corequisites",
            "prerequisites",
            "not_for_taken",
          ],
        },
      })
      .then((response) => {
        const detailedCourses = response.data.data;
        if (detailedCourses === null) {
          throw new Error("Course fetch failed");
        }
        setNodes(detailedCourses.map((course) => craftGraphNode(course)));
        console.log(detailedCourses);
      })
      .catch((err) => {
        console.error(err);
        alert(err);
      });
  }, [coursePlanResponse]);

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
