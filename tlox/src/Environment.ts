import RuntimeError from "./RuntimeError";
import Token from "./Token";

export class Environment {
  private readonly values: Map<String, Object> = new Map();

  define(name: string, value: Object) {
    this.values.set(name, value);
  }

  get(name: Token): Object {
    if (this.values.has(name.lexeme)) return this.values.get(name.lexeme);

    throw new RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
  }
}
