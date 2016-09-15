////express////////////
var express = require('express');
var app = express();
app.use(express.static('public'));
//////body parser//////
var bp = require('body-parser');
//////JSON Reader//////
var fs= require('fs');
//////MSSQL Package///////
var sql=require('mssql');
//////Request Package/////
var request = require('request');

//////////////Config Var//////////////////////////////
var config = {
    user: 'sa',
    password: 'Passw0rd',
    server: 'localhost', // You can use 'localhost\\instance' to connect to named instance 
    database: 'NodeDemos',
    options:{
        instanceName: 'SQLEXPRESS'
    }
 };
///////////////////////////////////////////////////////
app.use(bp.urlencoded({
    extended: true
}));

/////////////////////////GET(INIT) FROM JSON//////////////////////////////////////////////////////
app.get('/Users',function(req,res){
fs.readFile('data/user.json', function (err,data) {
  res.send(JSON.parse(data));
});

});
////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////POST(SAVE) FROM JSON//////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////PUT(EDIT) FROM JSON//////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////DELETE(DELETE) FROM JSON//////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//

//----------------------------SQL DATABASE-------------------------------------------------------------------//

/////////////////////////GET(INIT/SHOW) FROM MSSQL/////////////////////////////////////////////////////////////
app.get('/Users-sql',function(req,res){
    sql.connect(config).then(function() {
        // Query 
        var sqlRequest=new sql.Request();
       sqlRequest.query('select * from [User]').then(function(recordset) {
             res.send(JSON.parse(JSON.stringify(recordset)));
        }).catch(function(err) {
            console.log(err);
        });
     
        
    }).catch(function(err) {
        // ... error checks 
    });

});
//////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////POST(SAVE) FROM MSSQL//////////////////////////////////////////////////////
app.post('/Users-sql', function (req, res) {
    
     var name=req.body.name
    var email=req.body.email;
    var phone=req.body.phone;
    //var id=req.body.id;
    var website=req.body.website;

    sql.connect(config).then(function() {
        // Query 
        var sqlRequest=new sql.Request();
       sqlRequest
       .input('name',sql.NVarChar(50),name)
       .input('email',sql.NVarChar(50),email)
       .input('phone',sql.NVarChar(50),phone)
       .input('website',sql.NVarChar(50),website)
       .query('INSERT INTO [User] (name,email,phone,website)'+ 
        'VALUES(@name, @email, @phone,@website);'+
        'SELECT SCOPE_IDENTITY() AS newId;').then(function(recordset) {
             res.send(recordset[0]);
             console.log(recordset);
        }).catch(function(err) {
            console.log(err);
        });
     
        
    }).catch(function(err) {
        console.log(err); 
    });
    
});
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////PUT(EDIT) FROM MSSQL//////////////////////////////////////////////////////
app.put('/Users-sql', function (req, res) {
    var name=req.body.name
    var email=req.body.email;
    var phone=req.body.phone;
    var id=req.body.id;
    var website=req.body.website;

    sql.connect(config).then(function() {
        // Query 
        var sqlRequest=new sql.Request();
       sqlRequest
       .input('id',sql.Int,id)
       .input('name',sql.NVarChar(50),name)
       .input('email',sql.NVarChar(50),email)
       .input('phone',sql.NVarChar(50),phone)
       .input('website',sql.NVarChar(50),website)
       .query('UPDATE [User] SET name=@name, email=@email, phone=@phone,website=@website WHERE id=@id').then(function(recordset) {
             res.send(true);
             console.log(recordset);
        }).catch(function(err) {
            console.log(err);
        });
     
        
    }).catch(function(err) {
        console.log(err); 
    });
   
});
////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////DELETE FROM MSSQL//////////////////////////////////////////////////////
app.delete('/Users-sql', function (req, res) {
  
    var idRec = req.body.id;
    sql.connect(config).then(function() {
        // Query 
        var sqlRequest=new sql.Request();
       sqlRequest
        .input('id',sql.Int,idRec)
            .query('DELETE FROM [User] WHERE id=@id').then(function(recordset) {
                 res.send(true);
        }).catch(function(err) {
            console.log(err);
        });
     
        
    }).catch(function(err) {
          console.log(err);
             });

    
});

//////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------

/////////////////////////DOWNLOAD EXAMPLE//////////////////////////////////////////////////////
/*var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);

};

download('https://www.google.com/images/srpr/logo3w.png', 'google.png', function(){
  console.log('done');
});*/
///////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////UPLOAD TO SERVER /////////////////////////////////////////////////////
app.put('/Upload', function (req, res) {
    var userId=req.body.userid
    var content=req.body.content;
    var filename=req.body.filename;
   
    sql.connect(config).then(function() {
        // Query 
        var sqlRequest=new sql.Request();
       sqlRequest
       .input('id',sql.Int,userId)
       .input('file',sql.NVarChar(50),filename)
       .query('UPDATE [User] SET [file]=@file WHERE id=@id').then(function(recordset) {
        fs.writeFile(__dirname+'/data/files/'+userId+'.txt', content,function(err){
             res.send(true);
             //console.log(recordset);
         });
        }).catch(function(err) {
            console.log(err);
        });
     
        
    }).catch(function(err) {
        console.log(err); 
    });
   
});

////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////DOWNLOAD FROM SERVER /////////////////////////////////////////////////////
app.get('/Download/:id', function (req, res) {
        var userid = req.params.id;
        console.log(userid);
    sql.connect(config).then(function () {
        var sqlRequest = new sql.Request();
        sqlRequest
            .input('id', sql.Int, userid)
            .query('SELECT [file] FROM [User] WHERE id = @id').then(function (recordset) {
                console.log(recordset[0].file);
                 //console.log("Q:"+query);
                var file = __dirname + '/data/files/' + userid + '.txt';
                res.download(file,recordset[0].file);
            }).catch(function (err) {
                console.log(err);
            });
    }).catch(function (err) {
        console.log(err);
    });
});

app.put('/CheckUserFile', function (req, res) {
    console.log(req.body.id);
    var userid = req.body.id;
    console.log(userid);
    sql.connect(config).then(function () {
        var sqlRequest = new sql.Request();
        sqlRequest.input('id', sql.Int, userid)
        .query('SELECT [file] FROM [User] WHERE id = @id').then(function (recordset) {
            //console.log("---->"+recordset[0].file);
            //res.send(true);
                if (recordset[0].file) {
                    res.send(true);
                }
                else {
                    res.send(false);
                }
            }).catch(function (err) {
                console.log(err);
            });
    }).catch(function (err) {
        console.log(err);
    });
});

////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////LISTNING POST//////////////////////////////////////////////////////
app.listen(3000, function () {
  console.log('Ricktam App started and listening on port 3000!');
});
////////////////////////////////////////////////////////////////////////////////////////////