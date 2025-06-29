import { Router } from 'express';
import { home, analyze, errorReport } from '../controllers/analyze.controller';

const analyzeRouter = Router();

// Ruta para la página principal
analyzeRouter.get('/', home);

// Ruta para el análisis completo (léxico y sintáctico)
analyzeRouter.post('/analyze', analyze);

// Ruta para el reporte de errores (léxicos y sintácticos)
analyzeRouter.get('/error-report', errorReport);

export default analyzeRouter;