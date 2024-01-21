import RuntimeError from "./RuntimeError";
import Token from "./Token";

export class Environment {
  readonly enclosing: Environment;
  private readonly values: Map<String, Object> = new Map();

  constructor(enclosing: Environment = null) {
    this.enclosing = enclosing;
  }

  define(name: string, value: Object) {
    this.values.set(name, value);
  }

  get(name: Token): Object {
    if (this.values.has(name.lexeme)) return this.values.get(name.lexeme);

    if (this.enclosing != null) return this.enclosing.get(name);

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }

  assign(name: Token, value: Object) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing != null) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }
}
