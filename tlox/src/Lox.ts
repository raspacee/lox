import fs from "fs";
import path from "path";
import readline from "node:readline";

import Token from "./Token";
import Scanner from "./Scanner";

class Lox {
  static hadError: boolean = false;

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
    let flag = true;

    while (flag) {
      const line = await getLine("> ");
      if (line == "\0") flag = false;
      this.run(line);
      this.hadError = false;
    }
    reader.close();
  }

  private static run(source: string): void {
    let scanner: Scanner = new Scanner(source);
    let tokens = scanner.scanTokens();

    let token: Token;
    for (token of tokens) {
      console.log(token);
    }
  }

  public static error(line: number, message: string): void {
    this.report(line, "", message);
  }

  private static report(line: number, where: string, message: string): void {
    console.log("[line " + line + "] Error" + where + ": " + message);
    this.hadError = true;
  }
}

Lox.main(process.argv.splice(1));

export default Lox;
