"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexicalAnalyzer = void 0;
const Token_1 = require("./Token");
class LexicalAnalyzer {
    constructor() {
        this.row = 1;
        this.column = 1;
        this.auxChar = '';
        this.state = 0;
        this.tokenList = [];
        this.errorList = [];
        this.reserverdWords = ['Carrera', 'Semestre', 'Curso', 'Nombre', 'Area', 'Prerrequisitos'];
    }
    scanner(input) {
        this.tokenList = [];
        this.errorList = [];
        this.row = 1; 
        this.column = 1;
        this.auxChar = '';
        this.state = 0;
        input += '#'; 
        for (let i = 0; i < input.length; i++) {
            let char = input[i]; 
            if (this.state === 0) { 
                if (char === ' ' || char === '\t') {
                    this.column++;
                    continue; 
                }
                if (char === '\n') {
                    this.row++;
                    this.column = 1;
                    continue; 
                }
                if (char === '\r') { 
                    if (input[i + 1] !== '\n') {
                        this.row++;
                        this.column = 1;
                    }
                    continue; 
                }
            }
            switch (this.state) {
                case 0:
                    switch (char) {
                        case '[':
                            this.addToken(Token_1.Type.BRACKET_OPEN, char, this.row, this.column);
                            this.column++;
                            break; 
                        case ']':
                            this.addToken(Token_1.Type.BRACKET_CLOSE, char, this.row, this.column);
                            this.column++;
                            break;
                        case '{':
                            this.addToken(Token_1.Type.BRACE_OPEN, char, this.row, this.column);
                            this.column++;
                            break;
                        case '}':
                            this.addToken(Token_1.Type.BRACE_CLOSE, char, this.row, this.column);
                            this.column++;
                            break;
                        case '(':
                            this.addToken(Token_1.Type.PAR_OPEN, char, this.row, this.column);
                            this.column++;
                            break;
                        case ')':
                            this.addToken(Token_1.Type.PAR_CLOSE, char, this.row, this.column);
                            this.column++;
                            break;
                        case ':':
                            this.addToken(Token_1.Type.COLON, char, this.row, this.column);
                            this.column++;
                            break;
                        case ';':
                            this.addToken(Token_1.Type.SEMICOLON, char, this.row, this.column);
                            this.column++;
                            break;
                        case ',':
                            this.addToken(Token_1.Type.COMMA, char, this.row, this.column);
                            this.column++;
                            break;
                        case '"':
                            this.state = 12;
                            this.addCharacter(char); 
                            break;
                        case '#': 
                            if (i === input.length - 1) {
                                console.log("Analyze Finished");
                            }
                            else {
                                this.addError(Token_1.Type.UNKNOW, char, this.row, this.column);
                                this.column++;
                            }
                            break;
                        default: 
                            if (/[a-zA-Z]/.test(char)) { 
                                this.state = 11;
                                this.addCharacter(char);
                            }
                            else if (/\d/.test(char)) { 
                                this.state = 10;
                                this.addCharacter(char);
                            }
                            else { 
                                this.addError(Token_1.Type.UNKNOW, char, this.row, this.column);
                                this.column++;
                            }
                            break;
                    }
                    break;
                case 10: 
                    if (/\d/.test(char)) {
                        this.addCharacter(char);
                    }
                    else {
                        this.addToken(Token_1.Type.NUMBER, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                        i--; 
                    }
                    break;
                case 11: 
                    if (/[a-zA-Z0-9]/.test(char)) {
                        this.addCharacter(char);
                    }
                    else {
                        if (this.reserverdWords.includes(this.auxChar)) {
                            this.addToken(Token_1.Type.RESERVED_WORD, this.auxChar, this.row, this.column - this.auxChar.length);
                        }
                        else {
                            this.addError(Token_1.Type.UNKNOW, this.auxChar, this.row, this.column - this.auxChar.length);
                        }
                        this.clean();
                        i--; 
                    }
                    break;
                case 12: 
                    this.addCharacter(char);
                    if (char === '"') {
                        this.addToken(Token_1.Type.STRING, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                    }
                    else if (i === input.length - 1) {
                        this.addError(Token_1.Type.UNKNOW, this.auxChar, this.row, this.column - this.auxChar.length);
                        this.clean();
                    }
                    break;
            }
        }
        return this.tokenList;
    }
    addCharacter(char) {
        this.auxChar += char;
        this.column++;
    }
    clean() {
        this.state = 0;
        this.auxChar = '';
    }
    addToken(type, lexeme, row, column) {
        this.tokenList.push(new Token_1.Token(type, lexeme, row, column));
    }
    addError(type, lexeme, row, column) {
        this.errorList.push(new Token_1.Token(type, lexeme, row, column));
    }
    getErrorList() {
        return this.errorList;
    }
    getTokenList() {
        return this.tokenList;
    }
}
exports.LexicalAnalyzer = LexicalAnalyzer;
