import fs from "fs";
import path from "path";
import readline from "node:readline";

import Token from "./Token";
import { TokenType } from "./TokenType.enum";
import { Parser, Scanner, Stmt } from "./Index";
import RuntimeError from "./RuntimeError";
import Interpreter from "./Interpreter";

export class Lox {
  private static readonly interpreter = new Interpreter();
  static hadError: boolean = false;
  static hadRuntimeError: boolean = false;

  public static main(args: string[]): void {
    if (args.length > 2) {
      console.log("Usage: tlox [script]");
      process.exit(64);
    } else if (args.length == 2) {
      this.runFile(args[1]);
    } else {
      this.runPrompt();
    }
  }

  private static runFile(location: string): void {
    const content = fs.readFileSync(path.join(__dirname, location), {
      encoding: "utf-8",
    });
    this.run(content);

    if (this.hadError) process.exit(65);
    if (this.hadRuntimeError) process.exit(70);
  }

  private static async runPrompt(): Promise<void> {
    const reader = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const getLine = function (query: string): Promise<string> {
      return new Promise((res, rej) => {
        reader.question(query, (answer) => {
          res(answer);
        });
      });
    };

    while (true) {
      const line = await getLine("> ");
      if (line == "\0") break;
      this.run(line);
      this.hadError = false;
    }
    reader.close();
  }

  private static run(source: string): void {
    let scanner: Scanner = new Scanner(source);
    let tokens = scanner.scanTokens();
    let parser: Parser = new Parser(tokens);
    let statements: Stmt[] = parser.parse();

    if (this.hadError) return;
    this.interpreter.interpret(statements);
  }

  public static error(line: number, message: string): void {
    this.report(line, "", message);
  }

  private static report(line: number, where: string, message: string): void {
    console.log("[line " + line + "] Error" + where + ": " + message);
    this.hadError = true;
  }

  public static errorParser(token: Token, message: string): void {
    if (token.type == TokenType.EOF) {
      this.report(token.line, " at end", message);
    } else {
      this.report(token.line, " at '" + token.lexeme + "'", message);
    }
  }

  static runtimeError(error: RuntimeError): void {
    console.log(error.message + "\n[line " + error.token.line + "]");
    this.hadRuntimeError = true;
  }
}

Lox.main(process.argv.splice(1));
