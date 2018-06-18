module.exports = {

    getParticipant () {
        return null
    },

    saveParticipant (table) { },

    generateTable (number) {
        let table = []
        for (let i = 1; i <= 10; i++) {
            table.push({
                number: i,
                question: `${number} x ${i}`,
                answer: i * number
            })
        }
        return { number, table }
    },

    getNextNumber(number) {
        let next = Math.floor(Math.random() * 10) + 1
        while (number == next) {
            next = Math.floor(Math.random() * 10) + 1
        }
        return next
    },

    makeQuestions (convo) {
        for (let i = 1; i <= 10; i++) {

            const table = this.generateTable(i)

            table.table.forEach(question => {

                const questionBlock = `¿${i} x ${question.number}?`

                convo.createThread(`table${i}${question.number}`)
                convo.threads[`table${i}${question.number}`].addQuestion(`${questionBlock}`, [
                    {
                        // Change to another table
                        pattern: /tabla del (\d+)/i,
                        callback: response => {
                            const numberSelected = response.text.match(/(\d+)/)[0]

                            if (numberSelected > 0 && numberSelected <= 10) {

                                const operand = Math.floor(Math.random() * 10) + 1
                                
                                convo.say('#startTable', {
                                  table: numberSelected 
                                })
                                convo.switchTo(`table${numberSelected}${operand}`)
                              } else {
                                convo.say('#startFail')
                                convo.switchTo('start')
                              }
                        }
                    },
                    {
                        // answer of the question
                        pattern: /(\d+)/i,
                        callback: response => {
                            if (response.match == question.answer) {
                                const nextNumber = this.getNextNumber(question.number)
                                this.saveParticipant(i)
                                convo.say('#goodAnswer')
                                convo.switchTo(`table${i}${nextNumber}`)
                            } else {
                                convo.say('#badAnswer')
                                convo.repeat()
                            }
                        }
                    },
                    {
                        default: true,
                        callback: () => {
                            convo.say('#badAnswer')
                            convo.repeat()
                        }
                    }
                ])
            })
        }
    }
}