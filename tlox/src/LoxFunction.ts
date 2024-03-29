import { Environment } from "./Environment";
import Interpreter from "./Interpreter";
import { LoxCallable } from "./LoxCallable";
import { Function } from "./Stmt";
import { ReturnStop } from "./Interpreter";

export class LoxFunction extends LoxCallable {
  readonly declaration: Function;
  readonly closure: Environment;

  constructor(declaration: Function, closure: Environment) {
    super();
    this.declaration = declaration;
    this.closure = closure;
  }

  public call(interpreter: Interpreter, args: Object[]): Object {
    let environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue) {
      if (returnValue instanceof ReturnStop) return returnValue.value;
    }
    return null;
  }

  public arity(): number {
    return this.declaration.params.length;
  }

  public toString(): string {
    return "<fn " + this.declaration.name.lexeme + ">";
  }
}
