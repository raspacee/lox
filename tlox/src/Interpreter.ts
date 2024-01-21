import {
  Binary,
  Expr,
  Grouping,
  Literal,
  Unary,
  Visitor as ExprVisitor,
  Variable,
  Assign,
  Logical,
} from "./Expr";
import {
  Block,
  Expression,
  If,
  Lox,
  Stmt,
  Visitor as StmtVisitor,
  Var,
} from "./Index";
import RuntimeError from "./RuntimeError";
import Token from "./Token";
import { TokenType } from "./TokenType.enum";
import { Environment } from "./Environment";

class Interpreter implements ExprVisitor<Object>, StmtVisitor<void> {
  private environment = new Environment();

  interpret(statements: Stmt[]): void {
    try {
      for (let statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      if (error instanceof RuntimeError) Lox.runtimeError(error);
    }
  }

  public visitLogicalExpr(expr: Logical): Object {
    let left: Object = this.evaluate(expr.left);

    if (expr.operator.type == TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  public visitIfStmt(stmt: If): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch != null) {
      this.execute(stmt.elseBranch);
    }
    return null;
  }

  public visitBlockStmt(expr: Block): void {
    this.executeBlock(expr.statements, new Environment(this.environment));
    return null;
  }

  public visitAssignExpr(expr: Assign): Object {
    let value: Object = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  public visitVarStmt(stmt: Var): void {
    let value: Object = null;
    if (stmt.initializer != null) value = this.evaluate(stmt.initializer);

    this.environment.define(stmt.name.lexeme, value);
    return null;
  }

  public visitVariableExpr(expr: Variable): Object {
    return this.environment.get(expr.name);
  }

  public visitExpressionStmt(stmt: Expression): void {
    let value = this.evaluate(stmt.expression);
    console.log(value);
    return null;
  }

  public visitPrintStmt(stmt: Expression): void {
    let value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
    return null;
  }

  public visitLiteralExpr(expr: Literal): Object {
    return expr.value;
  }

  public visitGroupingExpr(expr: Grouping): Object {
    return this.evaluate(expr);
  }

  public visitUnaryExpr(expr: Unary): Object {
    let right: Object = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -(right as number);
    }

    // Unreachable
    return null;
  }

  public visitBinaryExpr(expr: Binary): Object {
    let left: Object = this.evaluate(expr.left);
    let right: Object = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) - (right as number);
      case TokenType.PLUS:
        {
          if (typeof left === "number" && typeof right === "number")
            return (left as number) + (right as number);
          else if (
            (typeof left === "string" && typeof right === "string") ||
            typeof left === "string" ||
            typeof right === "string"
          )
            return (left as string) + (right as string);
          throw new RuntimeError(
            expr.operator,
            "Operands must be two numbers or two strings."
          );
        }
        break;
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) * (right as number);
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) / (right as number);

      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) > (right as number);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) >= (right as number);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) < (right as number);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) <= (right as number);

      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }
    // Unreachable
    return null;
  }

  private checkNumberOperand(operator: Token, operand: Object): void {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(
    operator: Token,
    left: Object,
    right: Object
  ): void {
    if (typeof left === "number" && typeof right === "number") return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  private isEqual(a: Object, b: Object): boolean {
    return a === b;
  }

  private stringify(object: Object): string {
    if (object == null) return "nil";

    if (typeof object === "number") {
      let text: string = object.toString();
      if (text.endsWith(".0")) {
        text = text.substring(0, text.length - 2);
      }
      return text;
    }

    return object.toString();
  }

  private isTruthy(object: Object): boolean {
    if (object == null) return false;
    if (typeof object === "boolean") return object as boolean;
    return true;
  }

  private evaluate(expr: Expr): Object {
    return expr.accept(this);
  }

  private execute(stmt: Stmt): void {
    return stmt.accept(this);
  }

  private executeBlock(statements: Stmt[], environment: Environment): void {
    let previous = this.environment;
    try {
      this.environment = environment;

      for (let statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }
}

export default Interpreter;
