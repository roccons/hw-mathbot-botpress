module.exports = {

    BAD_ANSWERS: 'badAnswers',
    USER_STATS: 'userStats',

    /**
     * Store  
     * @param {object} state 
     * @param {object} event 
     * @param {object} val {table: int, isCorrect: bool}
     * 
     * userStats = { t1: { tries: int, corrects: int } }
     * t1 = t(table number) ...t2. t3, t4, etc
     */
    async store (state, event, val) {
        const sc = await event.bp.users.getTag(event.user.id, this.USER_STATS)

        let userStats = sc ? JSON.parse(sc) : {}
        let key = 't' + val.table

        userStats[key] = userStats[key] || {}
        userStats[key].tries = userStats[key].tries || 0
        userStats[key].tries += 1

        if (val.isCorrect) {
            userStats[key].corrects = userStats[key].corrects || 0
            userStats[key].corrects += 1
        }

        await event.bp.users.tag(event.user.id, this.USER_STATS, JSON.stringify(userStats))
    },

    async saveBadAnswer (event, operation) {
        const saved = await event.bp.users.getTag(event.user.id, this.BAD_ANSWERS)
        let badAnswers = saved && saved !== '{}' ? JSON.parse(saved) : { operations: [] }

        const exists = badAnswers.operations.find(op => op === operation)

        if (exists) {
            const idx = badAnswers.operations.indexOf(exists)
            badAnswers.operations.splice(idx, 1)
        }
        if(badAnswers.operations.length === 5) {
            badAnswers.operations.splice(0, 1)
        }

        badAnswers.operations.push(operation)

        await event.bp.users.tag(event.user.id, this.BAD_ANSWERS, JSON.stringify(badAnswers))
    },

    async getBadAnswers (event) {
        const badAnswers = await event.bp.users.getTag(event.user.id, this.BAD_ANSWERS)
        return badAnswers || null
    },

    async removeBadAnswer (event, operation) {
        const badAnswers = await this.getBadAnswers(event)

        if (badAnswers === null) {
            return
        }

        ba = JSON.parse(badAnswers)
        
        if (!ba.operations) {
            return
        }

        if (!ba.operations.length) {
            return
        }

        const exists = ba.operations.find(op => op === operation)

        if (exists) {
            const idx = ba.operations.indexOf(exists)
            ba.operations.splice(idx, 1)
            await event.bp.users.tag(event.user.id, this.BAD_ANSWERS, JSON.stringify(ba))
        }
    },

    async reset (event) {
        await event.bp.users.tag(event.user.id, this.USER_STATS, "{}")
    },

    async resetBadAnswers (event) {
        await event.bp.users.tag(event.user.id, this.BAD_ANSWERS, "{}")
    },

    async resetAll (event) {
        this.reset(event)
        this.resetBadAnswers(event)
    },

    async getPercent (event) {
        const sc = await event.bp.users.getTag(event.user.id, this.USER_STATS)
        let userStats = sc ? JSON.parse(sc) : {}
        
        let total = 0
        let totalCorrects = 0
        for (t in userStats) {
            total += userStats[t].tries || 0
            totalCorrects += userStats[t].corrects || 0
        }
        const percentSuccess = totalCorrects/total * 100

        return {
            total, 
            totalCorrects, 
            percentSuccess: Math.floor(percentSuccess)
        }
    }
}