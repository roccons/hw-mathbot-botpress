const {
  contentElements,
  contentRenderers,
  actions: builtinActions,
  setup: setupBuiltins
} = require('@botpress/builtins')

const registerCustom = require('./custom')

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
    botName: 'MathBot',
    botAvatarUrl: 'https://cdn.pixabay.com/photo/2016/03/31/19/57/albert-1295413_960_720.png', // You can provide a URL here
    botConvoTitle: 'MathBot',
    botConvoDescription: "Hello, I'm MathBot",
    backgroundColor: '#BBD1EA',
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

  // All events that should be processed by the Flow Manager
  bp.hear({ type: /bp_dialog_timeout|text|message|quick_reply/i }, (event, next) => {

    const stateId = event.sessionId || event.user.id

    // const messageSent = event.reply('#builtin_text-TtzrCV')

    if (/help|ayuda|instrucciones/i.test(event.text)) {
      bp.dialogEngine.jumpTo(stateId, 'Help.flow.json', 'Help') 
      bp.dialogEngine.processMessage(event.sessionId || event.user.id, event)
    } else
    if (/reiniciar|inicio|comenzar/i.test(event.text)) {

    } else
    if (/adios|terminar|bye|fin/i.test(event.text)) {
    } else if (/no se|otra|me rindo|ya no|nose|yano/i.test(event.text)) {
    
    } else {
      bp.dialogEngine.processMessage(event.sessionId || event.user.id, event).then()
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
