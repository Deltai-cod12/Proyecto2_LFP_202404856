document.addEventListener('DOMContentLoaded', () => {

    const button = document.getElementById('analyze');
    const editor = document.getElementById('editor');
    const salida = document.getElementById('salida');
    const consoleOut = document.getElementById('console_output');
    const table = document.getElementById('tokens');
    const tableError = document.getElementById('errors');
    const tableSyntactic = document.getElementById('syntacticErrors');
    const clear = document.getElementById('clear');
    const open = document.getElementById('open');
    const save = document.getElementById('save');

    clear.addEventListener('click', () => {
        editor.innerHTML = '';
        salida.innerText = '';
        consoleOut.innerText = '';
        table.innerHTML = '';
        tableError.innerHTML = '';
        tableSyntactic.innerHTML = '';
    });

    open.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = ".cs";
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    editor.innerText = e.target.result;
                }
                reader.readAsText(file);
            }
            fileInput.remove();
        });
        fileInput.click();
    });

    save.addEventListener('click', () => {
        const download = document.createElement('a');
        download.href = `data:text/plain;charset=utf-8,${encodeURIComponent(editor.innerText)}`;
        download.download = "archivo.cs";
        download.click();
    });

    button.addEventListener('click', async () => {

        localStorage.clear();

        let response = await fetch('http://localhost:3000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: editor.innerText
        });

        let result = await response.json();

        let textTable = ``;
        let textErrors = ``;
        let textSyntactic = ``;

        result.tokens.forEach((token, index) => {
            textTable += `
            <tr>
                <td>${index + 1}</td>
                <td>${token.typeTokenString}</td>
                <td>${token.lexeme}</td>
                <td>${token.row}</td>
                <td>${token.column}</td>
            </tr>`;
        });

        result.errors.forEach((error, index) => {
            textErrors += `
            <tr>
                <td>${index + 1}</td>
                <td>${error.typeTokenString}</td>
                <td>${error.lexeme}</td>
                <td>${error.row}</td>
                <td>${error.column}</td>
            </tr>`;
        });

        result.syntacticErrors.forEach((error, index) => {
            textSyntactic += `
            <tr>
                <td>${index + 1}</td>
                <td>${error.lexeme}</td>
                <td>${error.description}</td>
                <td>${error.row}</td>
                <td>${error.column}</td>
            </tr>`;
        });

        table.innerHTML = textTable;
        tableError.innerHTML = textErrors;
        tableSyntactic.innerHTML = textSyntactic;
        editor.innerHTML = result.colors;

        if (result.errors.length === 0 && result.syntacticErrors.length === 0) {
            salida.innerText = result.traduction;
            consoleOut.innerText = result.output.trim(); 
        } else {
            alert('La entrada tiene errores léxicos o sintácticos');
            salida.innerText = '';
            consoleOut.innerText = '';
        }

    });

});
