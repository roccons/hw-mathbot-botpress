const { Client } = require('pg')

module.exports = {
    toOneBlankSpace (text) {
        return text.replace(/\s+/g, ' ')
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
        // const query = `delete from web_messages where 'conversationId' = `
        console.log('query', query)
        pg.query(query, null)
          .then(res => {
            const id = res.rows[0].id
            const queryDel = `delete from web_messages where "conversationId" = '${id}'`
            console.log('Chat history deleted', res[0].id)
          })
          .catch(err => {
              console.error('Error trying to delete chat history', err.stack)
          })
    }
}