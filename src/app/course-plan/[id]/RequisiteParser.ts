export type ASTNode =
  | { type: "course"; code: string }
  | { type: "and"; left: ASTNode; right: ASTNode }
  | { type: "or"; left: ASTNode; right: ASTNode };

// Parse prerequisite string into an AST
export function parsePrerequisite(prereq: string): ASTNode {
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
export function evaluatePrerequisite(
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
