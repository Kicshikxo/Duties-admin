const express = require('express')
const compression = require('compression')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: { origin: "*" }
})
const ejs = require('ejs')
const path = require('path')
const bodyParser = require("body-parser")
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const cors = require('cors')

app.use(cors())
app.use(compression())

app.use('/styles', express.static(__dirname + '/static/styles'))
app.use('/img', express.static(__dirname + '/static/styles/img'))
app.use('/js', express.static(__dirname + '/static/js'))

app.engine('html', ejs.renderFile)
app.set('view engine', 'html')
app.set('views', __dirname)

MONGO_DB_URI = process.env.MONGO_DB_URI || require('./config.json').MONGO_DB_URI
SECRET_KEY = process.env.SECRET_KEY || require('./config.json').SECRET_KEY
AUTH_PIN = process.env.AUTH_PIN || require('./config.json').AUTH_PIN

db = require('monk')(MONGO_DB_URI)
collection = db.get('Duties')

function sortDates(a, b) {
    a = a.split('.')
    b = b.split('.')
    if (a[2] != b[2])
        return a[2] - b[2]
    if (a[1] != b[1])
        return a[1] - b[1]
    else
        return a[0] - b[0]
}

app.get('/', async function(request, response) {
    response.render(__dirname + "/static/HTML/duties.html")
})

async function getDB() {
    return (await collection.find({}, { projection: { _id: 0 } })).sort((prev, next) => { if (prev.name < next.name) return -1 })
}

function readJWT(token) {
    try {
        return jwt.verify(token, SECRET_KEY)
    } catch (e) {
        return false
    }
}

function checkPin(token) {
    pin = readJWT(token).pin

    return pin == AUTH_PIN
}

io.on('connection', async function(socket) {
    console.log(`Подключился: ${socket.id}`)

    socket.on('login request', async function(data) {
        if (data) {
            if (data.pin == AUTH_PIN) {
                let newToken = jwt.sign({ pin: AUTH_PIN }, SECRET_KEY)
                socket.emit('login response', { success: true, token: newToken })
            } else {
                socket.emit('login response', { success: false })
            }
        }
    })

    socket.on('get db request', async function(data) {
        if (data) {
            if (data.jwt) {
                if (checkPin(data.jwt)) {
                    socket.emit('get db response', { db: await getDB() })
                } else {
                    socket.emit('login response', { success: false })
                }
            } else {
                socket.emit('login response', { success: false })
            }
        } else {
            socket.emit('login response', { success: false })
        }

    })

    socket.on('check for updates request', function() {
        let package = require('./package.json')
        socket.emit('check for updates response', { version: package.version, updateurl: package.updateurl })
    })

    socket.on('add request', async function(data) {
        console.log(data)
        if (data && data.date) {
            if (checkPin(data.jwt)) {
                data.students = data.students.filter(_ => _)

                if (data.students.length !== 0) {

                    database = await getDB()

                    let needToUpdate = false

                    for (let student of data.students) {
                        if (!student) continue
                        let currentStudent
                        for (let student_ of database) {
                            if (student_.name === student)
                                currentStudent = student_
                        }

                        if (currentStudent) {
                            needToUpdate = true
                            let date = data.date.split('-').reverse().join('.')
                            await collection.update({ name: currentStudent.name }, { $set: { dates: currentStudent.dates.concat(date).sort(sortDates) } })

                            socket.emit('server response', { success: true, title: 'Успешно добавлено', text: '' })
                        } else {
                            socket.emit('server response', { success: false, title: 'Не удалось добавить', text: 'Студент не найден' })
                        }
                    }

                    if (needToUpdate) io.emit('update db', { db: await collection.find({}, { projection: { _id: 0 } }) })
                } else {
                    socket.emit('server response', { success: false, title: 'Не удалось добавить', text: 'Ни один студент не выбран' })
                }
            } else {
                socket.emit('login response', { success: false })
            }
        } else {
            socket.emit('server response', { success: false, title: 'Не удалось добавить', text: 'Не указана дата' })
        }
    })

    socket.on('remove request', async function(data) {
        console.log(data)
        if (data && data.student && data.date) {
            if (checkPin(data.jwt)) {
                database = await getDB()

                let currentStudent
                for (let student of database) {
                    if (student.name == data.student)
                        currentStudent = student
                }

                if (currentStudent && currentStudent.dates.includes(data.date)) {
                    currentStudent.dates.splice(currentStudent.dates.indexOf(data.date), 1)
                    await collection.update({ name: currentStudent.name }, { $set: { dates: currentStudent.dates } })

                    socket.emit('server response', { success: true, title: 'Успешно удалено', text: '' })
                    io.emit('update db', { db: await collection.find({}, { projection: { _id: 0 } }) })
                } else {
                    socket.emit('server response', { success: false, title: 'Не удалось удалить', text: 'Студент или дата не найдены' })
                }
            } else {
                socket.emit('login response', { success: false })
            }
        } else if (!data.student) {
            socket.emit('server response', { success: false, title: 'Не удалось удалить', text: 'Не выбран студент' })
        } else if (!data.date) {
            socket.emit('server response', { success: false, title: 'Не удалось удалить', text: 'Не выбрана дата' })
        }
    })

    socket.on('disconnect', function() {
        console.log(`Отключился: ${socket.id}`)
    })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, function() {
    console.log(`Server started on port: ${PORT}`)
})