async function tableQuestion(state, event, params) {

  const operando = state.$op2 || Math.floor(Math.random() * 10 + 1)

  return {
    ...state,
    $op1: state.$op1 || getNumberFromText(state.$tableNumber),
    $op2: operando,
    toChange: false,
    finish: false,
    answer: operando * getNumberFromText(state.$tableNumber)
  }
}

async function checkAnswer(state, event, params) {

  if (event.text.includes('la del')) {
    return {
      ...state,
      toChange: true,
      finish: false,
      $op1: parseInt(getNumberFromText(event.text))
    }
  }

  if (event.text.includes('adios')) {
    return {
      ...state,
      finish: true
    }
  }

  const resp = parseInt(getNumberFromText(event.text))
  console.log(resp, state)
  return {
    ...state,
    isCorrect: resp === state.$op1 * state.$op2,
    finish: false,
  }
}

function getRndNumber(number) {
  let operando = Math.floor(Math.random() * 10 + 1)
  while (number === operando) {
    operando = Math.floor(Math.random() * 10 + 1)
  }
  return operando;
}

function getNumberFromText(text) {
  if (text.match(/(\d+)/)) {
    return text.match(/(\d+)/)[0]
  }
  return null
}

async function nextQuestion(state, event, params) {

  return {
    ...state,
    $op1: getNumberFromText(state.$tableNumber),
    $op2: getRndNumber(state.$op2),
    finish: false,
  }
}

function notChange(state, event, params) {
  return {
    ... state,
    toChange : false,
    finish: false,
  }
}

module.exports = {
  tableQuestion, 
  checkAnswer,
  nextQuestion,
  notChange
}
