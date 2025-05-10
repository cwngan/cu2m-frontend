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
  MarkerType,
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

        // Course code guarantees to return non-null values
        const courseMap = new Map<string, CourseRead>(
          detailedCourses.map((course) => [course.code!, course]),
        );

        // Caches the last occurance of the course code in semester plans
        const cacheIndex = new Map<string, number>();

        // Filters out courses that are not in the course list
        const newNodes = courses
          .filter((courseCode) => courseMap.get(courseCode) !== undefined)
          .map((courseCode) => {
            // Variable course is guaranteed to be defined because of the filter
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
        setNodes(newNodes);

        const newEdgeInfo = buildEdges(
          newNodes.map((node) => node.data as CourseExtend),
        ); // node.data is guaranteed to be CourseExtend from craftGraphNode

        const newEdges = newEdgeInfo.map((edgeInfo) => {
          const { source, target, fulfilled, conflict } = edgeInfo;
          const edge: Edge = {
            id: `${source}-${target}`,
            source,
            target,
            type: "defaultEdge",
            animated: conflict,
            // markerEnd: {
            //   type: MarkerType.Arrow,
            // },
            data: { fulfilled, conflict },
          };
          return edge;
        });
        console.log(newEdges);
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
