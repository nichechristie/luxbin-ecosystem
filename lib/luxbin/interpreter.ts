import {
  Program,
  Statement,
  Expression,
  FunctionDeclaration,
} from "./types";
import { createBuiltins } from "./builtins";

// ── Runtime Values ──────────────────────────────────────────

export type LuxValue = number | string | boolean | null | LuxValue[] | LuxFunction | BuiltinFunction;

export interface LuxFunction {
  __type: "function";
  declaration: FunctionDeclaration;
  closure: Environment;
}

export interface BuiltinFunction {
  __type: "builtin";
  name: string;
  fn: (args: LuxValue[], env: Environment) => LuxValue;
}

// ── Control Flow Signals ────────────────────────────────────

class ReturnSignal {
  value: LuxValue;
  constructor(value: LuxValue) {
    this.value = value;
  }
}

class BreakSignal {}
class ContinueSignal {}

class StepLimitError extends Error {
  constructor() {
    super("Execution limit exceeded (100,000 steps). Possible infinite loop.");
    this.name = "StepLimitError";
  }
}

// ── Environment (Scope Chain) ───────────────────────────────

export class Environment {
  private vars: Map<string, { value: LuxValue; constant: boolean }> = new Map();
  private parent: Environment | null;

  constructor(parent: Environment | null = null) {
    this.parent = parent;
  }

  define(name: string, value: LuxValue, constant = false) {
    this.vars.set(name, { value, constant });
  }

  get(name: string): LuxValue {
    const entry = this.vars.get(name);
    if (entry !== undefined) return entry.value;
    if (this.parent) return this.parent.get(name);
    throw new Error(`Undefined variable: '${name}'`);
  }

  set(name: string, value: LuxValue) {
    const entry = this.vars.get(name);
    if (entry !== undefined) {
      if (entry.constant) throw new Error(`Cannot reassign constant: '${name}'`);
      entry.value = value;
      return;
    }
    if (this.parent) {
      this.parent.set(name, value);
      return;
    }
    throw new Error(`Undefined variable: '${name}'`);
  }

  has(name: string): boolean {
    if (this.vars.has(name)) return true;
    if (this.parent) return this.parent.has(name);
    return false;
  }
}

// ── Interpreter ─────────────────────────────────────────────

export interface InterpreterResult {
  output: string[];
  steps: number;
  error: string | null;
}

const STEP_LIMIT = 100_000;

export function interpret(program: Program): InterpreterResult {
  const output: string[] = [];
  let steps = 0;

  function step() {
    steps++;
    if (steps > STEP_LIMIT) throw new StepLimitError();
  }

  // Create global environment with builtins
  const globalEnv = new Environment();
  const builtins = createBuiltins(output);
  for (const [name, fn] of Object.entries(builtins)) {
    globalEnv.define(name, {
      __type: "builtin",
      name,
      fn,
    } as BuiltinFunction, true);
  }

  function executeBlock(statements: Statement[], env: Environment): ReturnSignal | BreakSignal | ContinueSignal | void {
    for (const stmt of statements) {
      const result = executeStatement(stmt, env);
      if (result instanceof ReturnSignal || result instanceof BreakSignal || result instanceof ContinueSignal) {
        return result;
      }
    }
  }

  function executeStatement(stmt: Statement, env: Environment): ReturnSignal | BreakSignal | ContinueSignal | void {
    step();
    switch (stmt.type) {
      case "LetDeclaration": {
        const value = stmt.value ? evaluateExpression(stmt.value, env) : null;
        env.define(stmt.name, value, false);
        return;
      }
      case "ConstDeclaration": {
        const value = evaluateExpression(stmt.value, env);
        env.define(stmt.name, value, true);
        return;
      }
      case "Assignment": {
        const value = evaluateExpression(stmt.value, env);
        env.set(stmt.name, value);
        return;
      }
      case "IndexAssignment": {
        const arr = env.get(stmt.name);
        if (!Array.isArray(arr)) throw new Error(`'${stmt.name}' is not an array`);
        const index = evaluateExpression(stmt.index, env);
        if (typeof index !== "number") throw new Error("Array index must be a number");
        const idx = Math.floor(index);
        if (idx < 0 || idx >= arr.length) throw new Error(`Index ${idx} out of bounds (length ${arr.length})`);
        arr[idx] = evaluateExpression(stmt.value, env);
        return;
      }
      case "ExpressionStatement": {
        evaluateExpression(stmt.expression, env);
        return;
      }
      case "FunctionDeclaration": {
        const func: LuxFunction = {
          __type: "function",
          declaration: stmt,
          closure: env,
        };
        env.define(stmt.name, func, true);
        return;
      }
      case "ReturnStatement": {
        const value = stmt.value ? evaluateExpression(stmt.value, env) : null;
        return new ReturnSignal(value);
      }
      case "BreakStatement":
        return new BreakSignal();
      case "ContinueStatement":
        return new ContinueSignal();
      case "IfStatement": {
        const cond = evaluateExpression(stmt.condition, env);
        if (isTruthy(cond)) {
          return executeBlock(stmt.consequent, new Environment(env));
        }
        for (const alt of stmt.alternateConditions) {
          const altCond = evaluateExpression(alt.condition, env);
          if (isTruthy(altCond)) {
            return executeBlock(alt.body, new Environment(env));
          }
        }
        if (stmt.alternate) {
          return executeBlock(stmt.alternate, new Environment(env));
        }
        return;
      }
      case "WhileStatement": {
        while (isTruthy(evaluateExpression(stmt.condition, env))) {
          step();
          const blockEnv = new Environment(env);
          const result = executeBlock(stmt.body, blockEnv);
          if (result instanceof ReturnSignal) return result;
          if (result instanceof BreakSignal) break;
          // ContinueSignal just continues the loop
        }
        return;
      }
      case "ForStatement": {
        const iterable = evaluateExpression(stmt.iterable, env);
        if (!Array.isArray(iterable)) throw new Error("for..in requires an array");
        for (const item of iterable) {
          step();
          const blockEnv = new Environment(env);
          blockEnv.define(stmt.variable, item, false);
          const result = executeBlock(stmt.body, blockEnv);
          if (result instanceof ReturnSignal) return result;
          if (result instanceof BreakSignal) break;
          // ContinueSignal just continues the loop
        }
        return;
      }
    }
  }

  function evaluateExpression(expr: Expression, env: Environment): LuxValue {
    step();
    switch (expr.type) {
      case "NumberLiteral":
        return expr.value;
      case "StringLiteral":
        return expr.value;
      case "BooleanLiteral":
        return expr.value;
      case "NilLiteral":
        return null;
      case "Identifier":
        return env.get(expr.name);
      case "ArrayLiteral":
        return expr.elements.map((e) => evaluateExpression(e, env));
      case "UnaryExpression": {
        const operand = evaluateExpression(expr.operand, env);
        switch (expr.operator) {
          case "-":
            if (typeof operand !== "number") throw new Error("Unary '-' requires a number");
            return -operand;
          case "not":
            return !isTruthy(operand);
          default:
            throw new Error(`Unknown unary operator: ${expr.operator}`);
        }
      }
      case "BinaryExpression": {
        // Short-circuit for logical operators
        if (expr.operator === "and") {
          const left = evaluateExpression(expr.left, env);
          if (!isTruthy(left)) return left;
          return evaluateExpression(expr.right, env);
        }
        if (expr.operator === "or") {
          const left = evaluateExpression(expr.left, env);
          if (isTruthy(left)) return left;
          return evaluateExpression(expr.right, env);
        }

        const left = evaluateExpression(expr.left, env);
        const right = evaluateExpression(expr.right, env);
        return evaluateBinaryOp(expr.operator, left, right);
      }
      case "CallExpression": {
        const callee = env.get(expr.callee);
        const args = expr.arguments.map((a) => evaluateExpression(a, env));

        if (callee && typeof callee === "object" && "__type" in callee) {
          if (callee.__type === "builtin") {
            return (callee as BuiltinFunction).fn(args, env);
          }
          if (callee.__type === "function") {
            const func = callee as LuxFunction;
            const funcEnv = new Environment(func.closure);
            const params = func.declaration.params;
            for (let i = 0; i < params.length; i++) {
              funcEnv.define(params[i].name, i < args.length ? args[i] : null, false);
            }
            const result = executeBlock(func.declaration.body, funcEnv);
            if (result instanceof ReturnSignal) return result.value;
            return null;
          }
        }
        throw new Error(`'${expr.callee}' is not a function`);
      }
      case "IndexExpression": {
        const obj = evaluateExpression(expr.object, env);
        const index = evaluateExpression(expr.index, env);
        if (Array.isArray(obj)) {
          if (typeof index !== "number") throw new Error("Array index must be a number");
          const idx = Math.floor(index);
          if (idx < 0 || idx >= obj.length) throw new Error(`Index ${idx} out of bounds (length ${obj.length})`);
          return obj[idx];
        }
        if (typeof obj === "string") {
          if (typeof index !== "number") throw new Error("String index must be a number");
          const idx = Math.floor(index);
          if (idx < 0 || idx >= obj.length) throw new Error(`Index ${idx} out of bounds (length ${obj.length})`);
          return obj[idx];
        }
        throw new Error("Index operator requires an array or string");
      }
    }
  }

  function evaluateBinaryOp(op: string, left: LuxValue, right: LuxValue): LuxValue {
    // String concatenation
    if (op === "+" && (typeof left === "string" || typeof right === "string")) {
      return stringify(left) + stringify(right);
    }

    // Arithmetic
    if (typeof left === "number" && typeof right === "number") {
      switch (op) {
        case "+": return left + right;
        case "-": return left - right;
        case "*": return left * right;
        case "/":
          if (right === 0) throw new Error("Division by zero");
          return left / right;
        case "%":
          if (right === 0) throw new Error("Division by zero");
          return left % right;
        case "^": return Math.pow(left, right);
        case "<": return left < right;
        case ">": return left > right;
        case "<=": return left <= right;
        case ">=": return left >= right;
        case "==": return left === right;
        case "!=": return left !== right;
      }
    }

    // Equality for all types
    if (op === "==") return left === right;
    if (op === "!=") return left !== right;

    // Comparison for strings
    if (typeof left === "string" && typeof right === "string") {
      switch (op) {
        case "<": return left < right;
        case ">": return left > right;
        case "<=": return left <= right;
        case ">=": return left >= right;
      }
    }

    throw new Error(`Cannot apply operator '${op}' to ${typeOf(left)} and ${typeOf(right)}`);
  }

  function isTruthy(value: LuxValue): boolean {
    if (value === null) return false;
    if (value === false) return false;
    if (value === 0) return false;
    if (value === "") return false;
    return true;
  }

  function stringify(value: LuxValue): string {
    if (value === null) return "nil";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return String(value);
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return "[" + value.map(stringify).join(", ") + "]";
    if (typeof value === "object" && "__type" in value) {
      if (value.__type === "function") return `<function ${(value as LuxFunction).declaration.name}>`;
      if (value.__type === "builtin") return `<builtin ${(value as BuiltinFunction).name}>`;
    }
    return String(value);
  }

  function typeOf(value: LuxValue): string {
    if (value === null) return "nil";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object" && "__type" in value) {
      return value.__type === "function" ? "function" : "builtin";
    }
    return typeof value;
  }

  // ── Run ───────────────────────────────────────────────────

  try {
    executeBlock(program.body, globalEnv);
    return { output, steps, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { output, steps, error: message };
  }
}
