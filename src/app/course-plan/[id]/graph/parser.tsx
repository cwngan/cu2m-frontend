export enum EvaluateMode {
  Pre = 1,
  Co,
  Anti,
}

export interface ParseResult {
  verdict: boolean;
  relations: string[];
}

export function toPostfixExpression(tokens: string[]): string[] {
  const resultTokens: string[] = [];
  const operatorStack: string[] = [];
  const precedence = (operator: string): number => {
    switch (operator) {
      case "or":
        return 1;
      case "and":
        return 2;
      case "(":
      case "[":
      case "{":
        return 0;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  };

  for (const token of tokens) {
    if (token === "") {
      continue;
    }
    if (token === "or" || token === "and") {
      while (
        operatorStack.length &&
        precedence(operatorStack[operatorStack.length - 1]) >= precedence(token)
      ) {
        resultTokens.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    } else if (token === "(" || token === "[" || token === "{") {
      operatorStack.push(token);
    } else if (token === ")" || token === "]" || token === "}") {
      while (
        operatorStack.length &&
        operatorStack[operatorStack.length - 1] !== "(" &&
        operatorStack[operatorStack.length - 1] !== "[" &&
        operatorStack[operatorStack.length - 1] !== "{"
      ) {
        resultTokens.push(operatorStack.pop()!);
      }
      operatorStack.pop();
    } else {
      resultTokens.push(token);
    }
  }

  while (operatorStack.length) {
    resultTokens.push(operatorStack.pop()!);
  }

  return resultTokens;
}

export function evaluteBooleanExpression(
  expression: string,
  variables: Map<string, boolean>,
  mode: EvaluateMode,
): ParseResult {
  if (expression === "") {
    // if it is parsing a corequisite, it fails because there is nothing to support
    // else it passes the test
    return { verdict: mode === EvaluateMode.Co ? false : true, relations: [] };
  }

  const tokens = toPostfixExpression(
    expression.split(/(or|and|\(|\[|\{|\)|\]|\})/).map((token) => token.trim()),
  );

  const stack: boolean[] = [];
  for (const token of tokens) {
    switch (token) {
      case "or":
      case "and":
        if (stack.length < 2) {
          throw new Error(
            "Invalid expression: or operator without enough value",
          );
        } else {
          // Guarded by length check
          const rightValue = stack.pop()!;
          const leftValue = stack.pop()!;
          stack.push(
            token === "or" ? leftValue || rightValue : leftValue && rightValue,
          );
        }
        break;
      default:
        stack.push(variables.get(token) ?? false);
        break;
    }
  }

  // Final checking
  if (stack.length !== 1) {
    console.log("Invalid expression:", expression);
    console.log("Postfix tokens:", tokens);
    console.log("Stack state:", stack);
    throw new Error("Invalid boolean expression");
  }
  return {
    verdict: mode === EvaluateMode.Anti ? !stack[0] : stack[0],
    relations: tokens.filter((course) => variables.get(course) !== undefined),
  };
}
