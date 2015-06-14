
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

//app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
//app.use(express.bodyParser());
// create application/json parser
var jsonParser = bodyParser.json();

app.get('/', function(req, res){
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/endpoint", jsonParser, function(req, res){
    var obj = {};
    var data = JSON.stringify(req.body);
    console.log(data);

    fs.writeFile("file.json", data, function(err){
        if(err){
            return console.log(err);
        }

        console.log("The file was saved!");
    });


    res.send(req.body);
});



var server = app.listen(9000, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://' +  host + ': ' + port);
});
