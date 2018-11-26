module.exports = {
    id : 'translated_text',
    title: 'Translated Text',
    renderer: '#translated_text',
    jsonSchema: {
        title: 'Text Message',
        description: 'A normal text message with translation',
        type: 'object',
        required: ['textEn', 'textEs'],
        properties: {
            textEn: { type: 'string', title: 'Text (English)' },
            textEs: { type: 'string', title: 'Text (Spanish)' },
            variationsEn: {
                type: 'array',
                title: 'Alternates English (optional)',
                items: {
                    type: 'string',
                    default: ''
                }
            },
            variationsEs: {
                type: 'array',
                title: 'Alternates Spanish (optional)',
                items: {
                    type: 'string',
                    default: ''
                }
            },
        }
    },
    uiSchema: {
        textEn: {
            'ui:widget': 'textarea' 
        },
        textEs: {
            'ui:widget': 'textarea' 
        }
    },
    computeFormData: formData => formData,
    computeData: formData => formData,
    computePreviewText: formData => formData.textEn + '/' + formData.textEs,
    computeMetadata: null
}