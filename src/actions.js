/**
 * Create a question to ask with its answer
 */
async function tableQuestion(state, event, params) {

  const operando = state.$op2 || Math.floor(Math.random() * 10 + 1)

  const op1 = state.$op1 && state.$op1 > 0 && state.$op1 <= 12
            ? state.$op1 : null
            
  return {
    ...state,
    $op1: op1  || getNumberFromText(state.$tableNumber),
    $op2: operando,
    toChange: false,
    finish: false,
    answer: operando * getNumberFromText(state.$tableNumber),

  }
}

/**
 * Check if the answer given is correct.
 */
async function checkAnswer(state, event, params) {

  if (/la del|tabla del/i.test(event.text)) {
    return {
      ...state,
      toChange: true,
      $op1: parseInt(getNumberFromText(event.text)),
      changeTable: false
    }
  }
  if (/no se|me rindo|otra|ya no/i.test(event.text)) {
    return {
      ...state,
      changeTable: true
    }
  }

  const resp = parseInt(getNumberFromText(event.text))
  return {
    ...state,
    isCorrect: resp === state.$op1 * state.$op2,
    sayHelp: state.isCorrect ? 0 : (state.sayHelp ? state.sayHelp + 1 : 1),
    changeTable: false
  }
}

/**
 * Get a random number for the next question.
 */
function getRndNumber(number) {
  let operando = Math.floor(Math.random() * 10 + 1)
  while (number === operando) {
    operando = Math.floor(Math.random() * 10 + 1)
  }
  return operando;
}

/**
 * Get a number given inside a string
 * @param {string} text 
 */
function getNumberFromText(text) {
  if (text.match(/(\d+)/)) {
    return text.match(/(\d+)/)[0]
  }
  return null
}

/**
 * Get next table number to practice
 */
async function nextQuestion(state, event, params) {

  let nextNumber = getRndNumber(state.$op2) 

  if (nextNumber == 1 || nextNumber == 10) {
    nextNumber = getRndNumber(state.$op2)
  }

  return {
    ...state,
    $op1: getNumberFromText(state.$tableNumber),
    $op2: nextNumber,
    
  }
}

/**
 * Avoid change to another table number
 */
function notChange(state, event, params) {
  return {
    ... state,
    toChange : false,
    
  }
}

function changeTableNumber(state, event, params) {
  return {
    ...state,
    $op2: getRndNumber(state.$op2 || 1).toString()
  }
}

async function sayInitialHelp(state, event, params) {

  if (!state.started) {
    const msg2 = event.reply('#!builtin_text-pAytKD')
  }

  return {
    ...state,
    started: true
  }
}

async function badAnswer(state, event, params) {

  event.reply(
    isNaN(event.text) 
    ? '#!builtin_text-lQlXD~' 
    : '#!builtin_text-vXhFov'
  )
  return state
}

module.exports = {
  badAnswer,
  changeTableNumber,
  checkAnswer,
  nextQuestion,
  notChange,
  sayInitialHelp,
  tableQuestion, 
}
