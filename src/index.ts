import express from 'express';
import path from 'path';
import analyzeRouter from './routes/analyze.route';

const app = express();
const PORT = 3000;

// Configuracion de vistas EJS
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Archivos estaticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para procesar formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas
app.use(analyzeRouter);

// Servidor
app.listen(PORT, () => {
    console.log(` Servidor corriendo en http://localhost:${PORT}`);
});