import { Request, Response } from "express";
import { LexicalAnalyzer } from "../Analyzer/LexicalAnalyzer";
import { Token } from "../Analyzer/Token";
import { SyntacticAnalyzer } from "../Analyzer/SyntacticAnalyzer";
import { Error } from "../Analyzer/Error";
import { Transpiler } from "../Analyzer/Transpiler";
import { Instruction } from "../models/abstract/Instruction";
import { compileAndRun } from "../utils/compileAndRun";

    export const home = (req: Request, res: Response) => {
    res.render('pages/index');
    }

    export const analyze = async (req: Request, res: Response) => {
    const body = req.body;

    const scanner: LexicalAnalyzer = new LexicalAnalyzer();
    const tokenList: Token[] = scanner.scanner(body);

    const parser = new SyntacticAnalyzer(tokenList);
    parser.parser();

    const errorParser: Error[] = parser.getErrors();

    let code = '';
    let output = '';

    if (errorParser.length === 0) {
        const transpiler = new Transpiler(tokenList);
        transpiler.parser();

        transpiler.getInstructions().forEach((instruction: Instruction) => {
        code += instruction.transpiler();
        });

        try {
        output = await compileAndRun(code);
        } catch (err) {
        output = `Error en compilación o ejecución: ${err}`;
        }
    }

    res.json({
        tokens: tokenList,
        errors: scanner.getErrorList(),
        syntacticErrors: errorParser,
        traduction: code,
        colors: scanner.getColors(),
        output: output
    });
    }
