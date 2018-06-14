const _ = require('lodash')

module.exports = function(bp) {  
  
  bp.hear(/GET_STARTED|hello|hi|test|hey|holla/i, (event, next) => {
    event.reply('#welcome')
  })

  bp.hear(/^question$/i, (event, next) => {
    bp.contentManager.listCategoryItems('trivia')
    .then(items => {
      const random = _.first(_.shuffle(items))  
      event.reply('#!' + random.id)
    })
  })

  bp.hear(/TRIVIA_GOOD/i, (event, next) => {
    event.reply('#trivia-good')
  })

  bp.hear(/TRIVIA_BAD/i, (event, next) => {
    event.reply('#trivia-bad')
  })

  bp.fallbackHandler = (event, next) => {
    if (event.type === 'message' || event.type === 'text') {
      event.reply('#fallback')
    }
  }
}

/* *****************************
module.exports = function (bp) {

  bp.hear(/GET_STARTED|hello|hola|hi|test|holis/i, (event, next) => {
    event.reply('#welcome')
  })

  bp.hear(/PRIMERA|primera|ok|sale|lanzala|preguntame/i, (event, next) => {
    event.reply('#first')
  })

  bp.hear(/6|seis/i, (event, next) => {
    event.reply('#answerfisrt')
  })

  bp.hear(/[\d!\6]|[\w!seis]/i, (event, next) => {
    event.reply('#answerfisrterror')
  })
  */

  ///---------------------------------------------------------
  // bp.hear(/^question$/i, (event, next) => {
  //   bp.contentManager.listCategoryItems('multiplication')
  //   .then(items => {
  //     const random = items[Math.floor(Math.random() * items.length)][0]
  //     event.reply('#!' + random.id)
  //   })
  // })

  // bp.hear({
  //   type: /message|text/i,
  //   text: /ok|preguntame|adelante|sale/i
  // }, (event, next) => {
  //   event.reply('#answer', {
  //     name: 'marco'
  //   })
  // })
// }
/*
  bp.hear(/MULTIPLICATION_GOOD/i, (event, next) => {
    event.reply('#multiplication-good')
  })

  bp.hear(/MULTIPLICATION_BAD/i, (event, next) => {
    event.reply('#multiplication-bad')
  })

  bp.fallbackHandler = (event, next) => {
    if (event.type === 'message' || event.type === 'text') {
      event.reply('#fallback')
    }
  }
  bp.convo.start(event, convo => {
    convo.threads['default'].addQuestion('#askFirst', response => {
      const res = /(\d)/
      if (!res.test(response.text)) {
        convo.repeat()
      }
    })
  })
}
/*
  CONGRATULATIONS on creating your first Botpress bot!

  This is the programmatic entry point of your bot.
  Your bot's logic resides here.
  
  Here's the next steps for you:
  1. Read this file to understand how this simple bot works
  2. Read the `content.yml` file to understand how messages are sent
  3. Install a connector module (Facebook Messenger and/or Slack)
  4. Customize your bot!

  Happy bot building!

  The Botpress Team
  ----
  Getting Started (Youtube Video): https://www.youtube.com/watch?v=HTpUmDz9kRY
  Documentation: https://botpress.io/docs
  Our Slack Community: https://slack.botpress.io
*

module.exports = function(bp) {
  // Listens for a first message (this is a Regex)
  // GET_STARTED is the first message you get on Facebook Messenger
  bp.hear(/GET_STARTED|hello|hi|test|hey|holla/i, (event, next) => {
    event.reply('#welcome') // See the file `content.yml` to see the block
  })

  // You can also pass a matcher object to better filter events
  bp.hear({
    type: /message|text/i,
    text: /exit|bye|goodbye|quit|done|leave|stop/i
  }, (event, next) => {
    event.reply('#goodbye', {
      // You can pass data to the UMM bloc!
      reason: 'unknown'
    })
  })

  bp.hear({
    type: /message|text/i,
    text: /question/i,
  }, (event, next) => {
    event.reply('#question', {
      wich: 'number'
    })
  })
} */