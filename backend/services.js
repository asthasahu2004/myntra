const app = require('./app.js')
const connectdatabse = require('./database/Database.js')


process.on('uncaughtException', (err)=>{
    console.log(`Error: ${err.message}`)
    console.log(`shutting down server due to uncaught Exception`)
    process.exit(1)
})

const PORT = process.env.PORT || 4000

const server = app.listen(PORT, ()=>{
    console.log(`Server on http://localhost:${PORT}`)
})

connectdatabse()

process.on('unhandledRejection', (err)=>{
    console.log(`Error ${err.message}`);
    console.log(`shutting down server due  unhandle promise rejection`)

    server.close(()=>{
        process.exit(1);
    })
})

