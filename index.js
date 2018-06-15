const _ = require('lodash')
const table = require('./tables')
module.exports = function(bp) {

  bp.middlewares.load()

  bp.hear(/salir|adios|bye/i, (event, next) => {
    const convo = bp.convo.find(event)
    convo && convo.stop('aborted')
  })

  bp.hear(/hello|hola|hi|iniciar|inicio/i, (event, next) => {
    
    bp.convo.start(event, convo => {

      convo.threads['default'].addMessage('#hi', () => {
        convo.switchTo('start')
        return {}
      })

      convo.createThread('start')
      convo.threads['start'].addQuestion('#start', [
        { 
          pattern: /la tabla del (\d+)|la del (\d+)|(\d+)/i,
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
            convo.say('Opción no valida')
            convo.repeat()
          }
        }
      ])

      table.makeQuestions(convo)

      convo.on('done', () => {
        convo.say(`Terminamos`)
      })

      convo.on('aborted', () => {
        convo.say('Ni modo. ¡Adios!')
      })

    })

  })
}