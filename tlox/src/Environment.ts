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

  getAt(distance: number, name: string): Object {
    return this.ancestor(distance).values.get(name);
  }

  assignAt(distance: number, name: Token, value: Object): void {
    this.ancestor(distance).values.set(name.lexeme, value);
  }

  ancestor(distance: number): Environment {
    let environment: Environment = this;
    for (let i = 0; i < distance; i++) {
      environment = environment.enclosing;
    }

    return environment;
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
