enum Type {
    // Tipos básicos
    UNKNOWN,
    IDENTIFIER,     // Variables, nombres de funciones, etc.
    NUMBER,         // Números enteros y decimales
    STRING,         // Cadenas entre comillas
    BOOLEAN,        // true o false
    CHAR,           // Caracteres entre comillas simples
    
    // Símbolos y operadores
    PAR_OPEN,       // (
    PAR_CLOSE,      // )
    SEMICOLON,      // ;
    COLON,          // :
    BRACKET_OPEN,   // [
    BRACKET_CLOSE,  // ]
    BRACE_OPEN,     // {
    BRACE_CLOSE,    // }
    COMMA,          // ,
    DOT,            // .
    ASSIGN,         // =
    
    // Operadores aritméticos
    PLUS,           // +
    MINUS,          // -
    MULTIPLY,       // *
    DIVIDE,         // /
    
    // Operadores relacionales
    EQUAL,          // ==
    NOT_EQUAL,      // !=
    LESS,           // <
    GREATER,        // >
    LESS_EQUAL,     // <=
    GREATER_EQUAL,  // >=
    
    // Palabras reservadas de C#
    RESERVED_WORD,
    UNKNOW,
    
    // Comentarios
    LINE_COMMENT,   // //
    BLOCK_COMMENT   // /* */
}

class Token {
    private row: number;
    private column: number;
    private lexeme: string;
    private typeToken: Type;
    private typeTokenString: string;

    constructor(typeToken: Type, lexeme: string, row: number, column: number) {
        this.typeToken = typeToken;
        this.typeTokenString = Type[typeToken];
        this.lexeme = lexeme;
        this.row = row;
        this.column = column;
    }

    getRow(): number {
        return this.row;
    }

    getColumn(): number {
        return this.column;
    }

    getLexeme(): string {
        return this.lexeme;
    }

    getType(): Type {
        return this.typeToken;
    }

    getTypeTokenString(): string {
        return this.typeTokenString;
    }

    toString(): string {
        return `Token [${this.typeTokenString}] '${this.lexeme}' at (${this.row}, ${this.column})`;
    }
}

export { Token, Type };