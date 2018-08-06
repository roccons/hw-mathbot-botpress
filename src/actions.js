/**
 * Description of the action goes here
 * @param  {String} params.name=value Description of the parameter goes here
 * @param  {Number} [params.age] Optional parameter
 */
async function yourCustomAction(state, event, params) {
  return state
}

async function initTable(state, event, params) {
  return {
    ...state,
    tableNumber: params.tableNumber,
    toChange: false
  }
}

async function tableQuestion(state, event, params) {

  const operando = state.$op2 || Math.floor(Math.random() * 10 + 1)
  const answer = operando * state.$tableNumber

  return {
    ...state,
    $op1: state.$tableNumber,
    $op2: operando,
    answer,
    toChange: false
  }
}

async function checkAnswer(state, event, params) {

  if (isNaN(event.text)) {
    if (event.text.includes('la del')) {
      const numberSelected = event.text.match(/(\d+)/)[0]
      return {
        ...state,
        toChange: true,
        $tableNumber: numberSelected
      }
    }
  }

  const resp = parseInt(event.text)

  return {
    ...state,
    isCorrect: resp === state.answer
  }
}

function getRndNumber(number) {
  let operando = Math.floor(Math.random() * 10 + 1)
  while (number === operando) {
    operando = Math.floor(Math.random() * 10 + 1)
  }
  return operando;
}

async function nextQuestion(state, event, params) {
  return {
    ...state,
    $op1: state.$tableNumber,
    $op2: getRndNumber(state.$op2)
  }
}

module.exports = { 
  yourCustomAction, 
  tableQuestion, 
  initTable,
  checkAnswer,
  nextQuestion
}
