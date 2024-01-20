import { TokenType } from "./TokenType.enum";
import Token from "./Token";
import { Lox } from "./Index";

export class Scanner {
  private readonly source: string;
  private readonly tokens: Token[] = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;
  private static readonly keywords: Map<string, TokenType> = new Map();

  static {
    this.keywords.set("and", TokenType.AND);
    this.keywords.set("and", TokenType.AND);
    this.keywords.set("class", TokenType.CLASS);
    this.keywords.set("else", TokenType.ELSE);
    this.keywords.set("false", TokenType.FALSE);
    this.keywords.set("for", TokenType.FOR);
    this.keywords.set("fun", TokenType.FUN);
    this.keywords.set("if", TokenType.IF);
    this.keywords.set("nil", TokenType.NIL);
    this.keywords.set("or", TokenType.OR);
    this.keywords.set("print", TokenType.PRINT);
    this.keywords.set("return", TokenType.RETURN);
    this.keywords.set("super", TokenType.SUPER);
    this.keywords.set("this", TokenType.THIS);
    this.keywords.set("true", TokenType.TRUE);
    this.keywords.set("var", TokenType.VAR);
    this.keywords.set("while", TokenType.WHILE);
  }

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private scanToken(): void {
    // single char is returned
    let c = this.advance();
    switch (c) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "/":
        if (this.match("/")) {
          // A comment goes until the end of the line.
          while (this.peek() != "\n" && !this.isAtEnd()) this.advance();
        } else if (this.match("*")) {
          while (
            this.peek() != "*" &&
            this.peekNext() != "/" &&
            !this.isAtEnd()
          ) {
            if (this.peek() == "\n") this.line++;
            this.advance();
          }
          this.advance();
          this.advance();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        break;

      case "\n":
        this.line++;
        break;
      case '"':
        this.readString();
        break;
      default:
        if (this.isDigit(c)) {
          this.readNumber();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          Lox.error(this.line, "Unexpected character: " + c);
        }
        break;
    }
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    let text: string = this.source.substring(this.start, this.current);
    let type: TokenType | undefined = Scanner.keywords.get(text);
    if (type == undefined) type = TokenType.IDENTIFIER;
    this.addToken(type);
  }

  private isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_";
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private readString(): void {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == "\n") this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      Lox.error(this.line, "Unterminated string.");
      return;
    }

    // The closing ".
    this.advance();

    // Trim the surrounding quotes.
    let value: string = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private readNumber(): void {
    while (this.isDigit(this.peek())) this.advance();

    // Look for a fractional part.
    if (this.peek() == "." && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(
      TokenType.NUMBER,
      Number(this.source.substring(this.start, this.current))
    );
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source.charAt(this.current + 1);
  }

  private isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
  }

  private peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.source.charAt(this.current);
  }

  // Takes single character
  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) != expected) return false;

    this.current++;
    return true;
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TokenType, literal: Object | null = null): void {
    let text: string = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }
}
