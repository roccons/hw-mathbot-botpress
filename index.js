const _ = require('lodash')
const table = require('./tables')
module.exports = function(bp) {

  bp.middlewares.load()

  let currentTable = 0;

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
          pattern: /(\d+)|la del (\d+)|la tabla del (\d+)/i,
          callback: (response) => {
            convo.say('#startTable', {
              table: response.match
            })
            convo.set('table', table.generateQuestions(response.match))
            convo.switchTo('table')
          }
        },
        {
          default: true,
          callback: () => {
            convo.say('#startFail')
            convo.repeat()
          }
        }
      ])

      convo.on('done', () => {
        convo.say(`Terminamos`)
      })

      convo.on('aborted', () => {
        convo.say('Ni modo. ¡Adios!')
      })

    })

  })
}