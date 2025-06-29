"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPensum = exports.errorReport = exports.analyze = exports.home = void 0;
const LexicalAnalyzer_1 = require("../Analyzer/LexicalAnalyzer");
const PensumParser_1 = require("../Analyzer/PensumParser");
let lastLexicalErrors = [];
const home = (_req, res) => {
    res.render('pages/index', {
        tokens: [],
        errors: [],
        codigo: '',
        contador: 0
    });
};
exports.home = home;
const analyze = (req, res) => {
    const input = req.body.txtArea || '';
    const pensumExtraido = (0, PensumParser_1.extraerPensum)(input);
    const lexicalAnalyzer = new LexicalAnalyzer_1.LexicalAnalyzer();
    const tokenList = lexicalAnalyzer.scanner(input);
    const rawErrorList = lexicalAnalyzer.getErrorList();
    lastLexicalErrors = rawErrorList.map((errorToken) => ({
        fila: errorToken.getRow(),
        columna: errorToken.getColumn(),
        lexema: errorToken.getLexeme(),
        token: errorToken.getTypeTokenString()
    }));
    const tokensToSend = tokenList.map(token => ({
        fila: token.getRow(),
        columna: token.getColumn(),
        lexema: token.getLexeme(),
        token: token.getTypeTokenString()
    }));
    res.render('pages/index', {
        tokens: tokensToSend,
        errors: rawErrorList,
        codigo: input,
        contador: tokensToSend.length,
        carrera: pensumExtraido.carrera,
        semestres: pensumExtraido.semestres,
        tokenListScript: `<script>window.tokenList = ${JSON.stringify(tokensToSend)};</script>`
    });
};
exports.analyze = analyze;
const errorReport = (_req, res) => {
    res.render('pages/errores', {
        erroresLexicos: lastLexicalErrors
    });
};
exports.errorReport = errorReport;
const renderPensum = (req, res) => {
    const input = req.body.txtArea || '';
    const { carrera, semestres } = (0, PensumParser_1.extraerPensum)(input);
    res.render('pages/pensum', {
        carrera,
        semestres
    });
};
exports.renderPensum = renderPensum;
