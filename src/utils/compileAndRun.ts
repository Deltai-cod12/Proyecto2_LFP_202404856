import { writeFileSync, unlinkSync } from 'fs';
import { exec } from 'child_process';
import path from 'path';
import os from 'os';

export async function compileAndRun(tsCode: string): Promise<string> {
    // Usar carpeta temporal del sistema
    const tempDir = os.tmpdir();
    const tsFile = path.join(tempDir, 'tempCode.ts');
    const jsFile = path.join(tempDir, 'tempCode.js');

    // Escribir el archivo temporal TypeScript
    writeFileSync(tsFile, tsCode, 'utf8');

    // Compilar el archivo con tsc
    await new Promise<void>((resolve, reject) => {
        exec(`npx tsc ${tsFile}`, (error, stdout, stderr) => {
            if (error) return reject(stderr || error.message);
            resolve();
        });
    });

    // Ejecutar el archivo JavaScript generado
    const output: string = await new Promise((resolve, reject) => {
        exec(`node ${jsFile}`, (error, stdout, stderr) => {
            if (error) return reject(stderr || error.message);
            resolve(stdout);
        });
    });

    // Eliminar los archivos temporales
    try {
        unlinkSync(tsFile);
        unlinkSync(jsFile);
    } catch (e) {
        console.warn('No se pudo borrar archivos temporales:', e);
    }

    return output;
}
