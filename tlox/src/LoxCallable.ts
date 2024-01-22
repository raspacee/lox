import Interpreter from "./Interpreter";

export abstract class LoxCallable {
  abstract call(interpreter: Interpreter, args: Object[]): Object;
  abstract arity(): number;
}
