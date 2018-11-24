const _ = require('lodash')

/**
 * This is necesary if you want to alternate answers
 */
module.exports = {
    builtin_text: data => {
      const text = _.sample([data.text, ...(data.variations || [])])
  
        return { text: text, typing: !!data.typing }
      },

      '#translated_text': data => {
        const language = data.state.language || 'Es'
        const text = _.sample([data[`text${language}`], ...(data[`variations${language}`] || [])])
        return [
          {
            typing: !!data.typing,
            markdown: true,
            text: text
          }
        ]
      }
  }
