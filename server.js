// Include Server Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongojs = require('mongojs');
var exphbs = require('express-handlebars');

// var server = require('http').createServer(app);
// var io = require('socket.io')(server);
// io.on('connection', function(){ /* … */ });



// Create Instance of Express
var app = express();
var PORT = process.env.PORT || 3000; // Sets an initial port. We'll use this later in our listener

// Run Morgan for Logging
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));

app.use(express.static('./public'));

// -------------------------------------------------

// MongoDB Configuration configuration (Change this URL to your own DB)
var databaseUrl = 'localDB';
var collections = ["nytreact"];

// use mongojs to hook the database to the db variable 
var db = mongojs(databaseUrl, collections);

db.on('error', function (err) {
  console.log('MongoDB Error: ', err);
});


// -------------------------------------------------

// Main Route. This route will redirect to our rendered React application
app.get('/', function(req, res){
  res.sendFile('./public/index.html');
})

// This is the route we will send GET requests to retrieve our most recent search data.
// We will call this route the moment our page gets rendered
app.get('/api/', function(req, res) {

  // We will find all the records, sort it in descending order, then limit the records to 5
  db.nytreact.find({}).sort({date: -1}).limit(5, function(err, doc){

      if(err){
        console.log(err);
      }
      else {
        res.send(doc);
      }
    })
});

// This is the route we will send POST requests to save each search.
app.post('/api/', function(req, res){
  console.log("BODY: " + req.body.location);

  // Here we'll save the location based on the JSON input. 
  // We'll use Date.now() to always get the current date time
  db.nytreact.insert({"location": req.body.location, "date": Date.now()}, function(err){
    if(err){
      console.log(err);
    }
    else {
      res.send("Saved Search");
    }
  })
});


// -------------------------------------------------

// Listener
app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});