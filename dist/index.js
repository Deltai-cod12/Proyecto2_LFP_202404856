"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const analyze_route_1 = __importDefault(require("./routes/analyze.route"));
const app = (0, express_1.default)();
const PORT = 3000;
// Configuracion de vistas EJS
app.set('views', path_1.default.join(__dirname, '../views'));
app.set('view engine', 'ejs');
// Archivos estaticos
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Middleware para procesar formularios
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// Rutas
app.use(analyze_route_1.default);
// Servidor
app.listen(PORT, () => {
    console.log(` Servidor corriendo en http://localhost:${PORT}`);
});
