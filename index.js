const _ = require('lodash')
const table = require('./tables.js')
module.exports = function(bp) {

  table.bp = bp

  bp.hear(/salir|adios|bye/i, (event, next) => {
    const convo = bp.convo.find(event)
    convo && convo.stop('aborted')
  })

  bp.hear(/hola|hi|iniciar|inicio/i, (event, next) => {
    
    let lastTable = table.getLastTable(event)

    bp.convo.start(event, convo => {

      if (lastTable !== null) {
        convo.threads['default'].addMessage('#hiAgain', () => {
          console.log('lasttable', lastTable)
          convo.switchTo('startAgain')
          return {}
        })
      } else {
        convo.threads['default'].addMessage('#hi', () => {
          convo.switchTo('start')
          return {}
        })
      }

      convo.createThread('startAgain')
      convo.threads['startAgain'].addQuestion('#askContinue', { lastTable: lastTable }, [
        {
          pattern: /si|por supuesto|claro|asi es|ok/i,
          callback: response => {
            convo.say('#continue')
            if (lastTable !== null) {
              convo.switchTo(`table${lastTable}{1}`)
            } else {
              convo.switchTo('start')
            }
          }
        },
        {
          pattern: /no/i,
          callback: response => {
            convo.switchTo('start')
          }
        }
      ])

      convo.createThread('start')
      convo.threads['start'].addQuestion('#start', [
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
            convo.say('Opción no valida')
            convo.repeat()
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