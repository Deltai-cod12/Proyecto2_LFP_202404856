import { Token, Type } from "./Token";

class LexicalAnalyzer {
    private row: number;
    private column: number;
    private auxChar: string;
    private state: number;
    private tokenList: Token[];
    private errorList: Token[];
    private reservedWords: string[];

    constructor() {
        this.row = 1;
        this.column = 1;
        this.auxChar = '';
        this.state = 0;
        this.tokenList = [];
        this.errorList = [];
        this.reservedWords = [
            // Tipos de datos
            'int', 'float', 'double', 'char', 'string', 'bool', 'byte', 'short', 'long', 
            'decimal', 'object', 'dynamic', 'var',
            
            // Modificadores de acceso
            'public', 'private', 'protected', 'internal', 'static', 'readonly', 'const', 'volatile',
            
            // Palabras clave de control
            'if', 'else', 'switch', 'case', 'default', 'for', 'foreach', 'while', 'do', 'break', 
            'continue', 'goto', 'return', 'throw', 'try', 'catch', 'finally',
            
            // Palabras clave de clases
            'class', 'struct', 'interface', 'enum', 'delegate', 'event', 'namespace', 'using',
            'new', 'this', 'base', 'operator', 'sizeof', 'typeof', 'nameof', 'stackalloc',
            
            // Modificadores de métodos
            'void', 'async', 'await', 'ref', 'out', 'in', 'params', 'override', 'virtual', 
            'abstract', 'sealed', 'extern', 'partial',
            
            // Valores booleanos
            'true', 'false',
            
            // Otros
            'null', 'is', 'as', 'lock', 'checked', 'unchecked', 'fixed', 'unsafe', 'where',
            
            // Contexto específico
            'Console', 'WriteLine', 'Main', 'String', 'Array', 'List'
        ];
    }

    scanner(input: string): Token[] {
        this.tokenList = [];
        this.errorList = [];
        this.row = 1;
        this.column = 1;
        this.auxChar = '';
        this.state = 0;

        input += '#'; // Marcador de fin de archivo

        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            if (this.state === 0) {
                if (this.handleWhitespace(char)) continue;
            }

            switch (this.state) {
                case 0: // Estado inicial
                    this.handleInitialState(char, input, i);
                    break;
                    
                case 1: // Identificadores y palabras reservadas
                    if (/[a-zA-Z0-9_]/.test(char)) {
                        this.addCharacter(char);
                    } else {
                        this.finalizeIdentifier();
                        i--; // Reevaluar el caracter
                    }
                    break;
                    
                case 2: // Números enteros
                    if (/\d/.test(char)) {
                        this.addCharacter(char);
                    } else if (char === '.') {
                        this.state = 3; // Cambiar a decimal
                        this.addCharacter(char);
                    } else {
                        this.addToken(Type.NUMBER, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                        i--;
                    }
                    break;
                    
                case 3: // Números decimales (después del punto)
                    if (/\d/.test(char)) {
                        this.addCharacter(char);
                    } else {
                        this.addToken(Type.NUMBER, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                        i--;
                    }
                    break;
                    
                case 4: // Operador de asignación (=) o igualdad (==)
                    if (char === '=') {
                        this.addCharacter(char);
                        this.addToken(Type.EQUAL, this.auxChar, this.row, this.column - this.auxChar.length);
                    } else {
                        this.addToken(Type.ASSIGN, this.auxChar, this.row, this.column - this.auxChar.length);
                        i--;
                    }
                    this.clean();
                    break;
                    
                case 5: // Operador de desigualdad (!=)
                    if (char === '=') {
                        this.addCharacter(char);
                        this.addToken(Type.NOT_EQUAL, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                    } else {
                        this.addError(Type.UNKNOWN, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                        i--;
                    }
                    break;
                    
                case 6: // Operador menor (<) o menor igual (<=)
                    if (char === '=') {
                        this.addCharacter(char);
                        this.addToken(Type.LESS_EQUAL, this.auxChar, this.row, this.column - this.auxChar.length);
                    } else {
                        this.addToken(Type.LESS, this.auxChar, this.row, this.column - this.auxChar.length);
                        i--;
                    }
                    this.clean();
                    break;
                    
                case 7: // Operador mayor (>) o mayor igual (>=)
                    if (char === '=') {
                        this.addCharacter(char);
                        this.addToken(Type.GREATER_EQUAL, this.auxChar, this.row, this.column - this.auxChar.length);
                    } else {
                        this.addToken(Type.GREATER, this.auxChar, this.row, this.column - this.auxChar.length);
                        i--;
                    }
                    this.clean();
                    break;
                    
                case 8: // Comentario de línea (//)
                    if (char === '\n' || char === '\r') {
                        this.addToken(Type.LINE_COMMENT, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                        this.handleWhitespace(char); // Manejar el salto de línea
                    } else {
                        this.addCharacter(char);
                    }
                    break;
                    
                case 9: // Comentario de bloque (/* ... */)
                    this.addCharacter(char);
                    if (char === '*' && input[i + 1] === '/') {
                        this.addCharacter('/');
                        i++; // Saltar el siguiente caracter
                        this.addToken(Type.BLOCK_COMMENT, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                    } else if (i === input.length - 1) {
                        this.addError(Type.UNKNOWN, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                    }
                    break;
                    
                case 10: // Caracteres (')
                    this.addCharacter(char);
                    if (char === '\'') {
                        if (this.auxChar.length === 3 || (this.auxChar.length === 4 && this.auxChar[1] === '\\')) {
                            this.addToken(Type.CHAR, this.auxChar, this.row, this.column - this.auxChar.length);
                            this.clean();
                        } else {
                            this.addError(Type.UNKNOWN, this.auxChar, this.row, this.column - this.auxChar.length);
                            this.clean();
                        }
                    } else if (this.auxChar.length > 3 && this.auxChar[1] !== '\\') {
                        this.addError(Type.UNKNOWN, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                        i--;
                    } else if (i === input.length - 1) {
                        this.addError(Type.UNKNOWN, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                    }
                    break;
                    
                case 11: // Cadenas (")
                    this.addCharacter(char);
                    if (char === '"') {
                        this.addToken(Type.STRING, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                    } else if (char === '\\') {
                        // Manejar caracteres de escape
                        if (i + 1 < input.length) {
                            this.addCharacter(input[i + 1]);
                            i++;
                        }
                    } else if (i === input.length - 1) {
                        this.addError(Type.UNKNOWN, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                    }
                    break;
                    
                case 12: // Operadores aritméticos (+ - * /)
                    this.addToken(this.getArithmeticType(this.auxChar), this.auxChar, this.row, this.column - this.auxChar.length);
                    this.clean();
                    i--;
                    break;
            }
        }
        
        return this.tokenList;
    }

    private handleInitialState(char: string, input: string, index: number): void {
        if (/[a-zA-Z_]/.test(char)) {
            this.state = 1; // Identificador
            this.addCharacter(char);
        } else if (/\d/.test(char)) {
            this.state = 2; // Número
            this.addCharacter(char);
        } else {
            switch (char) {
                // Símbolos simples
                case '[': this.addSimpleToken(Type.BRACKET_OPEN, char); break;
                case ']': this.addSimpleToken(Type.BRACKET_CLOSE, char); break;
                case '{': this.addSimpleToken(Type.BRACE_OPEN, char); break;
                case '}': this.addSimpleToken(Type.BRACE_CLOSE, char); break;
                case '(': this.addSimpleToken(Type.PAR_OPEN, char); break;
                case ')': this.addSimpleToken(Type.PAR_CLOSE, char); break;
                case ':': this.addSimpleToken(Type.COLON, char); break;
                case ';': this.addSimpleToken(Type.SEMICOLON, char); break;
                case ',': this.addSimpleToken(Type.COMMA, char); break;
                case '.': this.addSimpleToken(Type.DOT, char); break;
                
                // Operadores compuestos
                case '=': 
                    this.state = 4;
                    this.addCharacter(char);
                    break;
                case '!': 
                    this.state = 5;
                    this.addCharacter(char);
                    break;
                case '<': 
                    this.state = 6;
                    this.addCharacter(char);
                    break;
                case '>': 
                    this.state = 7;
                    this.addCharacter(char);
                    break;
                
                // Comentarios
                case '/':
                    if (input[index + 1] === '/') {
                        this.state = 8;
                        this.addCharacter(char);
                        this.addCharacter(input[index + 1]);
                        index++; // Saltar el siguiente '/'
                    } else if (input[index + 1] === '*') {
                        this.state = 9;
                        this.addCharacter(char);
                        this.addCharacter(input[index + 1]);
                        index++; // Saltar el '*'
                    } else {
                        this.state = 12;
                        this.addCharacter(char);
                    }
                    break;
                
                // Caracteres y cadenas
                case '\'': 
                    this.state = 10;
                    this.addCharacter(char);
                    break;
                case '"': 
                    this.state = 11;
                    this.addCharacter(char);
                    break;
                
                // Operadores aritméticos
                case '+': 
                case '-': 
                case '*': 
                    this.state = 12;
                    this.addCharacter(char);
                    break;
                
                // Fin de archivo
                case '#':
                    if (index === input.length - 1) {
                        console.log("Análisis completado");
                    } else {
                        this.addError(Type.UNKNOWN, char, this.row, this.column);
                        this.column++;
                    }
                    break;
                
                // Caracter desconocido
                default:
                    this.addError(Type.UNKNOWN, char, this.row, this.column);
                    this.column++;
                    break;
            }
        }
    }

    private handleWhitespace(char: string): boolean {
        if (char === ' ' || char === '\t') {
            this.column++;
            return true;
        }
        if (char === '\n') {
            this.row++;
            this.column = 1;
            return true;
        }
        if (char === '\r') {
            if (this.auxChar.length === 0) { // Solo si estamos en estado inicial
                this.row++;
                this.column = 1;
                return true;
            }
        }
        return false;
    }

    private finalizeIdentifier(): void {
        const startColumn = this.column - this.auxChar.length;

        // Si comienza igual que una palabra reservada pero no es exactamente igual
        const similarKeyword = this.reservedWords.find(word => {
            return word.length === this.auxChar.length && word !== this.auxChar &&
                word.startsWith(this.auxChar[0]) && word.endsWith(this.auxChar[word.length - 1]);
        });

        if (this.reservedWords.includes(this.auxChar)) {
            if (this.auxChar === 'true' || this.auxChar === 'false') {
                this.addToken(Type.BOOLEAN, this.auxChar, this.row, startColumn);
            } else {
                this.addToken(Type.RESERVED_WORD, this.auxChar, this.row, startColumn);
            }
        } else if (similarKeyword) {
            // Se parece a una palabra clave pero está mal escrita
            this.addError(Type.UNKNOWN, this.auxChar, this.row, startColumn);
        } else {
            this.addToken(Type.IDENTIFIER, this.auxChar, this.row, startColumn);
        }

        this.clean();
    }

    private addSimpleToken(type: Type, char: string): void {
        this.addToken(type, char, this.row, this.column);
        this.column++;
    }

    private getArithmeticType(op: string): Type {
        switch (op) {
            case '+': return Type.PLUS;
            case '-': return Type.MINUS;
            case '*': return Type.MULTIPLY;
            case '/': return Type.DIVIDE;
            default: return Type.UNKNOWN;
        }
    }

    private addCharacter(char: string): void {
        this.auxChar += char;
        this.column++;
    }

    private clean(): void {
        this.state = 0;
        this.auxChar = '';
    }

    private addToken(type: Type, lexeme: string, row: number, column: number): void {
        this.tokenList.push(new Token(type, lexeme, row, column));
    }

    private addError(type: Type, lexeme: string, row: number, column: number): void {
        this.errorList.push(new Token(type, lexeme, row, column));
    }

    getErrorList(): Token[] {
        return this.errorList;
    }

    getTokenList(): Token[] {
        return this.tokenList;
    }
}

export { LexicalAnalyzer };