/**
 * Description of the action goes here
 * @param  {String} params.name=value Description of the parameter goes here
 * @param  {Number} [params.age] Optional parameter
 */
async function yourCustomAction(state, event, params) {
  return state
}

async function tableQuestion(state, event, params) {

  const answer = params.tableNumber * params.operand

  return {
    ...state,
    tableNumber: params.tableNumber,
    operand: params.operand,
    answer
  }
}

module.exports = { yourCustomAction, tableQuestion }
