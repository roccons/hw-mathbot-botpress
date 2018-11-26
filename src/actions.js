const helpers = require('./helpers')

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
  return {
    ...state,
    isCorrect,
    sayHelp: isCorrect ? 0 : (state.sayHelp ? state.sayHelp + 1 : 1),
    changeOperation: false
  }
}

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
  if (text.match(/(\d+)/)) {
    return text.match(/(\d+)/)[0]
  }

  const numberGotten = text.toLocaleLowerCase().match(
    new RegExp(tableNumbers.filter(n => n != '').map(n => n.join('|')).join('|'), 'g')
  )

  if (numberGotten === null) {
    return null
  }

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

function changeOperationNumber(state, event, params) {

  const nextNumber = getRndNumber(getLatest(state, 'op2')).toString()

  return {
    ...state,
    $op2: nextNumber
  }
}

async function sayInitialHelp(state, event, params) {

  if (!state.started) {
    const msg2 = event.reply('#!translated_text-i4OOrP', { state })
  }

  return {
    ...state,
    started: true
  }
}

async function badAnswer(state, event, params) {

  event.reply(
    isNaN(event.text) ? '#!translated_text-6kmik1' : '#!translated_text-6cJ5JH',
    { state }
  )
  return { ...state }
}

function addToHistory(state, val) {
  console.log('HISTORY', state.history)
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

function getLatest(state, operando) {
  if (!state.history) {
    return [0]
  }
  return state.history[operando].slice(-2)
}

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
  sayInitialHelp,
  selectLanguage,
  tableQuestion, 
}
