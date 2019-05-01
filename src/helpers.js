const { Client } = require('pg')

module.exports = {
    toOneBlankSpace (text) {
        return text.replace(/\s+/g, ' ')
    },

    /**
     * 
     * @param {string} text Text to detect
     */
    wasLanguageChange (text) {
        if (phrases.wasSaid('hiEnglish', text)) {
            return 'En'
        }
        if (phrases.wasSaid('hiSpanish', text)) {
            return 'Es'
        }
        return false;
    },

    /**
     * Get a random number 1 or 2, higher or smaller than num
     * @param {int} num Number to omit
     */
    getRandomSequence (num) {
        let n = 1
        let a = 1
        if (Date.now() % 2 === 0) {
          n = num === 1 ? 1 : -1
        }
        if (Date.now() % 2 === 0) {
          a = num <= 2 ? 1 : 2
        }
        return a * n + num
    },

    clearChat (userId) {
        const pg = new Client({
            user: process.env.PG_USER,
            host: process.env.PG_HOST,
            database: process.env.PG_DB,
            password: process.env.PG_PASSWORD,
            port: process.env.PG_PORT || 5432,
            connectionString : process.env.DATABASE_URL
        })
        
        pg.connect()

        const query = `select id from web_conversations where "userId" = '${userId}'`
        
        return new Promise((resolve, rej) => {
            pg.query(query, null)
            .then(res => {
                let i = 0
                const total = res.rowCount
                res.rows.forEach((id, idx) => {
                    const queryDel = `delete from web_messages where "conversationId" = ${id.id}`
                    pg.query(queryDel, null)
                      .then(res => {
                        console.log('Chat history deleted', res)
                      })
                      .catch(err => {
                          console.error('Error deleting chat history', err.stack)
                          rej()
                      })
                      if (idx === total - 1) {
                        // const queryDel2 = `delete from web_conversations where "id" < ${id.id}`
                        // pg.query(queryDel2, null)
                        resolve()
                      }
                })

              })
              .catch(err => {
                  console.error('Error trying to delete chat history', err.stack)
                  rej()
              })
        })
        
    }
}