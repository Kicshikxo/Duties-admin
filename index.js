const subdomain = require('express-subdomain')
var express = require('express');
var app = express();

var router = express.Router();

//api specific routes
router.get('/', function(req, res) {
   res.send('Welcome to our API!');
});

router.get('/users', function(req, res) {
    res.json([
        { name: "Brian" }
    ]);
});

app.use(subdomain('api', router));
// app.listen(3000);

const PORT = process.env.PORT || 3000
app.listen(PORT, function(){
	console.log(`Server has been started on ${PORT}...`)
})
