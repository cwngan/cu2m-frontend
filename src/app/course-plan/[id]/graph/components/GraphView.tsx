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
import {
  useState,
  useCallback,
  useEffect,
  createContext,
  Dispatch,
  SetStateAction,
} from "react";
import GraphNode from "./GraphNode";
import { apiClient } from "@/apiClient";
import { buildEdges, craftGraphEdge, craftGraphNode } from "../utils";
import { CourseExtend } from "../types/CourseExtend";
import { CourseRead } from "@/app/types/Models";
import "@xyflow/react/dist/style.css";
import "@/app/globals.css";

const nodeTypes = { defaultNode: GraphNode };

export const FocusedNodesContext = createContext<{
  nodes: Set<string>;
  setNodes: Dispatch<SetStateAction<Set<string>>>;
}>({
  nodes: new Set<string>(),
  setNodes: () => {},
});

interface SemesterPlanGridProps {
  coursePlanId: string;
  coursePlanResponse: CoursePlanWithSemestersResponseModel;
}

export default function GraphView({
  coursePlanResponse,
}: SemesterPlanGridProps) {
  const [nodes, setNodes] = useState<Node<CourseExtend>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [focusedNodes, setFocusedNodes] = useState<Set<string>>(
    new Set<string>(),
  );

  useEffect(() => {
    if (!coursePlanResponse.data) {
      throw new Error("Course plan data not found");
    }

    const semesterPlans = coursePlanResponse.data.semester_plans;
    const courseCodes = semesterPlans
      .map((semesterPlan) => semesterPlan.courses)
      .flat();

    apiClient
      .get<CoursesResponseModel>("/api/courses", {
        params: {
          keywords: courseCodes,
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
        if (!detailedCourses) {
          throw new Error("Course fetch failed");
        }

        const courseMap = new Map<string, CourseRead>(
          detailedCourses.map((course) => [course.code!, course]),
        );

        const cacheIndex = new Map<string, number>();
        const newNodes = courseCodes
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
            if (!semesterPlan) {
              throw new Error(
                `Course code ${courseCode} not found in any semester plan`,
              );
            }
            return craftGraphNode(course, semesterPlan);
          });

        const { edges: newEdgeInfo, warnings: warningsMap } = buildEdges(
          newNodes.map((node) => node.data),
        );

        const nodesWithWarnings = newNodes.map((node) => {
          const warnings = warningsMap.get(node.id) || [];
          return { ...node, data: { ...node.data, warnings } };
        });

        const semesterGroups = new Map<string, Node<CourseExtend>[]>();
        nodesWithWarnings.forEach((node) => {
          const key = `${node.data.year}-${node.data.semester}`;
          const group = semesterGroups.get(key) || [];
          group.push(node);
          semesterGroups.set(key, group);
        });

        const sortedKeys = Array.from(semesterGroups.keys()).sort((a, b) => {
          const [yearA, semA] = a.split("-").map(Number);
          const [yearB, semB] = b.split("-").map(Number);
          return yearA !== yearB ? yearA - yearB : semA - semB;
        });

        const verticalSpacing = 100;
        const horizontalSpacing = 200;
        let currentX = 0;

        sortedKeys.forEach((key) => {
          const nodesInSemester = semesterGroups.get(key)!;
          nodesInSemester.forEach((node, index) => {
            node.position = { x: currentX, y: index * verticalSpacing };
          });
          currentX += horizontalSpacing;
        });

        setNodes(nodesWithWarnings);

        const newEdges = newEdgeInfo.map((edgeInfo) =>
          craftGraphEdge(edgeInfo),
        );
        setEdges(newEdges);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to fetch course data");
      });
  }, [coursePlanResponse]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) =>
      setNodes((nds) => applyNodeChanges(changes, nds) as Node<CourseExtend>[]),
    [],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  return (
    <FocusedNodesContext.Provider
      value={{ nodes: focusedNodes, setNodes: setFocusedNodes }}
    >
      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onPaneClick={() => {
            setFocusedNodes(new Set<string>());
          }}
          fitView
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </FocusedNodesContext.Provider>
  );
}
