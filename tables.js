module.exports = {
    makeQuestion (number) {
        
    },

    generateQuestions (number) {
        let table = []
        for (let i = 1; i <= 10; i++) {
            table.push({
                question: `${number} x ${i}`,
                answer: i * number
            })
        }
        return table
    }
}