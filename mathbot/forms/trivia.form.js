module.exports = {
    id: 'multiplication',
    title: 'Tabla del 3',
    ummBloc: '#multiplication-table',

    jsonSchema: {
        "title": "Tabla de multiplicar",
        "description": "Pregunta las tablas de multiplicar",
        "type": "object",
        "required": [
            "question", "good", "bad"
        ],
        "properties": {
            "question": {
                "type": "string",
                "title": "Question"
            },
            "good": {
                "title": "Good answer",
                "type": "array",
                "items": {
                    "type": "string",
                    "default": ""
                }
            },
            "bad": {
                "title": "Bad Answers",
                "type": "array",
                "items": {
                    "type": "string",
                    "default": ""
                }
            }
        }
    },

    uiSchema: {
        "bad": {
            "ui:options": {
                "orderable": false
            }
        }
    },

    computedFormData: formData => {
        const good = formData.good.map(i => ({ payload: 'MULTIPLICATION_GOOD', text: i }))
        const bad = formData.bad.map(i => ({ payload: 'MULTIPLICATION_BAD', text: i }))
        const choices = [...good, ...bad]

        return {
            question: formData.question,
            choices: choices[Matn.floor(Math.random() * choices.length)]
        }
    },

    computedPreviewText: formData => 'Q: ' + formData.question,

    computeMedatada: null
}