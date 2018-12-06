module.exports = {
    /**
     * 
     * @param {object} state 
     * @param {object} event 
     * @param {object} val {table, isCorrects}
     */
    async store (state, event, val) {
        const sc = await event.bp.users.getTag(event.user.id, 'userStats')

        let userStats = sc ? JSON.parse(sc) : {}
        let key = 't' + val.table

        userStats[key] = userStats[key] || {}
        userStats[key].tries = userStats[key].tries || 0
        userStats[key].tries += 1

        if (val.isCorrect) {
            userStats[key].corrects = userStats[key].corrects || 0
            userStats[key].corrects += 1
        }

        await event.bp.users.tag(event.user.id, 'userStats', JSON.stringify(userStats))
    },

    async reset (state, event) {
        await event.bp.users.tag(event.user.id, 'userStats', "{}")
    },

    async getPercent (state, event) {
        const sc = await event.bp.users.getTag(event.user.id, 'userStats')
        let userStats = sc ? JSON.parse(sc) : {}
        
        let total = 0
        let totalCorrects = 0
        for (t in userStats) {
            total += userStats[t].tries || 0
            totalCorrects += userStats[t].corrects || 0
        }
        const percentSuccess = totalCorrects/total * 100

        console.log('userStats', {total, totalCorrects})
        return {
            total, totalCorrects, percentSuccess: Math.floor(percentSuccess)
        }
    }
}