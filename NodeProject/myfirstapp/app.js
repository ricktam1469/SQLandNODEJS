var express = require('express');

var app = express();

app.use(express.static('public'));
var bp = require('body-parser');
var fs= require('fs');
app.use(bp.urlencoded({
    extended: true
}));


/*app.post('/hello', function (req, res) {
  res.send('Hello World POST!');
});

app.put('/hello', function (req, res) {
  res.send('Hello World PUT!');
});

app.delete('/hello', function (req, res) {
  res.send('Hello World DELETE!');
});*/
app.get('/Users',function(req,res){
fs.readFile('data/user.json', function (err,data) {
  res.send(JSON.parse(data));
});

});

app.post('/Users', function (req, res) {
    
    fs.readFile('data/user.json', function (err, data) {
        console.log(JSON.parse(data));
        var obj = JSON.parse(data);
        obj.push(req.body);
        fs.writeFile('data/Users.json', JSON.stringify(obj), function (err, data) {
            res.send(true);
        });
        
    });
    console.log('body: ' + JSON.stringify(req.body));
    
});
app.put('/Users', function (req, res) {
    fs.readFile('data/user.json', function (err, data) {
        console.log(JSON.parse(data));
        var obj = JSON.parse(data);
        var idRec = parseInt(req.body.id);
        var index = obj.findIndex(function (user) {
            return parseInt(user.id) === idRec;
        });
        console.log(index);
        obj.splice(index, 1,req.body);
        fs.writeFile('data/user.json', JSON.stringify(obj), function (err, data) {
            res.send(req.body);
        });

    });
    console.log('body: ' + JSON.stringify(req.body));
});
app.delete('/Users', function (req, res) {
    

    fs.readFile('data/user.json', function (err, data) {
        console.log(JSON.parse(data));
        var obj = JSON.parse(data);
        var idRec = parseInt(req.body.id);
        var index=obj.findIndex(function (user) {
         return  parseInt( user.id) === idRec;
        });
        console.log(index);
       obj.splice(index, 1);
       fs.writeFile('data/user.json', JSON.stringify(obj), function (err, data) {
            res.send(true)
        });

    });
    console.log('body: ' + JSON.stringify(req.body));
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});