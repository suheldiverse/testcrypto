'use strict';
const BitMEXClient = require('./index');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
// See 'options' reference below
const client = new BitMEXClient({testnet: true});
// handle errors here. If no 'error' callback is attached. errors will crash the client.
client.on('error', console.error);
client.on('open', () => console.log('Connection opened.'));
client.on('close', () => console.log('Connection closed.'));
client.on('initialize', () => console.log('Client initialized, data is flowing.'));

client.addStream('XBTUSD', 'instrument', function(data, symbol, tableName) {
 // console.log(`Got update for ${tableName}:${symbol}. Current state:\n${JSON.stringify(data).slice(0, 100)}...`);
  
  
  //Suhel Start code to insert data into databse
   let date_ob = new Date();
   let milisecond = date_ob.getMilliseconds();  
   let date = ("0" + date_ob.getDate()).slice(-2);
   let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   let year = date_ob.getFullYear();
   let hours = date_ob.getHours();
   let minutes = date_ob.getMinutes();
   let seconds = date_ob.getSeconds();
   let id=year+month+date+hours+minutes+seconds+milisecond;
   
   var result = data.map(function(el) {
    var obj = Object.assign({}, el);
    obj.id = id;
    return obj;
  })

  
   MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
     if (err) throw err;
     var dbo = db.db("crypto");
     
     dbo.collection("customerdata").insert(result,    function(err, res) {
      if (err) throw err;
      console.log("Number of documents inserted: " + res.insertedCount);
       db.close();
     });
     
   });
   
   //Suhel End code to insert data into databse  

});
