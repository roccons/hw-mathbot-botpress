module.exports = {

    generateTable (number) {
        let table = []
        for (let i = 1; i <= 10; i++) {
            table.push({
                number: i,
                question: `${number} x ${i}`,
                answer: i * number
            })
        }
        return { number: number, table: table }
    },

    generateTables () {
        let tables = []
        for (let i = 1; i <= 10; i++) {
            tables.push(this.generateTable(i));
        }
        return tables;
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

                const questionBloc = `¿Cuánto es ${i} x ${question.number}?`

                convo.createThread(`table${i}${question.number}`)
                convo.threads[`table${i}${question.number}`].addQuestion(`${questionBloc}`, [
                    {
                        pattern: /(\d+)/,
                        callback: response => {
                            if (response.match == question.answer) {
                                const nextNumber = this.getNextNumber(question.number)
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
                            convo.say('Eso ni siquiera es un número')
                            convo.repeat()
                        }
                    }
                ])
            })
        }
    }
}