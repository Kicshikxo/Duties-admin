const express = require('express')
const path    = require('path')
const ejs     = require('ejs')
const bodyParser = require("body-parser")
const urlencodedParser = bodyParser.urlencoded({extended: false});

const app = express()

app.use('/styles',express.static(__dirname + '/public/styles'));
app.use('/styles/img',express.static(__dirname + '/public/styles/img'));
app.use('/scripts',express.static(__dirname + '/public/scripts'));
app.use('/img',express.static(__dirname + '/public/img'));

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

uri = 'mongodb+srv://Kicshikxo:ua3wikqwe@cluster0-8humy.gcp.mongodb.net/Duties'
db = require('monk')(uri)
collection = db.get('Duties')

app.get('/*', async function(request, response){
	database = await collection.find({}, { projection: { _id: 0}})
	response.render(__dirname + "/public/HTML/duties.html", {database: database})
})

app.post("/add", urlencodedParser, async function (request, response) {
	database = await collection.find({}, { projection: { _id: 0}})
	var student1, student2
	for (i of database){
		if (i.name == request.body.studentName1)
			student1 = i
		else if (i.name == request.body.studentName2)
			student2 = i
	}
	if (student1){
		let selectedDate = request.body.date.split('-').slice(1).reverse().join('.')
	    await collection.update({name: student1.name}, {$set: {dates: student1.dates.concat(selectedDate).sort(function(a,b){
			a = a.split('.')
			b = b.split('.')
			if (a[1] != b[1]) return a[1] - b[1]
			else return a[0] - b[0]
		})}})
		if (student2) 
			await collection.update({name: student2.name}, {$set: {dates: student2.dates.concat(selectedDate).sort(function(a,b){
				a = a.split('.')
				b = b.split('.')
				if (a[1] != b[1]) return a[1] - b[1]
				else return a[0] - b[0]
			})}})
		response.render(__dirname + '/public/HTML/result.html', {text: 'Успешно добавлено'})
	}
	else
		response.render(__dirname + '/public/HTML/result.html', {text: 'Не добавлено'});
})

app.post("/remove", urlencodedParser, async function (request, response) {
	database = await collection.find({}, { projection: { _id: 0}})
	
	response.render(__dirname + '/public/HTML/result.html', {text: 'Не удалось удалить'});
})

const PORT = process.env.PORT || 3000
app.listen(PORT, function(){
	console.log(`Server has been started on ${PORT}...`)
})
