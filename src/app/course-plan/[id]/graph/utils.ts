import { CourseRead, SemesterPlanRead } from "@/app/types/Models";
import { Edge, MarkerType, Node } from "@xyflow/react";
import { CourseExtend } from "./types/CourseExtend";
import { CourseEdgeInfo } from "./types/CourseEdgeInfo";
import { YearSemesterPair } from "./types/YearSemesterPair";
import { EvaluateMode, evaluteBooleanExpression, ParseResult } from "./parser";
// import { getCourseColor } from "../utils";

export function pairToMagicNumber(year: number, semester: number): number {
  return (year << 2) + semester;
}

export function magicNumberToPair(magicNumber: number): YearSemesterPair {
  return { year: magicNumber >> 2, semester: magicNumber & 3 };
}

export function craftNodeIdentifier(course: CourseExtend): string {
  return course.code! + "-" + course.year + "-" + course.semester;
}

export function craftGraphNode(
  course: CourseRead,
  semesterPlan: SemesterPlanRead,
): Node<CourseExtend> {
  const courseExtend: CourseExtend = {
    ...course,
    year: semesterPlan.year,
    semester: semesterPlan.semester,
  };
  return {
    id: craftNodeIdentifier(courseExtend),
    data: courseExtend,
    type: "defaultNode",
    position: { x: 0, y: 0 },
  };
}

export function craftGraphEdge(edgeInfo: CourseEdgeInfo): Edge {
  const { source, target, fulfilled, conflict } = edgeInfo;
  const color = conflict ? "#e11d48" : fulfilled ? "#16a34a" : "#a1a1aa";
  const edge: Edge = {
    id: `${source}-${target}`,
    source,
    target,
    type: "defaultEdge",
    animated: conflict,
    data: { fulfilled, conflict },
    markerEnd: { type: MarkerType.Arrow, strokeWidth: 2, color },
    style: {
      stroke: color,
      strokeWidth: conflict ? 4 : 2,
      fill: "none",
    },
  };
  return edge;
}
// Parse prerequisite string into an AST
type ASTNode =
  | { type: "course"; code: string }
  | { type: "and"; left: ASTNode; right: ASTNode }
  | { type: "or"; left: ASTNode; right: ASTNode };

function parsePrerequisite(prereq: string): ASTNode {
  const tokens = prereq
    .trim()
    .split(/\s+/)
    .filter((token) => token !== "");
  let index = 0;

  function parseExpression(): ASTNode {
    let left = parseTerm();
    while (index < tokens.length && tokens[index] === "or") {
      index++;
      const right = parseTerm();
      left = { type: "or", left, right };
    }
    return left;
  }

  function parseTerm(): ASTNode {
    let left = parseFactor();
    while (index < tokens.length && tokens[index] === "and") {
      index++;
      const right = parseFactor();
      left = { type: "and", left, right };
    }
    return left;
  }

  function parseFactor(): ASTNode {
    if (index >= tokens.length) {
      throw new Error("Unexpected end of prerequisite string");
    }
    const token = tokens[index];
    if (token === "(") {
      index++;
      const expr = parseExpression();
      if (index >= tokens.length || tokens[index] !== ")") {
        throw new Error("Mismatched parentheses");
      }
      index++;
      return expr;
    } else {
      index++;
      return { type: "course", code: token };
    }
  }

  const result = parseExpression();
  if (index < tokens.length) {
    throw new Error("Extra tokens after parsing");
  }
  return result;
}

// Evaluate the AST against taken courses
function evaluatePrerequisite(
  node: ASTNode,
  takenCourses: Set<string>,
): boolean {
  switch (node.type) {
    case "course":
      return takenCourses.has(node.code);
    case "and":
      return (
        evaluatePrerequisite(node.left, takenCourses) &&
        evaluatePrerequisite(node.right, takenCourses)
      );
    case "or":
      return (
        evaluatePrerequisite(node.left, takenCourses) ||
        evaluatePrerequisite(node.right, takenCourses)
      );
    default:
      return false;
  }
}

export function computeCourseWarnings(
  course: CourseExtend,
  allCourses: CourseExtend[],
  preconditions: Set<string>,
  currentSemesterCourses: Set<string>,
): string[] {
  const warnings: string[] = [];

  // Check for duplicates
  const courseInstances = allCourses.filter(
    (c) =>
      c.code === course.code &&
      (c.year !== course.year || c.semester !== course.semester),
  );
  if (courseInstances.length > 0) {
    warnings.push("duplicate");
  }

  // Check prerequisites
  if (course.prerequisites) {
    try {
      const ast = parsePrerequisite(course.prerequisites);
      const isSatisfied = evaluatePrerequisite(ast, preconditions);
      if (!isSatisfied) {
        warnings.push("prerequisite");
      }
    } catch (error) {
      console.error("Error parsing prerequisite:", error);
      warnings.push("prerequisite");
    }
  }

  // Check corequisites
  if (course.corequisites) {
    try {
      const ast = parsePrerequisite(course.corequisites);
      const availableCourses = new Set([
        ...preconditions,
        ...currentSemesterCourses,
      ]);
      const isSatisfied = evaluatePrerequisite(ast, availableCourses);
      if (!isSatisfied) {
        warnings.push("corequisite");
      }
    } catch (error) {
      console.error("Error parsing corequisite:", error);
      warnings.push("corequisite");
    }
  }

  // Check anti-requisites (not_for_taken)
  const notForTakenCourses =
    course.not_for_taken?.split(" or ").map((code) => code.trim()) || [];
  const notForTakenPrevious = notForTakenCourses.filter((code) =>
    preconditions.has(code),
  );
  if (notForTakenPrevious.length > 0) {
    warnings.push("not_for_taken");
  }

  return warnings;
}

export function buildEdges(courses: CourseExtend[]): {
  edges: CourseEdgeInfo[];
  warnings: Map<string, string[]>;
} {
  const mapper: Map<number, CourseExtend[]> = new Map();
  courses.forEach((course) => {
    const key = pairToMagicNumber(course.year, course.semester);
    const coursesInSemester = mapper.get(key) || [];
    coursesInSemester.push(course);
    mapper.set(key, coursesInSemester);
  });

  const keys = Array.from(mapper.keys()).sort(
    (lhs: number, rhs: number) => lhs - rhs,
  );
  let preconditions: Map<string, boolean> = new Map();
  const codeToNodeIdentifiers: Map<string, string[]> = new Map();
  let resultEdgeInfo: CourseEdgeInfo[] = [];
  const warningsMap: Map<string, string[]> = new Map();

  for (const key of keys) {
    const coursesInSemester = mapper.get(key);
    if (!coursesInSemester) {
      throw new Error(`Key ${key} not found in mapper`);
    }

    const currentConditions = new Map<string, boolean>(
      coursesInSemester.map((course) => {
        if (!course.code) throw new Error(`Course code is null`);
        return [course.code, true];
      }),
    );
    const currentSemesterCourses = new Set(
      coursesInSemester.map((c) => c.code!).filter(Boolean),
    );

    for (const course of coursesInSemester) {
      if (!course.code) throw new Error(`Course code is null`);
      const nodeIdentifier = craftNodeIdentifier(course);
      const nodeIdentifiers = codeToNodeIdentifiers.get(course.code) || [];
      nodeIdentifiers.push(nodeIdentifier);
      codeToNodeIdentifiers.set(course.code, nodeIdentifiers);
    }

    coursesInSemester.forEach((course) => {
      const subEdges = buildSubEdges(
        course,
        preconditions,
        currentConditions,
        codeToNodeIdentifiers,
      );
      resultEdgeInfo = resultEdgeInfo.concat(subEdges);

      const nodeId = craftNodeIdentifier(course);
      const preconditionsSet = new Set(preconditions.keys());
      const warnings = computeCourseWarnings(
        course,
        courses,
        preconditionsSet,
        currentSemesterCourses,
      );
      warningsMap.set(nodeId, warnings);
    });

    preconditions = new Map([...preconditions, ...currentConditions]);
  }

  return { edges: resultEdgeInfo, warnings: warningsMap };
}

function buildSubEdges(
  course: CourseExtend,
  preconditions: Map<string, boolean>,
  currentConditions: Map<string, boolean>,
  codeToNodeIdentifiers: Map<string, string[]>,
): CourseEdgeInfo[] {
  if (!course.code) {
    return [];
  }

  const prerequisiteResult: ParseResult = course.prerequisites
    ? evaluteBooleanExpression(
        course.prerequisites,
        preconditions,
        EvaluateMode.Pre,
      )
    : { verdict: true, relations: [] };

  const corequisiteResult: ParseResult = course.corequisites
    ? evaluteBooleanExpression(
        course.corequisites,
        new Map([...currentConditions, ...preconditions]),
        EvaluateMode.Co,
      )
    : { verdict: true, relations: [] };

  const antirequisiteResult: ParseResult = course.not_for_taken
    ? evaluteBooleanExpression(
        course.not_for_taken,
        preconditions,
        EvaluateMode.Anti,
      )
    : { verdict: true, relations: [] };

  const fulfilled =
    (prerequisiteResult.verdict || corequisiteResult.verdict) &&
    antirequisiteResult.verdict;
  const selfNodeIdentifier = craftNodeIdentifier(course);

  const prerequisiteEdges: CourseEdgeInfo[] =
    prerequisiteResult.relations.flatMap((relation) => {
      const nodeIdentifiers = codeToNodeIdentifiers.get(relation) || [];
      return nodeIdentifiers.map((nodeIdentifier) => ({
        source: nodeIdentifier,
        target: selfNodeIdentifier,
        fulfilled,
        conflict: false,
      }));
    });

  const corequisiteEdges: CourseEdgeInfo[] =
    corequisiteResult.relations.flatMap((relation) => {
      const nodeIdentifiers = codeToNodeIdentifiers.get(relation) || [];
      return nodeIdentifiers.map((nodeIdentifier) => ({
        source: nodeIdentifier,
        target: selfNodeIdentifier,
        fulfilled,
        conflict: false,
      }));
    });

  const antirequisiteEdges: CourseEdgeInfo[] = antirequisiteResult.verdict
    ? []
    : antirequisiteResult.relations.flatMap((relation) => {
        const nodeIdentifiers = codeToNodeIdentifiers.get(relation) || [];
        return nodeIdentifiers.map((nodeIdentifier) => ({
          source: nodeIdentifier,
          target: selfNodeIdentifier,
          fulfilled: false,
          conflict: true,
        }));
      });

  return [...prerequisiteEdges, ...corequisiteEdges, ...antirequisiteEdges];
}
