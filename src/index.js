const {
  contentElements,
  contentRenderers,
  actions: builtinActions,
  setup: setupBuiltins
} = require('@botpress/builtins')

const registerCustom = require('./custom')
const helpers = require('./helpers')
const userStats = require('./userStats')
const phrases = require('./phrases')

module.exports = async bp => {
  // This bot template includes a couple of built-in elements and actions
  // Please see the "@botpress/builtins" package to know more
  await registerBuiltin(bp)

  // Register custom actions, elements and renderers
  await registerCustom(bp)

  // Train the NLU model if using the Native NLU Engine
  if (bp.nlu && bp.nlu.provider && bp.nlu.provider.name === 'native') {
    await bp.nlu.provider.sync()
  }

  const webchat = {
    botName: 'Beto',
    botAvatarUrl: 'https://cdn.dribbble.com/users/1210339/screenshots/2773815/einstein.jpg', // You can provide a URL here
    botConvoTitle: 'Beto, the math bot',
    botConvoDescription: 'Beto, el bot matemático',
    backgroundColor: '#B7EAFF',
    textColorOnBackground: '#04080F', // input text
    foregroundColor: '#507DBC', // background user message
    textColorOnForeground: '#FFFFFF' // text color user message
  }

  bp.createShortlink('chat', '/lite', {
    m: 'channel-web',
    v: 'fullscreen',
    options: JSON.stringify({ config: webchat })
  })

  bp.logger.info(`------------`)
  bp.logger.info(`Webchat available at ${bp.botfile.botUrl}/s/chat`)
  bp.logger.info(`------------`)

  ////////////////////////////
  /// Conversation Management
  ////////////////////////////
  bp.hear({ type: /proactive-trigger/i }, async (event, next) => {

    bp.dialogEngine.jumpTo(event.user.id, 'main.flow.json', 'start_bot', { resetState: true }).then(() => {
      const stateId = event.sessionId || event.user.id
      bp.dialogEngine.processMessage(stateId, event)
    })
    
  })

  // All events that should be processed by the Flow Manager
  bp.hear({ type: /bp_dialog_timeout|text|message|quick_reply/i }, (event, next) => {

    const stateId = event.sessionId || event.user.id
    const text = helpers.toOneBlankSpace(event.text)
    const langChanged = languageChanged(text)

    getState(bp, stateId).then(state => {

      if (phrases.wasSaid('help', text)) {
  
        event.reply('#!translated_text-~qze42', { state })
        event.reply('#!translated_text-kyTj5F', { state })
        event.reply('#!translated_text-hlE6gJ', { state })
  
      } else if (phrases.wasSaid('start', text)) {
        
        bp.dialogEngine.endFlow(stateId).then(() => {
          bp.dialogEngine.processMessage(stateId, event)
        })
  
      } else if (phrases.wasSaid('finish', text)) {
        
        userStats.getPercent(event).then(percent => {

          if (percent.percentSuccess && !isNaN(percent.percentSuccess)) {

            event.reply('#!translated_text-0rAYEr', { state })

            if (percent.percentSuccess == 100) {
              event.reply('#!translated_text-7pEMaz', { state })
            }
            if (percent.percentSuccess >= 90 && percent.percentSuccess <= 99) {
              event.reply('#!translated_text-OhzAcx', { state })
            }
            if (percent.percentSuccess >= 60 && percent.percentSuccess <= 89) {
              event.reply('#!translated_text-uMbYlo', { state })
            }
            if (percent.percentSuccess < 59) {
              event.reply('#!translated_text-dTen1D', { state })
            }
          }

          const getBadAnswers = userStats.getBadAnswers(event)
          
          if (getBadAnswers !== null) {
            getBadAnswers.then(badAnswers => {

              const badAns = JSON.parse(badAnswers)
              if (badAns && badAns.length) {
                
                state.badAnswersDesc = badAns.join('\n')

                event.reply('#!translated_text-t0ro09', { state })
              }

            }).catch(err => { console.error(err) })
          }


          event.reply('#!translated_text-p2BjBr', { state })
          event.reply('#!translated_text-0JtOJ2', { state })
          bp.dialogEngine.endFlow(stateId)

        }).catch(err => console.error(err))

  
      } else if (langChanged) {

        state.language = langChanged
        bp.dialogEngine.jumpTo(stateId, 'main.flow.json', 'presentation', { resetState: false }).then(() => {
            bp.dialogEngine.stateManager.setState(stateId, { ...state })
            bp.dialogEngine.processMessage(stateId, event)
          })

      } else {
        bp.dialogEngine.processMessage(stateId, event).then()
      }
    })
  })
}

async function registerBuiltin(bp) {
  await setupBuiltins(bp)

  // Register all the built-in content elements
  // Such as Carousel, Text, Choice etc..
  for (const schema of Object.values(contentElements)) {
    await bp.contentManager.loadCategoryFromSchema(schema)
  }

  await bp.contentManager.recomputeCategoriesMetadata()

  // Register all the renderers for the built-in elements
  for (const renderer of Object.keys(contentRenderers)) {
    bp.renderers.register(renderer, contentRenderers[renderer])
  }

  // Register all the built-in actions
  bp.dialogEngine.registerActions(builtinActions)
}

async function getState (bp, stateId) {
  return await bp.dialogEngine.stateManager.getState(stateId)
}

function languageChanged(text) {
  if (phrases.wasSaid('hiEnglish', text)) {
    return 'En'
  }
  if (phrases.wasSaid('hiSpanish', text)) {
    return 'Es'
  }
  return false
}