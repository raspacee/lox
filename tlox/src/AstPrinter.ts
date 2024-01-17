import { Expr, Visitor, Binary, Unary, Grouping, Literal } from "./Expr";
import { TokenType } from "./TokenType.enum";
import Token from "./Token";

class AstPrinter implements Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  public visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  public visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize("", expr.expression);
  }

  public visitLiteralExpr(expr: Literal): string {
    if (expr.value == null) return "nil";
    return expr.value.toString();
  }

  public visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  private parenthesize(operator: string, ...exprs: Expr[]) {
    let result = "";

    for (let expr of exprs) {
      result += " ";
      result += expr.accept(this);
    }

    result += " " + operator;

    return result;
  }

  public static main(): void {
    let expression: Expr = new Binary(
      new Grouping(
        new Binary(
          new Literal(1),
          new Token(TokenType.PLUS, "+", null, 1),
          new Literal(2)
        )
      ),
      new Token(TokenType.STAR, "*", null, 1),
      new Grouping(
        new Binary(
          new Literal(4),
          new Token(TokenType.MINUS, "-", null, 1),
          new Literal(3)
        )
      )
    );
    console.log(new AstPrinter().print(expression));
  }
}

AstPrinter.main();
