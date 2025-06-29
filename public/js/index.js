document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const archivoMenu = document.getElementById('archivoMenu');
    const editor = document.getElementById('editor');
    const formPensum = document.getElementById('formPensum');
    const inputPensum = document.getElementById('pensumContent');
    const formAnalizar = document.querySelector('form[action="/analyze"]');
    const inputAnalizar = document.getElementById('txtAreaHidden');
    const formErrores = document.getElementById('formErrores');

    // Estado para controlar el contenido
    let originalContent = '';
    let isHighlighted = false;

    // Manejo del menu Archivo
    archivoMenu.addEventListener('change', () => {
        const opcion = archivoMenu.value;

        if (opcion === 'limpiar') {
            editor.innerHTML = '';
            originalContent = '';
            isHighlighted = false;
        } else if (opcion === 'cargar') {
            fileInput.click();
        } else if (opcion === 'guardar') {
            prepareContentForSubmission();
            const textoPlano = originalContent || editor.textContent;
            const blob = new Blob([textoPlano], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'archivo.plfp';
            a.click();
        }

        archivoMenu.selectedIndex = 0;
    });

    // Cargar contenido del archivo seleccionado
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.plfp')) {
            alert('Solo se permiten archivos con extensión .plfp');
            fileInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            originalContent = event.target.result;
            editor.textContent = originalContent;
            applyFullSyntaxHighlighting();
        };
        reader.readAsText(file);
    });

    // Preparar contenido para formularios
    function prepareContentForSubmission() {
        if (isHighlighted) {
            // Sacamos el HTML y dejamos solo texto plano
            editor.textContent = originalContent;
            isHighlighted = false;
        }
    }

    // Enviar contenido a los formularios
    formPensum.addEventListener('submit', function() {
        prepareContentForSubmission();
        inputPensum.value = editor.textContent;
    });

    formAnalizar.addEventListener('submit', function() {
        prepareContentForSubmission();
        inputAnalizar.value = editor.textContent;
    });

    formErrores.addEventListener('submit', function() {
        prepareContentForSubmission();
    });

    // Coloreado por patrones básicos (fallback)
    function applyFullSyntaxHighlighting() {
        if (!originalContent && editor.textContent) {
            originalContent = editor.textContent;
        }

        const code = originalContent || editor.textContent;
        if (!code) return;

        const keywords = [
            'using', 'namespace', 'class', 'public', 'private', 'protected', 'static', 
            'void', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 
            'break', 'continue', 'true', 'false', 'int', 'string', 'bool', 'double', 
            'float', 'char', 'decimal', 'const', 'new', 'this', 'base', 'var'
        ];

        const patterns = [
            {
                regex: new RegExp(`\\b(${keywords.join('|')})\\b`, 'g'),
                class: 'token-reserved'
            },
            {
                regex: /"[^"]*"/g,
                class: 'token-string'
            },
            {
                regex: /'[^']'/g,
                class: 'token-char'
            },
            {
                regex: /\b\d+(\.\d+)?\b/g,
                class: 'token-number'
            },
            {
                regex: /\/\/.*|\/\*[\s\S]*?\*\//g,
                class: 'token-comment'
            },
            {
                regex: /{|}|\(|\)|\[|\]/g,
                class: 'token-brace'
            },
            {
                regex: /;|,|:|\./g,
                class: 'token-punctuation'
            },
            {
                regex: /==|!=|<=|>=|<|>|=|\+|-|\*|\/|%/g,
                class: 'token-operator'
            }
        ];

        let highlightedCode = escapeHtml(code);
        patterns.forEach(pattern => {
            highlightedCode = highlightedCode.replace(
                pattern.regex, 
                `<span class="${pattern.class}">$&</span>`
            );
        });

        editor.innerHTML = highlightedCode;
        isHighlighted = true;
    }

    // Nueva función para colorear basado en tokens con posición y sin solapamientos
    function applyTokenBasedHighlighting() {
        if (!window.tokenList || !Array.isArray(window.tokenList)) return;

        // Ordenar tokens por fila y columna para reconstruir el texto
        window.tokenList.sort((a, b) => (a.fila - b.fila) || (a.columna - b.columna));

        let highlightedHtml = '';
        let currentLine = 1;
        let currentCol = 1;

        window.tokenList.forEach(token => {
            // Insertar saltos de línea si el token está en una línea nueva
            while (currentLine < token.fila) {
                highlightedHtml += '\n';
                currentLine++;
                currentCol = 1;
            }

            // Insertar espacios si el token no está justo después del anterior
            while (currentCol < token.columna) {
                highlightedHtml += ' ';
                currentCol++;
            }

            const cls = getClassForToken(token.token);
            const escapedLexeme = escapeHtml(token.lexema);
            highlightedHtml += `<span class="${cls}">${escapedLexeme}</span>`;

            // Actualizar columna actual
            currentCol += token.lexema.length;
        });

        editor.innerHTML = highlightedHtml;
        isHighlighted = true;
    }

    function getClassForToken(tokenType) {
        const tokenClasses = {
            'PAR_OPEN': 'token-paren',
            'PAR_CLOSE': 'token-paren',
            'BRACE_OPEN': 'token-brace',
            'BRACE_CLOSE': 'token-brace',
            'BRACKET_OPEN': 'token-bracket',
            'BRACKET_CLOSE': 'token-bracket',
            'COLON': 'token-colon',
            'SEMICOLON': 'token-semicolon',
            'COMMA': 'token-comma',
            'NUMBER': 'token-number',
            'STRING': 'token-string',
            'RESERVED_WORD': 'token-reserved',
            'UNKNOW': 'token-error',
            'BOOLEAN': 'token-boolean',
            'CHAR': 'token-char',
            'ASSIGN': 'token-operator',
            'PLUS': 'token-operator',
            'MINUS': 'token-operator',
            'MULTIPLY': 'token-operator',
            'DIVIDE': 'token-operator',
            'EQUAL': 'token-operator',
            'NOT_EQUAL': 'token-operator',
            'LESS': 'token-operator',
            'GREATER': 'token-operator',
            'LESS_EQUAL': 'token-operator',
            'GREATER_EQUAL': 'token-operator'
        };
        return tokenClasses[tokenType] || '';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Aplicar el coloreado apropiado al cargar
    if (window.tokenList && Array.isArray(window.tokenList) && window.tokenList.length > 0) {
        applyTokenBasedHighlighting();
    } else if (editor.textContent.trim().length > 0) {
        originalContent = editor.textContent;
        applyFullSyntaxHighlighting();
    }

    // Evento para actualizar contenido mientras se escribe (sin colorear en vivo)
    editor.addEventListener('input', function() {
        if (!isHighlighted) {
            originalContent = editor.textContent;
        }
    });
});
