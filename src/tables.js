module.exports = {

    /**
     * current user
     */
    user: null,

    state: {
        currentTable: 0,
        currentQuestion: {
            operand: 0
        },
        nextQuestion: 0,
    },

    store: null,

    getStore () {

    },

    /**
     * get the last table practiced from store, if any
     * @param {*} event 
     */
    getLastTable() {
        return this.store.last_table;
    },

    /**
     * Save last table played by user
     * @param {*} table 
     */
    saveParticipant(table) {
        this.tag(this.user.id, 'table', table)
    },

    /**
     * Generate a object with all table number given questions
     * @param {int} number 
     */
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

    /**
     * Get the next question
     * @param {int} number 
     */
    getNextNumber(number) {
        let next = Math.floor(Math.random() * 10) + 1
        while (number == next) {
            next = Math.floor(Math.random() * 10) + 1
        }
        return next
    },

    /**
     * Show a message when the user write a wrong word
     * @param {string} response 
     */
    dontGetIt (response) {
        // do something
    },

    /**
     * Repeat the current question
     * @param {Int} response 
     */
    repeatQuestion (number) {
        // do something
    },

    /**
     * Build all posible questions and actions
     */
    makeQuestions() {
        for (let i = 1; i <= 10; i++) {

            const table = this.generateTable(i)

            table.table.map(question => {

                return {

                    operand_1: i,
                    operand_2: question.number,
                    that: this,

                    change: {
                        pattern: /del (\d+)/i,
                        callback: response => {
                            const numberSelected = response.match(/(\d+)/)[0]

                            if (numberSelected > 0 && numberSelected <= 10) {

                                const operand = Math.floor(Math.random() * 10) + 1

                                // Next table
                                // table: numberSelected
                                // Move to next table
                                //switchTo(`table${numberSelected}${operand}`)
                            } else {
                                // say wrong answer
                            }
                        }
                    },
                    answer: {
                        pattern: /(\d+)/i,
                        callback: response => {
                            if (response.match(/(\d+)/)[0] == question.answer) {
                                const nextNumber = that.getNextNumber(question.number)
                                // Say good answer
                                // switch to next question
                                // switchTo(`table${i}${nextNumber}`)
                            } else {
                                // Sayworng answer and repeat
                                // repeatQuestion()
                            }
                        }
                    },

                    default: {
                        callback: response => {
                            dontGetIt()
                            repeatQuestion()
                        }
                    }
                }
            }
        }
    }
}