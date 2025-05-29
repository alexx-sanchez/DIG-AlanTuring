function cambiarIdioma(lang) {
    if (lang === 'es') {
        // Elimina la preferencia para evitar bucle infinito
        localStorage.removeItem('idiomaSeleccionado');
        location.reload();
        return;
    }

    // Guarda idioma solo si es distinto al original
    localStorage.setItem('idiomaSeleccionado', lang);

    if (!window.google || !window.google.translate) {
        const script = document.createElement('script');
        script.src = `https://translate.google.com/translate_a/element.js?cb=inicializarTraductor`;
        document.head.appendChild(script);
    } else {
        aplicarTraduccion(lang);
    }
}

function inicializarTraductor() {
    const lang = localStorage.getItem('idiomaSeleccionado') || 'es';
    aplicarTraduccion(lang);
}

function aplicarTraduccion(lang) {
    new google.translate.TranslateElement({
        pageLanguage: 'es',
        includedLanguages: 'en,ca,es',
        layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL
    }, 'google_translate_element');

    if (lang !== 'es') {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = lang;
            select.dispatchEvent(new Event('change'));
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const lang = localStorage.getItem('idiomaSeleccionado');
    if (lang) {
        document.getElementById('languageSelector').value = lang;
        cambiarIdioma(lang); // Solo si hay idioma guardado
    }
});