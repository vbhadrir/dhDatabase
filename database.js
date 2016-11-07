//-----------------------------------------------------------------------------
// Name:       dhDatabase Service                                   
//                                                                              
// Purpose:    Microservice                                                     
//                                                                              
// Interfaces: MongoDB database                                                 
//                                                                              
// Author:     Sal Carceller                                                    
//                                                                              
//-----------------------------------------------------------------------------
var http         = require('http');
var url          = require('url');
var express      = require('express');
var bodyParser   = require('body-parser');
var request      = require('request');
var mongoClient  = require('mongodb').MongoClient;
var helper       = require('./dhCommon/helpers'); // include helper functions from helpers.js

//-----------------------------------------------------------------------------
// Set up express                                    
var app = express();
var server = http.createServer(app);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json
//-----------------------------------------------------------------------------

var _port = 8080;      // port that the node.js server will listen on

//-----------------------------------------------------------------------------
// return code definitions, used in json responses {"RC": _rcOK}  
var _rcOK      = 0;
var _rcWarning = 1;
var _rcError   = 2;
var _rcUnknown = 99;
//-----------------------------------------------------------------------------

// global refs to the db and the Notification collection
var _dbConnected      = false;
var _dbref            = null;
var _crefNotification = null; 

//-----------------------------------------------------------------------------
// Main code body
//-----------------------------------------------------------------------------
console.log("DreamHome.Notification ==> Begin Execution");

// wait for DB module to fully initialize and connect to the backend DB
// we don't want to start the node.js server listening till we know we are fully connected to the DB
helper.dbInit( function(err)
{
  if(!err)
  { // DB connections have been established. 
    _dbref            = helper.dbref();            // save the refrence handle to the db
    _crefNotification = helper.crefNotification(); // save the refrence handle to the Notification collection

    console.log('  ... application has successfully connected to the DB');
  }
  else
  { // OH no! something has gone wrong building DB connections!
    // we still proceed and start the server listening
    // but we mark the server as having a severe DB connection error!
    console.log('  ... WARNING: application failed to connect with the backend DB!');
  }

  // get the db connected indicator and save a refrence
  _dbConnected = helper.dbConnected();

  // Start the node.js server listening
  // even if the backend DB connection fails we still want to service requests
  app.listen(_port);

  console.log('  ... application now listening on port ' + _port);
});


//-----------------------------------------------------------------------------
// creates the database
//-----------------------------------------------------------------------------
app.get('/dbCreate', function (req, res) 
{
  var retjson = {"RC":_rcOK};       // assume a good json response
  var statusCode = 200;            // assume valid http response code=200 (OK, good response)

  // test if connected to the DB
  if(_dbConnected==true)
  { // connected to the DB
    // Create Counter Collection
    _createCounterColl();

    // Create Agent Collection
    _createAgentColl();

    retjson.success  = "DB created successfully!";

    // send the http response message
    helper.httpJsonResponse(res,statusCode,retjson);
  }
  else
  { // not connected to the DB
    retjson = {};
    retjson.RC = _rcError;
    retjson.error = "ERROR: we are not connected to the DB!";
    statusCode = 500;  // internal error while connecting to the DB

    // send the http response message
    helper.httpJsonResponse(res,statusCode,retjson);
  }

  return;
});

//-----------------------------------------------------------------------------
// delete the database
//-----------------------------------------------------------------------------
app.get('/dbDelete', function (req, res) 
{
  var retjson = {"RC":_rcOK};       // assume a good json response
  var statusCode = 200;            // assume valid http response code=200 (OK, good response)

  // test if connected to the DB
  if(_dbConnected==true)
  { // connected to the DB
    // delete the database
    _deleteDB();

    retjson.success  = "DB deleted successfully!";
  }
  else
  { // not connected to the DB
    retjson = {};
    retjson.RC = _rcError;
    retjson.error = "ERROR: we are not connected to the DB!";
    statusCode = 500;  // internal error while connecting to the DB
  }

  // send the http response message
  helper.httpJsonResponse(res,statusCode,retjson);

  return;
});

//-----------------------------------------------------------------------------
// Checks if we are connected to the DB and reports list of all collections           
//-----------------------------------------------------------------------------
app.get('/dbConnected', function(req, res)
{
  var retjson = {"RC":_rcOK};       // assume a good json response
  var statusCode = 200;            // assume valid http response code=200 (OK, good response)

  // test if connected to the DB
  if(_dbConnected==true)
  { // connected to the DB
    retjson.success = "Succesfully connected to the DB.";
  
    // Let's fetch the list of collections currently stored in the DB
    _dbref.listCollections().toArray(function(err, items) 
    {
      // add the list of collections found to the return JSON
      retjson.collections = items;
  
      // send the http response message
      helper.httpJsonResponse(res,statusCode,retjson);
    });
  }
  else
  { // not connected to the DB
    retjson.RC = _rcError;
    retjson.error = "ERROR: we are not connected to the DB!";
    statusCode = 500;  // internal error while connecting to the DB
  
    // send the http response message
    helper.httpJsonResponse(res,statusCode,retjson);
  }

  return;
});

//-----------------------------------------------------------------------------
// Simple echo get method, used to sanity test service
//-----------------------------------------------------------------------------
app.get('/echo', function (req, res) 
{
  console.log("app.get(./echo function has been called.");

  var retjson = {"RC":_rcOK};      // assume a good json response
  var statusCode = 200;            // assume valid http response code=200 (OK, good response)

  // send the http response message
  retjson.success = "Echo from DreamHome.Notification service!";
  res.status(statusCode).json(retjson);
  res.end;

  return;
});


//-----------------------------------------------------------------------------
// Private function start here
//-----------------------------------------------------------------------------

// create the Counter collection that's used for uniqueIDs 
function _createCounterColl() 
{
  var crefCounter = helper.crefCounter();



  return;
}

function _createAgentColl() 
{

  return;
}


// deletes the database completely, does a drop DB
function _deleteDB() 
{
  // drop the entire database
  _dbref.dropDatabase();

  return;
}
