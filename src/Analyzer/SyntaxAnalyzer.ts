import { Token, Type } from './Token';

export class SyntaxAnalyzer {
    private tokens: Token[];
    private position: number;
    private errors: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.position = 0;
        this.errors = [];
    }

    public parse(): void {
        this.programa();
    }

    public getErrorList(): Token[] {
        return this.errors;
    }

    private programa(): void {
        // permitir múltiples "using System;"
        while (this.match(Type.RESERVED_WORD, 'using')) {
            this.expect(Type.IDENTIFIER, 'System');
            this.expect(Type.SEMICOLON);
            this.skipComments();
        }

        this.skipComments();
        this.declaracionClase();
    }

    private declaracionClase(): void {
        this.expect(Type.RESERVED_WORD, 'public');
        this.expect(Type.RESERVED_WORD, 'class');
        this.expect(Type.IDENTIFIER);
        this.expect(Type.BRACE_OPEN);
        this.declaracionMetodo();
        this.expect(Type.BRACE_CLOSE);
    }

    private declaracionMetodo(): void {
        this.expect(Type.RESERVED_WORD, 'static');
        this.expect(Type.RESERVED_WORD, 'void');
        this.expect(Type.RESERVED_WORD, 'Main');
        this.expect(Type.PAR_OPEN);
        this.expect(Type.RESERVED_WORD, 'string');
        this.expect(Type.BRACKET_OPEN);
        this.expect(Type.BRACKET_CLOSE);
        this.expect(Type.IDENTIFIER);
        this.expect(Type.PAR_CLOSE);
        this.expect(Type.BRACE_OPEN);
        this.listaDeclaraciones();
        this.expect(Type.BRACE_CLOSE);
    }

    private listaDeclaraciones(): void {
        while (this.currentToken() && !this.check(Type.BRACE_CLOSE)) {
            this.skipComments();
            this.declaracion();
        }
    }

    private declaracion(): void {
        if (this.isTipoActual()) {
            this.declaracionVariable();
            this.expect(Type.SEMICOLON);
        } else if (this.check(Type.IDENTIFIER)) {
            this.asignacionVariable();
            this.expect(Type.SEMICOLON);
        } else if (this.checkLexema('Console')) {
            this.declaracionImpresion();
            this.expect(Type.SEMICOLON);
        } else if (this.checkLexema('if')) {
            this.declaracionIf();
        } else if (this.checkLexema('for')) {
            this.declaracionFor();
        } else if (this.check(Type.LINE_COMMENT) || this.check(Type.BLOCK_COMMENT)) {
            this.next(); // Saltar comentario
        } else {
            this.errorActual('Se esperaba una declaración');
            this.next();
        }
    }

    private declaracionVariable(): void {
        this.next(); // tipo
        this.expect(Type.IDENTIFIER);
        if (this.match(Type.ASSIGN)) {
            this.expresion();
        }

        while (this.match(Type.COMMA)) {
            this.expect(Type.IDENTIFIER);
            if (this.match(Type.ASSIGN)) {
                this.expresion();
            }
        }
    }

    private asignacionVariable(): void {
        this.expect(Type.IDENTIFIER);
        this.expect(Type.ASSIGN);
        this.expresion();
    }

    private expresion(): void {
        this.expresionSimple();
        if (
            this.currentToken() &&
            [Type.EQUAL, Type.NOT_EQUAL, Type.LESS, Type.GREATER, Type.LESS_EQUAL, Type.GREATER_EQUAL].includes(this.currentToken()!.getType())
        ) {
            this.next(); // operador relacional
            this.expresionSimple();
        }
    }

    private expresionSimple(): void {
        this.termino();
        while (
            this.currentToken() &&
            (this.currentToken()!.getType() === Type.PLUS || this.currentToken()!.getType() === Type.MINUS)
        ) {
            this.next();
            this.termino();
        }
    }

    private termino(): void {
        this.factor();
        while (
            this.currentToken() &&
            (this.currentToken()!.getType() === Type.MULTIPLY || this.currentToken()!.getType() === Type.DIVIDE)
        ) {
            this.next();
            this.factor();
        }
    }

    private factor(): void {
        const token = this.currentToken();

        if (!token) return;

        switch (token.getType()) {
            case Type.NUMBER:
            case Type.STRING:
            case Type.CHAR:
            case Type.BOOLEAN:
            case Type.IDENTIFIER:
                this.next();
                break;
            case Type.PAR_OPEN:
                this.next();
                this.expresion();
                this.expect(Type.PAR_CLOSE);
                break;
            default:
                this.errorActual('Factor inválido');
                this.next();
        }
    }

    private declaracionImpresion(): void {
        this.expectLexema('Console');
        this.expect(Type.DOT);
        this.expectLexema('WriteLine');
        this.expect(Type.PAR_OPEN);
        if (!this.check(Type.PAR_CLOSE)) {
            this.expresion();
        }
        this.expect(Type.PAR_CLOSE);
    }

    private declaracionIf(): void {
        this.expectLexema('if');
        this.expect(Type.PAR_OPEN);
        this.expresion();
        this.expect(Type.PAR_CLOSE);
        this.expect(Type.BRACE_OPEN);
        this.listaDeclaraciones();
        this.expect(Type.BRACE_CLOSE);

        if (this.checkLexema('else')) {
            this.next();
            this.expect(Type.BRACE_OPEN);
            this.listaDeclaraciones();
            this.expect(Type.BRACE_CLOSE);
        }
    }

    private declaracionFor(): void {
        this.expectLexema('for');
        this.expect(Type.PAR_OPEN);
        if (this.isTipoActual()) {
            this.declaracionVariable();
        } else {
            this.asignacionVariable();
        }
        this.expect(Type.SEMICOLON);
        this.expresion();
        this.expect(Type.SEMICOLON);
        if (this.check(Type.IDENTIFIER)) {
            this.next();
            if (this.checkLexema('++') || this.checkLexema('--')) {
                this.next();
            } else {
                this.errorActual('Se esperaba incremento o decremento');
            }
        }
        this.expect(Type.PAR_CLOSE);
        this.expect(Type.BRACE_OPEN);
        this.listaDeclaraciones();
        this.expect(Type.BRACE_CLOSE);
    }

    // Utilidades

    private isTipoActual(): boolean {
        const tipos = ['int', 'float', 'char', 'string', 'bool'];
        const token = this.currentToken();
        return token?.getType() === Type.RESERVED_WORD && tipos.includes(token.getLexeme());
    }

    private currentToken(): Token | null {
        return this.tokens[this.position] || null;
    }

    private next(): void {
        this.position++;
        this.skipComments();
    }

    private match(type: Type, lexema?: string): boolean {
        const token = this.currentToken();
        if (!token) return false;

        const isMatch = token.getType() === type && (lexema === undefined || token.getLexeme() === lexema);
        if (isMatch) this.next();
        return isMatch;
    }

    private check(type: Type): boolean {
        return this.currentToken()?.getType() === type;
    }

    private checkLexema(lexema: string): boolean {
        return this.currentToken()?.getLexeme() === lexema;
    }

    private expect(type: Type, lexema?: string): void {
        const token = this.currentToken();
        if (!token || token.getType() !== type || (lexema !== undefined && token.getLexeme() !== lexema)) {
            this.errorActual(`Se esperaba ${lexema ?? Type[type]}`);
        } else {
            this.next();
        }
    }

    private expectLexema(lexema: string): void {
        const token = this.currentToken();
        if (!token || token.getLexeme() !== lexema) {
            this.errorActual(`Se esperaba '${lexema}'`);
        } else {
            this.next();
        }
    }

    private skipComments(): void {
        while (
            this.currentToken() &&
            (this.currentToken()!.getType() === Type.LINE_COMMENT || this.currentToken()!.getType() === Type.BLOCK_COMMENT)
        ) {
            this.next();
        }
    }

    private errorActual(mensaje: string): void {
        const token = this.currentToken();
        if (token) {
            const error = new Token(token.getType(), token.getLexeme(), token.getRow(), token.getColumn());
            this.errors.push(error);
        }
    }
}
