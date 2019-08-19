'use strict';
var express = require('express'),
router = express.Router();
var proController=require("../controllers/processData"); // controle all process 
router.get('/home',proController.home); //view html page 
router.get('/firstAPIData',proController.firstAPIData); 
router.get('/secondAPIData',proController.secondAPIData);
module.exports = router;