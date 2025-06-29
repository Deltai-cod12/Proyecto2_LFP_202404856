document.addEventListener('DOMContentLoaded', () => {
    const pensumRaw = document.getElementById('pensumContent')?.value;

    if (!pensumRaw) {
        console.warn('No hay contenido de pensum para analizar.');
        return;
    }

    const resultado = extraerPensum(pensumRaw);
    renderizarPensum(resultado);
});

function extraerPensum(texto) {
    const carreraMatch = texto.match(/Carrera:\s*"([^"]+)"/);
    const carrera = carreraMatch ? carreraMatch[1] : "Desconocida";

    const semestres = [];
    const semestreRegex = /Semestre:\s*(\d+)\s*{([\s\S]*?)}(?=\s*Semestre:|\s*})/g;
    let semestreMatch;

    while ((semestreMatch = semestreRegex.exec(texto)) !== null) {
        const numero = semestreMatch[1];
        const cuerpoSemestre = semestreMatch[2];

        const cursos = [];
        const cursoRegex = /Curso:\s*(\d+)\s*{([\s\S]*?Nombre:\s*"([^"]+)";[\s\S]*?Area:\s*(\d+);[\s\S]*?Prerrequisitos:\s*\(([^)]*)\);[\s\S]*?)}/g;
        let cursoMatch;

        while ((cursoMatch = cursoRegex.exec(cuerpoSemestre)) !== null) {
            const codigo = cursoMatch[1];
            const nombre = cursoMatch[3];
            const area = cursoMatch[4];
            const prerrequisitos = cursoMatch[5]
                .split(',')
                .map(p => p.trim())
                .filter(p => p !== '');

            cursos.push({ codigo, nombre, area, prerrequisitos });
        }

        semestres.push({ numero, cursos });
    }

    return { carrera, semestres };
}

function renderizarPensum(pensum) {
    const contenedor = document.getElementById('pensumResultado');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    const titulo = document.createElement('h2');
    titulo.textContent = `Carrera: ${pensum.carrera}`;
    contenedor.appendChild(titulo);

    const grid = document.createElement('div');
    grid.classList.add('pensum-grid');

    // Encabezados de semestre
    pensum.semestres.forEach(sem => {
        const header = document.createElement('div');
        header.classList.add('semestre-header');
        header.textContent = `Semestre ${sem.numero}`;
        grid.appendChild(header);
    });

    // Cursos
    pensum.semestres.forEach(sem => {
        sem.cursos.forEach(curso => {
            const slot = document.createElement('div');
            slot.classList.add('course-slot');

            const card = document.createElement('div');
            card.classList.add('course-card');
            card.id = `curso-${curso.codigo}`;
            card.setAttribute('data-codigo', curso.codigo);
            card.setAttribute('data-prerequisitos', JSON.stringify(curso.prerrequisitos));

            card.innerHTML = `
                <span class="course-code">${curso.codigo}</span>
                <span class="course-name">${curso.nombre}</span>
                <span class="prerequisites">
                    ${curso.prerrequisitos.length > 0 ? curso.prerrequisitos.join(', ') : 'Sin prerrequisitos'}
                </span>
            `;

            // Evento click corregido
            card.addEventListener('click', () => {
                // Limpiar todos los resaltados previos
                document.querySelectorAll('.course-card').forEach(c => {
                    c.classList.remove('prereq-activo');
                });

                const prereqRaw = card.getAttribute('data-prerequisitos');
                let prereqList = [];
                try {
                    prereqList = JSON.parse(prereqRaw);
                } catch (err) {
                    console.error("Error al parsear prerrequisitos", err);
                }

                prereqList.forEach(codigo => {
                    const target = document.getElementById(`curso-${codigo}`);
                    if (target) {
                        target.classList.add('prereq-activo');
                    }
                });
            });

            slot.appendChild(card);
            grid.appendChild(slot);
        });
    });

    contenedor.appendChild(grid);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => {
            // Quitar clase activa a todos
            document.querySelectorAll('.course-card').forEach(c => c.classList.remove('prereq-activo'));

            // Obtener prerrequisitos del curso clickeado
            const prereqs = JSON.parse(card.getAttribute('data-prerrequisitos'));

            // Resaltar prerrequisitos si existen
            prereqs.forEach(pr => {
                const prereqCard = document.getElementById(`curso-${pr}`);
                if (prereqCard) {
                    prereqCard.classList.add('prereq-activo');
                }
            });
        });
    });
});
