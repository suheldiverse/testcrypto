'use strict';
const config = require('../../config/config.js');
const MongoClient = require('mongodb').MongoClient;

//const redisHost='http://localhost';
//const redisPort=5000;

const express = require('express');
var bodyparser =  require('body-parser');
const responseTime = require('response-time')
const axios = require('axios');
const redis = require('redis');
var cors = require('cors');
const app = express();
const client = redis.createClient();
app.use(responseTime());



app.use(cors({origin:"http://localhost:3000"}));
app.use(cors({origin:"http://localhost:5000"}));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended : false}));


let url=global.gConfig.url;  
let mongoURL=global.gConfig.mongoURL;
let databaseName=global.gConfig.databaseName;

// home View html 
exports.home=function(req,res){
        var templateString = null;
        var fs = require('fs');
        var ejs = require('ejs');
        var templateString = fs.readFileSync(process.cwd()+'/api/view/myHome.ejs', 'utf-8');
        res.end(ejs.render(templateString));
}



exports.firstAPIData=function(req,res){
        let obj={'data': 'This is first API'};
        MongoClient.connect(mongoURL, { useNewUrlParser: true }, function(err, db) {
                    var dbo = db.db(databaseName);
                    dbo.collection("customerdata").find().limit(5).toArray(function(err, result) {
                        if (err) throw err;
                        console.log(result);
                        res.send({'data':result});                
                        db.close();
                    });    
        });
}  



exports.secondAPIData=function(req,res){

        //././data/data.csv
        const query = 1; //(req.query.query).trim();
        let timeInterval=15; // 15 mintus time interval
        // Try fetching the result from Redis first in case we have it cached
        return client.get(`myDataFirstApi:${query}`, (err, result) => {
                if (err) return res.json(err);
        // If that key exist in Redis store
                if (result) {
                console.log('Data is available in Redis');
                const resultJSON = JSON.parse(result);
                return res.status(200).json(resultJSON);
                } else { 
                        console.log('Data is not available in Redis');
                // Key does not exist in Redis store
                // Fetch directly from Mongodb  API
                        MongoClient.connect(mongoURL, { useNewUrlParser: true }, function(err, db) {
                                var dbo = db.db(databaseName);  
                                var arr = []; 
                                dbo.collection("trade").find({"timestamp":{ $gte:"2019-07-16T12:18:02.458Z", $lt:"2019-09-04T12:18:04.397Z" }
                        }).limit(100000).toArray(function(err, result) {
                                var cnt=result.length;
                                var volume=0;
                                for (var i=0;i<cnt;i++) {
                                     let cDateTime= result[i]['timestamp'];
                                     let currentDate = Date.parse(cDateTime);
                                      
                                     if(i==0){
                                        var endDate   = Date.parse(cDateTime)+timeInterval;
                                        var startDate = Date.parse(cDateTime);
                                        var arrayData=[];                                       
                                     }
                                    
                                    if(currentDate<=endDate){
                                        volume=volume+result[i]['size'];
                                        arrayData.push(result[i]['price']);                                                                               
                                     }else{
                                        var high  = Math.max(...arrayData);
                                        var low   = Math.min(...arrayData);
                                        var open  = arrayData[0];
                                        var close = arrayData.pop();

                                        arr.push({
                                                date:   startDate,
                                                open:   open,
                                                high:   high,
                                                low:    low,                                               
                                                close:  close,
                                                volume: volume                                               
                                              });                                              
                                        
                                        var endDate   = Date.parse(cDateTime)+timeInterval;
                                        var startDate = Date.parse(cDateTime);
                                        var arrayData=[];
                                        var volume=0;
                                        volume=volume+result[i]['size'];
                                        arrayData.push(result[i]['price']);
                                     }
                                  } // end for loop
                                if (err) return res.json(err);
                                client.setex(`myDataFirstApi:${query}`, 10, JSON.stringify({ source: 'Redis Cache', ...arr, }));
                                db.close();
                                return res.status(200).json({ source: 'Mongo db', ...arr, });                    
                                });    
                        });  // end mongo client      
                }
        });
}       
