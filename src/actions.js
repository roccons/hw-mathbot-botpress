const helpers = require('./helpers')
const userStats = require('./userStats')
const phrases = require('./phrases')

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

  let review = state.review
  let operando = null
  let operInput = null
  let $op1 = null
  let badAns = []
  console.log('STATE', state)
  if (review && state.badAnswers.operations && state.badAnswers.operations.length) {
    
    badAns = state.badAnswers.operations.splice(-3)

    const firstOperation = badAns[0].split(' ').filter(n => !isNaN(n)) 

    $op1 = firstOperation[0]
    operando = firstOperation[1]
  } else {

    operando = state.$op2 || Math.floor(Math.random() * 10 + 1)

    if (phrases.wasSaid('surprise', state.$tableNumber)) {
      operInput = getRndNumber(getLatest(state, 'op1'), [1, 10])
    } else {
      operInput = await getNumberFromText(event.text)
    }
    const op1 = state.$op1 && state.$op1 > 0 && state.$op1 <= 12
              ? state.$op1 : null
  
    $op1 = op1 || operInput
  }

  return {
    ...state,
    $op1,
    $op2: operando,
    badAnswers: { operations: badAns},
    toChange: false,
    finish: false,
    answer: $op1 * operando,
    history: review ? null : addToHistory(state, { op1: $op1, op2: operando }),
    countIncorrect: 0
  }
}

/**
 * Check if the answer given is correct.
 */
async function checkAnswer(state, event, params) {

  const text = helpers.toOneBlankSpace(event.text)
  // change number times table
  if (phrases.wasSaid('changeTable', text)) {
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
  if (phrases.wasSaid('surprise', text)) {

    let number = getRndNumber(getLatest(state, 'op1'), [1, 10])

    return {
      ...state,
      toChange: true,
      $op1: number,
      changeOperation: false,
      history: addToHistory(state, {op1: number})
    }
  }

  if (phrases.wasSaid('dontKnow', text)) {

    saveBadAnswer(state, event)

    return {
      ...state,
      changeOperation: true
    }
  }

  const resp = parseInt(await getNumberFromText(text))
  const isCorrect = resp === state.$op1 * state.$op2
  let countIncorrect = state.countIncorrect || 0
  let review = null

  if (!isCorrect) { 
    countIncorrect++ 
    saveBadAnswer(state, event)
  } else {
    // remove bad answer if it exists
    review = await removeBadAnswer(state, event)
  }
  
  if (!state.review) {
    await userStats.store(state, event, {
      table: state.$op1,
      isCorrect: isCorrect
    })
  }

  // Change another operation
  if (countIncorrect > 1) {
    return {
      ...state,
      changeOperation: true,
      countIncorrect: 0
    }
  }

  const summary = await userStats.getPercent(event)

  if (summary.total === 1) {
    userStats.resetBadAnswers(event)
  }

  return {
    ...state,
    isCorrect,
    num_operations: summary.totalCorrects,
    success_percent: summary.percentSuccess,
    sayHelp: isCorrect ? 0 : (state.sayHelp ? state.sayHelp + 1 : 1),
    changeOperation: false,
    countIncorrect,
    review: review ? review.review : false,
    badAnswers: review ? review.badAnswers : []
  }
}

/**
 * Every 10 correct answers, bot says percent of advance
 */
async function sayAdvance (state, event, params) {
  const summary = await userStats.getPercent(event)

  if (summary.totalCorrects && summary.totalCorrects % 5 === 0) {
    state.num_operations = summary.totalCorrects + 1
    if (summary.totalCorrects <= 5) {
      event.reply('#!translated_text-TWRGez', { state })
    } else {
      event.reply('#!translated_text-ESvvHz', { state })
    }
  }
  return { ...state, isNotFirst10: true }
}

/**
 * 
 */
async function sayPreviousAchievement (state, event, params) {
  const summary = await userStats.getPercent(event)

  if (summary.percentSuccess && !isNaN(summary.percentSuccess)) {
    event.reply('#!translated_text-MgfbTk', { 
      state: {
        ...state,
        last_success_percent: summary.percentSuccess,
        last_num_operations: summary.totalCorrects
      }
    })
  
  }
  userStats.reset(event)
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
 * @param {array} numbers Number to omit
 * @param {array} alsoOmit Numbers to omit
 */
function getRndNumber(numbers, alsoOmit) {
  if (alsoOmit && alsoOmit.length) {
    numbers = numbers.concat(alsoOmit)
  }
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
    new RegExp(tableNumbers.filter(n => n != '').map(n => n.join('|')).join('|'), 'i')
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
    event.reply('#!translated_text-i4OOrP', { state })
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
    // if not a number  // say bad word               // answer not correct
    isNaN(event.text) ? '#!translated_text-6kmik1' : '#!translated_text-6cJ5JH',
    { state }
  )

  const posibleAns = getAnswerHelp(state)
  event.reply(
    '#!translated_text-C19dOi', 
    { state: { possible_answers: posibleAns.join(', ') } }
  )
  
  return { ...state }
}

/**
 * Detect if there are previous bad answers
 */
async function searchPrevBadAnswers(state, event, params) {
  let badAnswers = await userStats.getBadAnswers(event)
  badAnswers = JSON.parse(badAnswers)
  if (badAnswers !== null && badAnswers.operations && badAnswers.operations.length) {
    return {
      ...state,
      continue: false,
      hasBadAnswers: true,
      badAnswers,
      $op1: null,
    }
  } else {
    return {
      ...state,
      continue: true,
      review: false,
      hasBadAnswers: false,
      $op1: null,
    }
  }
}

async function askForReview(state, event, params) {
  let review = phrases.wasSaid('yes', event.text)
  return {
    ...state,
    review
  }
}

async function removeBadAnswer(state, event) {
  console.log('INCORES', state.countIncorrect)
  if (state.countIncorrect === 1) {
    return {
      badAnswers: state.badAnswers,
      review: state.badAnswers && state.badAnswers.operations 
            ? state.badAnswers.operations.length > 0 
            : false
    }
  }
  
  const oper = `${state.$op1} x ${state.$op2} = ${state.$op1 * state.$op2}`

  await userStats.removeBadAnswer(event, oper)

  let badAnswers = state.badAnswers

  if (!badAnswers.operations) {
    return
  }
  if (!badAnswers.operations.length) {
    return
  }
  const exists = badAnswers.operations.find(o => o === oper)
  if (exists) {
    const idx = badAnswers.operations.indexOf(exists)
    badAnswers.operations.splice(idx, 1)
  }

  return {
    badAnswers,
    review: badAnswers.operations.length > 0
  }
}

/**
 * save the not correct answers to show them
 */
function saveBadAnswer(state, event) {
  userStats.saveBadAnswer(
    event, 
    `${state.$op1} x ${state.$op2} = ${state.$op1 * state.$op2}`
  )
}

function getAnswerHelp(state) {
  const ans = state.$op1 * state.$op2
  let nums = []
  nums.push(ans)

  let next = getRndSequence(ans)

  nums.push(next)

  const max = Math.max.apply(null, nums)
  
  let next2 = ans <= 3 ? max : nums[Math.floor(Math.random() * nums.length)]
  next2 += ((Date.now() % 2 === 0 ? 1 : 2) * (next2 === max ? 1 : -1));
  nums.push(next2)
  return nums.sort()
}

// get a random number, 1 or 2, higher or smaller than num
function getRndSequence(num) {
  let n = 1
  let a = 1
  if (Date.now() % 2 === 0) {
    n = num === 1 ? 1 : -1
  }
  if (Date.now() % 2 === 0) {
    a = num <= 2 ? 1 : 2
  }
  return a * n + num
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
  if (phrases.wasSaid('hiEnglish', text)) {
    return 'En'
  }
  if (phrases.wasSaid('hiSpanish', text)) {
    return 'Es'
  }
  return false
}

module.exports = {
  askForReview,
  badAnswer,
  changeOperationNumber,
  checkAnswer,
  nextQuestion,
  notChange,
  sayAdvance,
  sayInitialHelp,
  sayPreviousAchievement,
  searchPrevBadAnswers,
  selectLanguage,
  tableQuestion, 
}
