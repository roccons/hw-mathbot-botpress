const _ = require('lodash')

module.exports = function(bp) {

  bp.middlewares.load()

  const utterances = {
    good: /good|great|bien|excelente|fantastico|fine|ok|excellent|fantastic/i,
    bad: /bad|sad|not good|not great|bof|mal|maso|mas o menos|queti/i,
    stop: /stop|cancel|abort/i
  }

  const variants = {
    feeling_good: () => _.sample(['¡Excelente!', '¡Genial!', 'Yay!']),
    feeling_bad: () => _.sample(['Que mal', ':('])
  }

  bp.hear(utterances.stop, (event, next) => {
    const convo = bp.convo.find(event)
    convo && convo.stop('aborted')
  })

  bp.hear(/hello/i, (event, next) => {
    
    const txt = txt => txt

    bp.convo.start(event, convo => {

      convo.threads['default'].addQuestion(txt('Hola, bienvenido. ¿Cómo estas?'), [
        { 
          pattern: utterances.good,
          callback: () => {
            convo.set('feeling', 'good')
            convo.say(txt(variants.feeling_good()))
            convo.switchTo('table3')
          }
        },
        { 
          pattern: utterances.bad,
          callback: () => {
            convo.set('feeling', 'bad')
            convo.say(txt(variants.feeling_bad()))
            convo.say(txt('Anyway..!'))
            convo.switchTo('table3')
          }
        },
        {
          default: true,
          callback: () => {
            // Order of messages are preserved, i.e. this message will show up after the image has been sent
            convo.say(txt('Sorry I dont understand'))

            // Repeats the last question / message
            convo.repeat()
          }
        }
      ])

      convo.createThread('table3')
      convo.threads['table3'].addMessage('Ahora voy a preguntarte la tabla del 3')
      convo.threads['table3'].addQuestion('¿Estás listo?', [
        {
          pattern: /claro|ok|si|maso|puesto|creo/i,
          callback: () => {
            convo.say('¡Perfecto!')
            convo.next()
          }
        },
        {
          pattern: /no/i,
          callback: () => {
            convo.say('De igual manera te preguntaré')
            convo.next()
          }
        }
      ])

      convo.threads['table3'].addQuestion('¿Cuánto es 3 x 2?', [
        {
          pattern: /6|seis/i,
          callback: () => {
            convo.say('muy bien'),
            convo.next()
          }
        },
        {
          default: true,
          callback: (response) => {
            console.log(response)
            convo.say(response +  ' no es la respuesta que esperaba 🤔 te pregunto de nuevo')
            convo.repeat()
          }
        }
      ])
      convo.threads['table3'].addQuestion('¿Cuánto es 3 x 3?', [
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

      convo.on('done', () => {
        convo.say(txt(`Terminamos`))
      })

      convo.on('aborted', () => {
        convo.say(txt('Ni modo. ¡Adios!'))
      })

    })

  })
}