"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extraerPensum = extraerPensum;
function extraerPensum(texto) {
    const carreraMatch = texto.match(/Carrera:\s*"([^"]+)"/);
    const carrera = carreraMatch ? carreraMatch[1] : "Desconocida";
    const semestresEncontrados = [];
    const semestreStartRegex = /Semestre:\s*(\d+)\s*{/g;
    let currentSemestreMatch;
    let lastIndex = 0;
    while ((currentSemestreMatch = semestreStartRegex.exec(texto)) !== null) {
        const semestreNumero = currentSemestreMatch[1];
        const semestreStartIndex = currentSemestreMatch.index + currentSemestreMatch[0].length;
        let braceCount = 1;
        let semestreEndIndex = -1;
        for (let i = semestreStartIndex; i < texto.length; i++) {
            if (texto[i] === '{')
                braceCount++;
            else if (texto[i] === '}')
                braceCount--;
            if (braceCount === 0) {
                semestreEndIndex = i;
                break;
            }
        }
        if (semestreEndIndex !== -1) {
            const cuerpoSemestre = texto.substring(semestreStartIndex, semestreEndIndex);
            const cursos = [];
            const cursoRegex = /Curso:\s*(\d+)\s*{([\s\S]*?)}/g;
            let cursoMatch;
            while ((cursoMatch = cursoRegex.exec(cuerpoSemestre)) !== null) {
                const codigo = cursoMatch[1];
                const cuerpoCurso = cursoMatch[2];
                const nombreMatch = cuerpoCurso.match(/Nombre:\s*"([^"]+)"/);
                const areaMatch = cuerpoCurso.match(/Area:\s*(\d+)/);
                const prerrequisitosMatch = cuerpoCurso.match(/Prerrequisitos:\s*\(([^)]*)\)/);
                const nombre = nombreMatch ? nombreMatch[1] : "Sin nombre";
                const area = areaMatch ? areaMatch[1] : "0";
                const prerrequisitos = prerrequisitosMatch
                    ? prerrequisitosMatch[1].split(',').map(p => p.trim()).filter(p => p !== '')
                    : [];
                cursos.push({ codigo, nombre, area, prerrequisitos });
            }
            semestresEncontrados.push({ numero: semestreNumero, cursos });
            semestreStartRegex.lastIndex = semestreEndIndex + 1;
        }
        else {
            console.error(`Error: Semestre ${semestreNumero} no tiene llave de cierre.`);
            break;
        }
    }
    return { carrera, semestres: semestresEncontrados };
}
