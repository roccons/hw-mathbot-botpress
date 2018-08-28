const {
  contentElements,
  contentRenderers,
  actions: builtinActions,
  setup: setupBuiltins
} = require('@botpress/builtins')

const registerCustom = require('./custom')
const helpers = require('./helpers')
const { Client } = require('pg')

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
    botConvoTitle: 'Beto | El bot matemático',
    botConvoDescription: "Beto, tu asistente para practicar las tablas",
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

  const pg = new Client()

  await pg.connect({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT || 5432,
  })

  ////////////////////////////
  /// Conversation Management
  ////////////////////////////
  bp.hear({ type: /proactive-trigger/i }, async (event, next) => {

    console.log('DB', bp.db)

    bp.dialogEngine.jumpTo(event.user.id, 'main.flow.json', 'start_bot', { resetState: true }).then(() => {
      const stateId = event.sessionId || event.user.id
      bp.dialogEngine.processMessage(stateId, event)
    })
    next()
  })

  // All events that should be processed by the Flow Manager
  bp.hear({ type: /bp_dialog_timeout|text|message|quick_reply/i }, (event, next) => {

    const stateId = event.sessionId || event.user.id
    const text = helpers.toOneBlankSpace(event.text)

    if (/help|ayuda|instrucciones|que hago|como se usa|que hacer|aiuda|k hago|k hacer/i.test(text)) {

      const msgHelp1 = event.reply('#!builtin_text-TEctGt')
      const msgHelp2 = event.reply('#!builtin_text-odPDDr')
      const msgHelp3 = event.reply('#!builtin_text-uKjOfa')

    } else if (/hola|reiniciar|inicio|comenzar|reinicio|reset|restart/i.test(text)) {
      
      bp.dialogEngine.endFlow(stateId).then(() => {
        bp.dialogEngine.processMessage(stateId, event)
      })
      
    } else if (/adios|terminar|bye|fin|chao|nos vemos|me voy|hasta mañana|hasta luego|ciao/i.test(text)) {

      const msgEnd = event.reply('#!builtin_text-5eNpIE')
      const msgEnd2 = event.reply('#!builtin_text-bEC23E')
      bp.dialogEngine.endFlow(stateId)

    } else {
      
      bp.dialogEngine.processMessage(stateId, event).then()

    }
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
