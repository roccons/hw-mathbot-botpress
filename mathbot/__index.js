module.exports = function(bp) {

    bp.middlewares.load()
    const utterances = {
        good: /good|great|fine|ok|excellent|fantastic/i,
        bad: /bad|sad|not good|not great|bof/i,
        stop: /stop|cancel|abort/i
    }

    const variants = {
        feeling_good: () => _.sample(['Glad to hear that!', 'Fantastic!', 'Yay!']),
        feeling_bad: () => _.sample(['So sorry to hear that', ':('])
    }

    bp.hear(utterances.stop, (event, next) => {
    const convo = bp.convo.find(event)
    convo && convo.stop('aborted')
    })

    bp.hear(/hello/i, (event, next) => {
        console.log('bp', bp)
      const txt = txt => bp.messenger.createText(event.user.id, txt)
    
        bp.convo.start(event, convo => {
    
          convo.threads['default'].addMessage(txt('Hello! This is an example of conversation'))
          convo.threads['default'].addQuestion(txt('How are you?'), [
            { 
              pattern: utterances.good,
              callback: () => {
                convo.set('feeling', 'good')
                convo.say(txt(variants.feeling_good()))
                convo.switchTo('age')
              }
            },
            { 
              pattern: utterances.bad,
              callback: () => {
                convo.set('feeling', 'bad')
                convo.say(txt(variants.feeling_bad()))
                convo.say(txt('Anyway..!'))
                convo.switchTo('age')
              }
            },
            {
              default: true,
              callback: () => {
                // Example of sending a custom message other than text
                const imageMessage = bp.messenger.createAttachment(event.user.id, 'image', 'https://s3.amazonaws.com/botpress-io/images/grey_bg_primary.png')
                convo.say(imageMessage)
    
                // Order of messages are preserved, i.e. this message will show up after the image has been sent
                convo.say(txt('Sorry I dont understand'))
    
                // Repeats the last question / message
                convo.repeat()
              }
            }
          ])
    
          convo.createThread('age')
          convo.threads['age'].addQuestion(txt('What is your age sir?'), [
            {
              pattern: /(\d+)/i,
              callback: (response) => { // Using the response event
                convo.set('age', response.match) // Captured group is stored in event
                convo.say(txt('Got your age. ' + response.match + ' is pretty old!'))
                convo.next()
              }
            },
            {
              default: true,
              callback: () => {
                convo.say(txt('Hrm.. Im expecting a number!'))
                convo.repeat()
              }
            }
          ])
    
          convo.on('done', () => {
            convo.say(txt(`So... you are feeling ${convo.get('feeling')} and you are ${convo.get('age')} years old.`))
            convo.say(txt('This conversation is over now.'))
          })
    
          convo.on('aborted', () => {
            convo.say(txt('You aborted this conversation. Bye!'))
          })
    
        })
    
    })
}