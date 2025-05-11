"use client";
import {
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
import GraphNode from "./GraphNode";
import { apiClient } from "@/apiClient";
import { buildEdges, craftGraphNode } from "../utils";
import { CourseExtend } from "../types/CourseExtend";
import { CourseRead } from "@/app/types/Models";
import GraphEdge from "./GraphEdge";
import "@xyflow/react/dist/style.css";
import "@/app/globals.css";

const nodeTypes = { defaultNode: GraphNode };
const edgeTypes = { defaultEdge: GraphEdge };

interface SemesterPlanGridProps {
  coursePlanId: string;
  coursePlanResponse: CoursePlanWithSemestersResponseModel;
}
export default function GraphView({
  coursePlanResponse,
}: SemesterPlanGridProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

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
            "parsed",
            "corequisites",
            "prerequisites",
            "not_for_taken",
          ],
          strict: true,
        },
      })
      .then((response) => {
        const detailedCourses = response.data.data;
        if (detailedCourses === null) {
          throw new Error("Course fetch failed");
        }
  
        const courseMap = new Map<string, CourseRead>(
          detailedCourses.map((course) => [course.code!, course]),
        );
  
        const cacheIndex = new Map<string, number>();
        const newNodes = courses
          .filter((courseCode) => courseMap.get(courseCode) !== undefined)
          .map((courseCode) => {
            const course = courseMap.get(courseCode)!;
            const semesterPlanIndex = semesterPlans.findIndex(
              (semesterPlan, index) =>
                semesterPlan.courses.includes(courseCode ?? "") &&
                (cacheIndex.get(courseCode) ?? -1) < index,
            );
            cacheIndex.set(courseCode, semesterPlanIndex);
            const semesterPlan = semesterPlans[semesterPlanIndex];
            if (semesterPlan === undefined) {
              throw new Error(
                `Fail to craft node with course code ${courseCode} because it was not found`,
              );
            }
            return craftGraphNode(course, semesterPlan);
          });
  
        // Group nodes by semester
        const semesterGroups = new Map<string, Node[]>();
        newNodes.forEach((node) => {
          const key = `${node.data.year}-${node.data.semester}`;
          const group = semesterGroups.get(key) || [];
          group.push(node);
          semesterGroups.set(key, group);
        });
  
        // Sort semester keys
        const sortedKeys = Array.from(semesterGroups.keys()).sort((a, b) => {
          const [yearA, semA] = a.split('-').map(Number);
          const [yearB, semB] = b.split('-').map(Number);
          if (yearA !== yearB) return yearA - yearB;
          return semA - semB;
        });
  
        // Assign positions
        const verticalSpacing = 100; // Adjust as needed
        const horizontalSpacing = 150; // Adjust as needed
        let currentY = 0;
  
        sortedKeys.forEach((key) => {
          const nodesInSemester = semesterGroups.get(key)!;
          nodesInSemester.forEach((node, index) => {
            node.position = {
              x: index * horizontalSpacing,
              y: currentY,
            };
          });
          currentY += verticalSpacing;
        });
  
        setNodes(newNodes);
  
        const newEdgeInfo = buildEdges(
          newNodes.map((node) => node.data as CourseExtend),
        );
  
        const newEdges = newEdgeInfo.map((edgeInfo) => {
          const { source, target, fulfilled, conflict } = edgeInfo;
          const edge: Edge = {
            id: `${source}-${target}`,
            source,
            target,
            type: "defaultEdge",
            animated: conflict,
            data: { fulfilled, conflict },
          };
          return edge;
        });
        setEdges(newEdges);
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
        edgeTypes={edgeTypes}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
