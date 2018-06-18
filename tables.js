module.exports = {

    user: null,

    bp: null,

    getLastTable(event) {
        const table = null
        this.user = event.user
        this.bp.users.hasTag(this.user.id, 'table').then(hasTag => {
            if (hasTag) {
                this.bp.users.getTag(this.user.id, 'table').then(tableStore => {
                    table = tableStore
                })
            }
        })
        return table
    },

    saveParticipant(table) {
        this.bp.users.tag(this.user.id, 'table', table)
    },

    generateTable(number) {
        let table = []
        for (let i = 1; i <= 10; i++) {
            table.push({
                number: i,
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

    makeQuestions(bp, convo) {
        for (let i = 1; i <= 10; i++) {

            const table = this.generateTable(i)

            table.table.forEach(question => {

                convo.createThread(`table${i}${question.number}`)
                convo.threads[`table${i}${question.number}`].addQuestion(
                    '#question',
                    {
                        operand1: i,
                        operand2: question.number
                    },
                    [{
                        // Change to another table
                        pattern: /del (\d+)/i,
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