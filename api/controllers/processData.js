'use strict';
const config = require('../../config/config.js');
const MongoClient = require('mongodb').MongoClient;

//const redisHost='http://localhost';
//const redisPort=5000;

const express = require('express');
const responseTime = require('response-time')
const axios = require('axios');
const redis = require('redis');
const app = express();
const client = redis.createClient();
app.use(responseTime());


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
        const query = 1; //(req.query.query).trim();
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
                                dbo.collection("trade").find().limit(5).toArray(function(err, result) {
                                if (err) return res.json(err);
                                client.setex(`myDataFirstApi:${query}`, 60, JSON.stringify({ source: 'Redis Cache', ...result, }));
                                db.close();
                                return res.status(200).json({ source: 'Mongo db', ...result, });                    
                                });    
                        });       
                }
        });
}

    
       