const _ = require('lodash')
const table = require('./tables.js')
module.exports = function (bp) {

    table.bp = bp

    bp.hear(/salir|adios|adiós|bye/i, (event, next) => {
        const convo = bp.convo.find(event)
        convo && convo.stop('aborted')
    })

    bp.hear(/hola|hi|iniciar|inicio|reiniciar|otra vez|hello|hallo/i, (event, next) => {

        bp.convo.start(event, convo => {

            convo.threads['default'].addMessage('#hi', () => {
                convo.switchTo('startPractice')
                return {}
            })
        
            convo.createThread('startPractice')
            convo.threads['startPractice'].addQuestion('#startPractice', [
                {
                    pattern: /del (\d+)|(\d+)/i,
                    callback: response => {

                        const numberSelected = response.text.match(/\d+/)[0]

                        if (numberSelected > 0 && numberSelected <= 10) {

                            const operand = Math.floor(Math.random() * 10) + 1

                            convo.say('#startTable', {
                                table: numberSelected
                            })
                            convo.switchTo(`table${numberSelected}${operand}`)
                        } else {
                            convo.say('#startFail')
                        }

                    }
                },

                {
                    default: true,
                    callback: () => {
                        convo.switchTo('default')
                    }
                }
            ])

            table.makeQuestions(bp, convo)

            convo.on('done', () => {
                convo.say('#bye')
            })

            convo.on('aborted', () => {
                convo.say('#bye')
            })

        })

    })

}