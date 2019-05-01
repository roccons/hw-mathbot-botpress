module.exports = {
    phrases: {

        hiSpanish: [
            'hola', 'español', 'spanish', 'espanol'
        ],

        hiEnglish: [
            'hi', 'hello', 'english', 'ingles', 'inglés'
        ],

        help: [
            'ayuda', 'instrucciones', 'que hago', 'como se usa', 'que hacer', 
            'aiuda', 'k hago', 'k hacer', 'help', 'instructions', 
            'what do i do', 'how do it works', 'what to do',
        ],
        
        start: [
            'reiniciar', 'inicio', 'comenzar', 
            'reinicio', 'reset', 'restart', 'start'
        ],

        finish: [
            'adios', 'adiós', 'terminar', 'fin', 'chao', 'nos vemos', 'me voy', 
            'hasta mañana', 'ciao', 'chaito',
            'bye', 'see you', 'finish', 'end',
        ],

        dontKnow: [
            'dont know', 'don"t know', 'don\'t know', 'idk', 'give up', 'pax', 'other',
            'no more', 'no', 'enough', 'skip',
            'no se', 'me rindo', 'otra', 'ya no', 'no más', 'no mas', 'ya', 'no', 'basta',
            'suficiente', 'paso', 'saltar'
        ],

        surprise: [
            'sorpresa', 'surprise'
        ],

        changeTable: [
            'times table', 'table of', 'la del', 'tabla del'
        ],

        yes: [
            'yes', 'of course', 'yep', 'ok', 'okay', 'o.k.',
            'si', 'sí', 'claro', 'por supuesto', 'de acuerdo', 'esta bien'
        ],

        no: [
            'not', 'no', 'dont', "don't",
            'en otra ocasión', 'en otra ocasion', 'para la otra'
        ]
    },

    wasSaid (say, text) {
        return new RegExp(this.phrases[say].join('|'), 'i').test(text.toLowerCase())
    }
}
