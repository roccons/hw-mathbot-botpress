const helpers = require('./helpers')
const userStats = require('./userStats')

const tableNumbers = [
  '',
  ['one', 'uno'],
  ['two', 'dos'],
  ['three', 'tres'],
  ['four', 'cuatro'],
  ['five', 'cinco'],
  ['six', 'seis'],
  ['seven', 'siete'],
  ['eight', 'ocho'],
  ['nine', 'nueve'],
  ['ten', 'diez'],
  ['eleven', 'once'],
  ['twelve', 'doce']
]

/**
 * Set the language selected when the bot is initialized
 */
async function selectLanguage(state, event, params) {
  let language = languageChanged(event.text.toLowerCase()) || 'Es'
  return {
    ...state,
    language
  }
}

/**
 * Create a question to ask with its answer
 */
async function tableQuestion(state, event, params) {
  const operando = state.$op2 || Math.floor(Math.random() * 10 + 1)
  let operInput = null

  if (state.$tableNumber.toLowerCase().includes('sorpresa') ||
      state.$tableNumber.toLowerCase().includes('surprise')) {
    operInput = getRndNumber(getLatest(state, 'op1'))
  } else {
    operInput = await getNumberFromText(state.$tableNumber)
  }

  const op1 = state.$op1 && state.$op1 > 0 && state.$op1 <= 12
            ? state.$op1 : null
  const $op1 = op1  || operInput

  return {
    ...state,
    $op1,
    $op2: operando,
    toChange: false,
    finish: false,
    answer: $op1 * operando,
    history: addToHistory(state, { op1: $op1, op2: operando })
  }
}

/**
 * Check if the answer given is correct.
 */
async function checkAnswer(state, event, params) {

  const text = helpers.toOneBlankSpace(event.text)
  // change number times table
  if (/times table|table of|la del|tabla del/i.test(text)) {
    const number = parseInt(await getNumberFromText(text))

    if (number !== null && !isNaN(number)) {
      return {
        ...state,
        toChange: true,
        $op1: number,
        changeOperation: false
      }
    }
  }

  // change to random times table
  if (/sorpresa|surprise/.test(text.toLowerCase())) {

    const number = getRndNumber(getLatest(state, 'op1'))

    return {
      ...state,
      toChange: true,
      $op1: number,
      changeOperation: false,
      history: addToHistory(state, {op1: number})
    }
  }

  if (new RegExp([
    'dont know', 'don"t know', 'don\'t know', 'idk', 'give up', 'pax', 'other',
    'no more', 'no', 'enough', 'skip',
    'no se', 'me rindo', 'otra', 'ya no', 'no más', 'no mas', 'ya', 'no', 'basta',
    'suficiente', 'paso', 'saltar'
  ].join('|'), 'g').test(text)) {
    return {
      ...state,
      changeOperation: true
    }
  }
  const resp = parseInt(await getNumberFromText(text))
  const isCorrect = resp === state.$op1 * state.$op2
  await userStats.store(state, event, {
    table: state.$op1,
    isCorrect: isCorrect
  })

  const summary = await userStats.getPercent(state, event)

  return {
    ...state,
    isCorrect,
    num_operations: summary.totalCorrects,
    success_percent: summary.percentSuccess,
    sayHelp: isCorrect ? 0 : (state.sayHelp ? state.sayHelp + 1 : 1),
    changeOperation: false
  }
}

async function sayAdvance (state, event, params) {
  const summary = await userStats.getPercent(state, event)
  if (summary.totalCorrects % 10 === 0) {
    state.num_operations = summary.totalCorrects + 1
    if (summary.totalCorrects <= 10) {
      const msg10 = event.reply('#!translated_text-TWRGez', { state })
    } else {
      const msg10 = event.reply('#!translated_text-ESvvHz', { state })
    }
  }
  return { ...state, isNotFirst10: true }
}

async function sayPreviousAchievement (state, event, params) {
  const summary = await userStats.getPercent(state, event)

  if (summary.percentSuccess && !isNaN(summary.percentSuccess)) {
    const msgPrev = event.reply('#!translated_text-MgfbTk', { 
      state: { ...state, last_success_percent: summary.percentSuccess } 
    })
  
  }
  userStats.reset(state, event)
  return { ...state }
}

/**
 * Convert letter to number
 * @param {string} text 
 */
async function toNumber(text) {
  return tableNumbers.findIndex(tn => tn.includes(text.toLowerCase()))
}

/**
 * Get a random number for the next question.
 * @param {array} numbers
 */
function getRndNumber(numbers) {
  let operando = Math.floor(Math.random() * 10 + 1)
  while (numbers.includes(operando)) {
    operando = Math.floor(Math.random() * 10 + 1)
  }
  return operando;
}

/**
 * Get a number given inside a string
 * @param {string} text 
 */
async function getNumberFromText(text) {
  // if the string has a number as a gigit
  if (text.match(/(\d+)/)) {
    return text.match(/(\d+)/)[0]
  }

  // If no detect a digit, search if there is a number written with letters
  const numberGotten = text.toLocaleLowerCase().match(
    new RegExp(tableNumbers.filter(n => n != '').map(n => n.join('|')).join('|'), 'g')
  )

  if (numberGotten === null) {
    return null
  }

  // Convert letter to number
  const number = await toNumber(numberGotten[0])

  return number !== -1 && number !== null ? number : null
}

/**
 * Get next table number to practice
 */
async function nextQuestion(state, event, params) {

  let nextNumber = getRndNumber(getLatest(state, 'op2')) 

  if (nextNumber == 1 || nextNumber == 10) {
    nextNumber = getRndNumber(getLatest(state, 'op2'))
  }

  return {
    ...state,
    $op2: nextNumber
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

/**
 * Change the operation (the second operand)
 */
function changeOperationNumber(state, event, params) {

  const nextNumber = getRndNumber(getLatest(state, 'op2')).toString()

  return {
    ...state,
    $op2: nextNumber
  }
}

/**
 * Display a help messaje when the user gave three incorrect answers
 */
async function sayInitialHelp(state, event, params) {

  if (!state.started) {
    const msg2 = event.reply('#!translated_text-i4OOrP', { state })
  }

  return {
    ...state,
    started: true
  }
}

/**
 * Reply a message if the user input was not correct
 */
async function badAnswer(state, event, params) {

  event.reply(
    isNaN(event.text) ? '#!translated_text-6kmik1' : '#!translated_text-6cJ5JH',
    { state }
  )
  return { ...state }
}

/**
 * Add a history of operations done
 * the val object has the op1 and op2 attributes. Both are optional.
 * op1 is for times table number or first operand, op2 is for the second operand
 * @param {object} state 
 * @param {object} val { op1: number, op2: number }
 */
function addToHistory(state, val) {
  const hist = state.history || { op1: [], op2: [] }

  if (val.op1) {
    if (hist.op1.slice(-1)[0] != Number(val.op1)) {
      hist.op1.push(Number(val.op1))
    }
  }
  if (val.op2) {
    hist.op2.push(val.op2)
  }
  return hist
}

/**
 * Return the two last elements of the history array.
 * @param {object} state 
 * @param {strng} oper op1|op2
 */
function getLatest(state, oper) {
  if (!state.history) {
    return [0]
  }
  return state.history[oper].slice(-2)
}

/**
 * Detect if the user want to change the language
 * @param {string} text User input
 */
function languageChanged(text) {
  if (/hi|hello|english|ingles|inglés/.test(text)) {
    return 'En'
  }
  if (/hola|español|spanish|espanol/.test(text)) {
    return 'Es'
  }
  return false
}

module.exports = {
  badAnswer,
  changeOperationNumber,
  checkAnswer,
  nextQuestion,
  notChange,
  sayAdvance,
  sayInitialHelp,
  sayPreviousAchievement,
  selectLanguage,
  tableQuestion, 
}
