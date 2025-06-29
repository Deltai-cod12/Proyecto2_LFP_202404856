"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = exports.Token = void 0;
var Type;
(function (Type) {
    Type[Type["UNKNOW"] = 0] = "UNKNOW";
    Type[Type["PAR_OPEN"] = 1] = "PAR_OPEN";
    Type[Type["PAR_CLOSE"] = 2] = "PAR_CLOSE";
    Type[Type["SEMICOLON"] = 3] = "SEMICOLON";
    Type[Type["COLON"] = 4] = "COLON";
    Type[Type["BRACKET_OPEN"] = 5] = "BRACKET_OPEN";
    Type[Type["BRACKET_CLOSE"] = 6] = "BRACKET_CLOSE";
    Type[Type["BRACE_OPEN"] = 7] = "BRACE_OPEN";
    Type[Type["BRACE_CLOSE"] = 8] = "BRACE_CLOSE";
    Type[Type["NUMBER"] = 9] = "NUMBER";
    Type[Type["STRING"] = 10] = "STRING";
    Type[Type["RESERVED_WORD"] = 11] = "RESERVED_WORD";
    Type[Type["COMMA"] = 12] = "COMMA";
})(Type || (exports.Type = Type = {}));
class Token {
    constructor(typeToken, lexeme, row, column) {
        this.typeToken = typeToken;
        this.typeTokenString = Type[typeToken];
        this.lexeme = lexeme;
        this.row = row;
        this.column = column;
    }
    getRow() {
        return this.row;
    }
    getColumn() {
        return this.column;
    }
    getLexeme() {
        return this.lexeme;
    }
    getType() {
        return this.typeToken;
    }
    getTypeTokenString() {
        return this.typeTokenString;
    }
}
exports.Token = Token;
