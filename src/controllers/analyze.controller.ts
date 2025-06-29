import { Request, Response } from 'express';
import { LexicalAnalyzer } from '../Analyzer/LexicalAnalyzer';
import { SyntaxAnalyzer } from '../Analyzer/SyntaxAnalyzer';
import { Token, Type } from '../Analyzer/Token';

// Almacenamos los últimos errores para el reporte
let lastLexicalErrors: { fila: number; columna: number; lexema: string; token: string }[] = [];
let lastSyntaxErrors: { fila: number; columna: number; lexema: string; token: string }[] = [];

export const home = (_req: Request, res: Response) => {
    res.render('pages/index', {
        tokens: [],
        lexicalErrors: [],
        syntaxErrors: [],
        codigo: '',
        contador: 0,
        tokenListScript: '<script>window.tokenList = [];</script>'
    });
};

export const analyze = (req: Request, res: Response) => {
    try {
        const input = req.body.txtArea || '';
        const lexicalAnalyzer = new LexicalAnalyzer();

        // Análisis léxico
        const tokenList = lexicalAnalyzer.scanner(input);
        const rawLexicalErrorList = lexicalAnalyzer.getErrorList();

        // Guardamos errores léxicos para el reporte
        lastLexicalErrors = rawLexicalErrorList.map((errorToken: Token) => ({
            fila: errorToken.getRow(),
            columna: errorToken.getColumn(),
            lexema: errorToken.getLexeme(),
            token: errorToken.getTypeTokenString()
        }));

        // Filtrar tokens válidos para análisis sintáctico
        const validTokens = tokenList.filter(token => token.getType() !== Type.UNKNOWN);

        // Análisis sintáctico solo si no hay errores léxicos
        let syntaxErrors: { fila: number; columna: number; lexema: string; token: string }[] = [];
        if (lastLexicalErrors.length === 0) {
            const syntaxAnalyzer = new SyntaxAnalyzer(validTokens); // ahora recibe Token[]
            syntaxAnalyzer.parse(); // ya no necesita el input como argumento

            syntaxErrors = syntaxAnalyzer.getErrorList().map(errorToken => ({
                fila: errorToken.getRow(),
                columna: errorToken.getColumn(),
                lexema: errorToken.getLexeme(),
                token: errorToken.getTypeTokenString()
            }));

            lastSyntaxErrors = syntaxErrors;
        } else {
            lastSyntaxErrors = [{
                fila: -1,
                columna: -1,
                lexema: 'Error',
                token: 'No se realizó análisis sintáctico por errores léxicos'
            }];
        }

        // Preparamos tokens para la vista
        const tokensToSend = tokenList.map(token => ({
            fila: token.getRow(),
            columna: token.getColumn(),
            lexema: token.getLexeme(),
            token: token.getTypeTokenString()
        }));

        res.render('pages/index', {
            tokens: tokensToSend,
            lexicalErrors: lastLexicalErrors,
            syntaxErrors: lastSyntaxErrors,
            codigo: input,
            contador: tokensToSend.length,
            tokenListScript: `<script>window.tokenList = ${JSON.stringify(tokensToSend)};</script>`
        });

    } catch (error) {
        console.error('Error en el análisis:', error);
        res.render('pages/index', {
            tokens: [],
            lexicalErrors: [],
            syntaxErrors: [{
                fila: -1,
                columna: -1,
                lexema: 'Error interno',
                token: (error as Error).message
            }],
            codigo: req.body.txtArea || '',
            contador: 0,
            tokenListScript: '<script>window.tokenList = [];</script>'
        });
    }
};

export const errorReport = (_req: Request, res: Response) => {
    res.render('pages/errores', {
        erroresLexicos: lastLexicalErrors,
        erroresSintacticos: lastSyntaxErrors
    });
};
