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
const urlencodedParser = bodyParser.urlencoded({extended: false})

const cors = require('cors')

app.use(cors())
app.use(compression())

app.use('/styles',express.static(__dirname + '/static/styles'))
app.use('/img',express.static(__dirname + '/static/styles/img'))
app.use('/js',express.static(__dirname + '/static/js'))

app.engine('html', ejs.renderFile)
app.set('view engine', 'html')
app.set('views', __dirname)

uri = process.env.MONGO_DB_URI || require('./mongo-db-uri.json').uri

db = require('monk')(uri)
collection = db.get('Duties')

function sortDates(a,b){
	a = a.split('.')
	b = b.split('.')
	if (a[2] != b[2]) 
		return a[2] - b[2]
	if (a[1] != b[1]) 
		return a[1] - b[1]
	else 
		return a[0] - b[0]
}

app.get('/', async function(request, response){
	database = await collection.find({}, {projection: {_id: 0}})
	response.render(__dirname + "/static/HTML/duties_old.html", {database: database})
})

app.get('/new', async function(request, response){
	response.render(__dirname + "/static/HTML/duties.html")
})

async function getDB(){
	return (await collection.find({}, {projection: {_id: 0}})).sort((prev, next) => {if (prev.name < next.name) return -1})
}

app.post("/add", urlencodedParser, add)

app.post("/mobile/add", urlencodedParser, add)

app.post("/remove", urlencodedParser, remove)

app.post("/mobile/remove", urlencodedParser, remove)

io.on('connection', async function(socket){
	console.log(`Подключился: ${socket.id}`)

	socket.on('get db request', async function(){
		socket.emit('get db response', {db: await getDB()})
	})

	socket.on('check for updates request', function(){
		let package = require('./package.json')
		socket.emit('check for updates response', {version: package.version, updateurl: package.updateurl})
	})

	socket.on('add request', async function(data){
		console.log(data)
		if (data.date){
			data.students = data.students.filter(_=>_)

			if (data.students.length !== 0){

				database = await getDB()

				let needToUpdate = false

				for (let student of data.students){
					if (!student) continue
					let currentStudent
					for (let student_ of database){
						if (student_.name === student)
							currentStudent = student_
					}

					if (currentStudent){
						needToUpdate = true
						let date = data.date.split('-').reverse().join('.')
						await collection.update({name: currentStudent.name}, {$set: {dates: currentStudent.dates.concat(date).sort(sortDates)}})

						socket.emit('server response', {success: true, title: 'Успешно добавлено', text: ''})
					}
					else {
						socket.emit('server response', {success: false, title: 'Не удалось добавить', text: 'Студент не найден'})
					}
				}

				if (needToUpdate) io.emit('update db', {db: await collection.find({}, {projection: { _id: 0}})})
			}
			else {
				socket.emit('server response', {success: false, title: 'Не удалось добавить', text: 'Ни один студент не выбран'})
			}
		}
		else {
			socket.emit('server response', {success: false, title: 'Не удалось добавить', text: 'Не указана дата'})
		}
	})

	socket.on('remove request', async function(data){
		console.log(data)
		if (data.student && data.date){

			database = await getDB()

			let currentStudent
			for (let student of database){
				if (student.name == data.student)
					currentStudent = student
			}

			if (currentStudent && currentStudent.dates.includes(data.date)){
				currentStudent.dates.splice(currentStudent.dates.indexOf(data.date), 1)
				await collection.update({name: currentStudent.name}, {$set: {dates: currentStudent.dates}})

				socket.emit('server response', {success: true, title: 'Успешно удалено', text: ''})
				io.emit('update db', {db: await collection.find({}, {projection: { _id: 0}})})
			}
			else {
				socket.emit('server response', {success: false, title: 'Не удалось удалить', text: 'Студент или дата не найдены'})
			}
		}
		else if (!data.student){
			socket.emit('server response', {success: false, title: 'Не удалось удалить', text: 'Не выбран студент'})
		}
		else if (!data.date){
			socket.emit('server response', {success: false, title: 'Не удалось удалить', text: 'Не выбрана дата'})
		}
	})

	socket.on('disconnect', function(){
		console.log(`Отключился: ${socket.id}`)
	})
})

async function add(request, response) {
	database = await getDB()
	var student1, student2
	for (i of database){
		if (i.name == request.body.studentName1)
			student1 = i
		else if (i.name == request.body.studentName2)
			student2 = i
	}
	if (student1 || student2){
		let selectedDate = request.body.date.split('-').reverse().join('.')
	    if (student1)
			await collection.update({name: student1.name}, {$set: {dates: student1.dates.concat(selectedDate).sort(sort)}})
		if (student2) 
			await collection.update({name: student2.name}, {$set: {dates: student2.dates.concat(selectedDate).sort(sort)}})
		response.render(__dirname + '/static/HTML/result.html', {text: 'Успешно добавлено'})
	}
	else
		response.render(__dirname + '/static/HTML/result.html', {text: 'Не добавлено'});
}

async function remove(request, response) {
	database = await getDB()
	var student
	for (i of database){
		if (i.name == request.body.studentName)
			student = i
	}
	if (student && student.dates.indexOf(request.body.date) != -1) {
		student.dates.splice(student.dates.indexOf(request.body.date), 1)
		await collection.update({name: student.name}, {$set: {dates: student.dates}})
		response.render(__dirname + '/static/HTML/result.html', {text: 'Успешно удалено'});
	}
	else 
		response.render(__dirname + '/static/HTML/result.html', {text: 'Не удалось удалить'});
}

const PORT = process.env.PORT || 3000
server.listen(PORT, function (){
	console.log(`Server started on port: ${PORT}`)
})
