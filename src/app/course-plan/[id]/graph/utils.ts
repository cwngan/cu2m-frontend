import { CourseRead, SemesterPlanRead } from "@/app/types/Models";
import { Node } from "@xyflow/react";
import { CourseExtend } from "./types/CourseExtend";
import { CourseEdgeInfo } from "./types/CourseEdgeInfo";
import { YearSemesterPair } from "./types/YearSemesterPair";
import { EvaluateMode, evaluteBooleanExpression } from "./parser";

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
): Node {
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

export function buildEdges(courses: CourseExtend[]): CourseEdgeInfo[] {
  const mapper: Map<number, CourseExtend[]> = new Map();
  courses.forEach((course) => {
    const key = pairToMagicNumber(course.year, course.semester);
    const courses = mapper.get(key) || [];
    courses.push(course);
    mapper.set(key, courses);
  });

  // Create a sorted keys array
  const keys = mapper
    .keys()
    .toArray()
    .sort((lhs: number, rhs: number) => lhs - rhs);

  let preconditions: Map<string, boolean> = new Map();
  const codeToNodeIdentifiers: Map<string, string[]> = new Map();
  let resultEdgeInfo: CourseEdgeInfo[] = [];
  for (const key of keys) {
    // Ensure the courses are here
    const courses = mapper.get(key);
    if (courses === undefined) {
      throw new Error(`Key ${key} not found in mapper`);
    }

    // Create a map for the courses
    const coursesMap = new Map<string, boolean>(
      courses.map((course) => {
        if (course.code === null) {
          throw new Error(`Course code ${course.code} not found`);
        }
        return [course.code, true];
      }),
    );

    // Build edge information for each course
    courses.forEach((course) => {
      resultEdgeInfo = resultEdgeInfo.concat(
        buildSubEdges(course, preconditions, coursesMap, codeToNodeIdentifiers),
      );
    });

    // Assign the new preconditions
    preconditions = new Map([...preconditions, ...coursesMap]);
    // Update node identifiers
    courses.forEach((course) => {
      if (course.code === null) {
        throw new Error(`Course code ${course.code} not found`);
      }
      const nodeIdentifier = craftNodeIdentifier(course);
      const nodeIdentifiers = codeToNodeIdentifiers.get(course.code) || [];
      nodeIdentifiers.push(nodeIdentifier);
      codeToNodeIdentifiers.set(course.code, nodeIdentifiers);
    });
  }
  return resultEdgeInfo;
}

function buildSubEdges(
  course: CourseExtend,
  preconditions: Map<string, boolean>,
  currentConditions: Map<string, boolean>,
  codeToNodeIdentifiers: Map<string, string[]>,
): CourseEdgeInfo[] {
  console.log(course, preconditions, currentConditions);
  if (!course.parsed) {
    // no parsed information, return empty edges
    return [];
  } else if (
    course.prerequisites === null ||
    course.corequisites === null ||
    course.not_for_taken === null
  ) {
    throw new Error(
      `Course ${course.code} has no prerequisites, corequisites or antirequisites`,
    );
  } else if (course.code === null) {
    throw new Error(`Course code ${course.code} is not parsable`);
  }

  const prerequisiteResult = evaluteBooleanExpression(
    course.prerequisites,
    preconditions,
    EvaluateMode.Pre,
  );
  const corequisiteResult = evaluteBooleanExpression(
    course.corequisites,
    currentConditions,
    EvaluateMode.Co,
  );
  const antirequisiteResult = evaluteBooleanExpression(
    course.not_for_taken,
    preconditions,
    EvaluateMode.Anti,
  );

  console.log(course.code, " prerequisite: ", prerequisiteResult);
  console.log(course.code, " antirequisite: ", antirequisiteResult);

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
          fulfilled,
          conflict: true,
        }));
      });

  const result = ([] as CourseEdgeInfo[]).concat(
    prerequisiteEdges,
    corequisiteEdges,
    antirequisiteEdges,
  );
  return result;
}
