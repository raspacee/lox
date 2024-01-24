import {
  Assign,
  Binary,
  Call,
  Expr,
  Visitor as ExprVisitor,
  Grouping,
  Literal,
  Logical,
  Unary,
  Variable,
} from "./Expr";
import Interpreter from "./Interpreter";
import { Lox } from "./Index";
import {
  Block,
  Break,
  Expression,
  Function,
  If,
  Print,
  Return,
  Stmt,
  Visitor as StmtVisitor,
  Var,
  While,
} from "./Stmt";
import Token from "./Token";

enum FunctionType {
  NONE,
  FUNCTION,
}

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  readonly interpreter: Interpreter;
  readonly scopes: Map<string, boolean>[] = [];
  private currentFunction: FunctionType = FunctionType.NONE;

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  public visitBlockStmt(stmt: Block): void {
    this.beginScope();
    this.resolveAll(stmt.statements);
    this.endScope();
    return null;
  }

  public visitVarStmt(stmt: Var): void {
    this.declare(stmt.name);
    if (stmt.initializer != null) {
      this.resolveExpr(stmt.initializer);
    }
    this.define(stmt.name);
    return null;
  }

  public visitVariableExpr(expr: Variable): void {
    if (
      this.scopes.length > 0 &&
      this.scopes[this.scopes.length - 1].get(expr.name.lexeme) == false
    ) {
      Lox.errorParser(
        expr.name,
        "Cannot read local variable in its own initialization."
      );
    }
    this.resolveLocal(expr, expr.name);
    return null;
  }

  public visitAssignExpr(expr: Assign): void {
    this.resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name);
    return null;
  }

  public visitFunctionStmt(stmt: Function): void {
    this.declare(stmt.name);
    this.define(stmt.name);
    this.resolveFunction(stmt, FunctionType.FUNCTION);
    return null;
  }

  public visitExpressionStmt(stmt: Expression): void {
    this.resolveExpr(stmt.expression);
    return null;
  }

  public visitIfStmt(stmt: If): void {
    this.resolveExpr(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch != null) this.resolve(stmt.elseBranch);
    return null;
  }

  public visitPrintStmt(stmt: Print): void {
    this.resolveExpr(stmt.expression);
    return null;
  }

  public visitReturnStmt(stmt: Return): void {
    if (this.currentFunction == FunctionType.NONE)
      Lox.errorParser(stmt.keyword, "Can't return from top-level code.");
    if (stmt.value != null) {
      this.resolveExpr(stmt.value);
    }

    return null;
  }

  public visitWhileStmt(stmt: While): void {
    this.resolveExpr(stmt.condition);
    this.resolve(stmt.body);
    return null;
  }

  public visitBinaryExpr(expr: Binary): void {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
    return null;
  }

  public visitCallExpr(expr: Call): void {
    this.resolveExpr(expr.callee);

    for (let arg of expr.args) {
      this.resolveExpr(arg);
    }

    return null;
  }

  public visitGroupingExpr(expr: Grouping): void {
    this.resolveExpr(expr.expression);
    return null;
  }

  public visitLiteralExpr(expr: Literal): void {
    return null;
  }

  public visitBreakStmt(expr: Break): void {
    return null;
  }

  private resolveFunction(func: Function, type: FunctionType): void {
    let enclosingFunction = this.currentFunction;
    this.currentFunction = type;
    this.beginScope();
    for (let param of func.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolveAll(func.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  public visitLogicalExpr(expr: Logical): void {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
    return null;
  }

  public visitUnaryExpr(expr: Unary): void {
    this.resolveExpr(expr.right);
    return null;
  }

  private resolveLocal(expr: Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
      }
    }
  }

  private declare(name: Token): void {
    if (this.scopes.length == 0) return;
    let scope: Map<string, boolean> = this.scopes[this.scopes.length - 1];
    if (scope.has(name.lexeme)) {
      Lox.errorParser(name, "Already a variable with this name in this scope.");
    }
    scope.set(name.lexeme, false);
  }

  private define(name: Token): void {
    if (this.scopes.length == 0) return;
    this.scopes[this.scopes.length - 1].set(name.lexeme, true);
  }

  private beginScope(): void {
    this.scopes.push(new Map<string, boolean>());
  }

  private endScope(): void {
    this.scopes.pop();
  }

  resolveAll(statements: Stmt[]): void {
    for (let statement of statements) {
      this.resolve(statement);
    }
  }

  private resolve(stmt: Stmt): void {
    stmt.accept(this);
  }

  private resolveExpr(expr: Expr): void {
    expr.accept(this);
  }
}
