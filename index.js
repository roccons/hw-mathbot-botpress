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

      
      /*
      convo.createThread('table')
      convo.threads['table'].addQuestion(), [
        {
          pattern: /5/i,
          callback: () => {
            console.log(convo.get('number'))
            convo.say('muy bien'),
            convo.next()
          }
        },
        {
          default: true,
          callback: (response) => {
            convo.say(response +  ' no es la respuesta que esperaba 🤔 te pregunto de nuevo')
            convo.repeat()
          }
        }
      ])
      convo.threads['table'].addQuestion('¿Cuánto es 3 x 3?', [
        {
          pattern: /9|nueve/i,
          callback: () => {
            convo.say('Has estado estudiando 😉'),
            convo.switchTo('table5')
          }
        },
        {
          default: true,
          callback: (response) => {

            convo.say('mmm nop, ,mejor probemos con otra')
            convo.switchTo('table5')
          }
        }
      ])
      */
      /*
      convo.createThread('table5')
      convo.threads['table5'].addQuestion('¿Cuánto es 5 x 2?', [
        {
          pattern: /10|diez|dies/i,
          callback: () => {
            convo.say('Muy bien 😉'),
            convo.next()
          }
        },
        {
          default: true,
          callback: (response) => {
            convo.say('mmm nop')
            convo.repeat()
          }
        }
      ])
      */
      convo.on('done', () => {
        convo.say(`Terminamos`)
      })

      convo.on('aborted', () => {
        convo.say('Ni modo. ¡Adios!')
      })

    })

  })
}