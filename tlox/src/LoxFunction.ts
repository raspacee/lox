import { Environment } from "./Environment";
import Interpreter from "./Interpreter";
import { LoxCallable } from "./LoxCallable";
import { Function } from "./Stmt";

export class LoxFunction extends LoxCallable {
  readonly declaration: Function;

  constructor(declaration: Function) {
    super();
    this.declaration = declaration;
  }

  public call(interpreter: Interpreter, args: Object[]): Object {
    let environment = new Environment(interpreter.globals);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    interpreter.executeBlock(this.declaration.body, environment);
    return null;
  }

  public arity(): number {
    return this.declaration.params.length;
  }

  public toString(): string {
    return "<fn " + this.declaration.name.lexeme + ">";
  }
}
