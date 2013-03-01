var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('underscore');
var isolationlevel = require('tedious').ISOLATION_LEVEL;
var async  = require('async');
var config = {
    userName: 'sa',
    password: 'pass',
    server: '127.0.0.1',
    options : { database:'Auto-Millennium'}
};

var BaseRepository = function(){};

util.inherits(BaseRepository, EventEmitter)

BaseRepository.prototype.GetDataFromDb = function(query, querykey){
    var self = this;
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        getData(this, query, function(data){
            self.emit(querykey + 'datareceived', data);
        });
    });
    var getData = function(connection, query, clbk) {
        var items =[];
        var itemDef = {};
        var request = new Request(query, function(err, rowCount) {
            if (err) {
                console.log(err);
            } else {
                console.log(rowCount + ' rows');
            }
            connection.close();
            if(items.length==0) items.push(itemDef);
            clbk(items);
        });
        request.on('columnMetadata', function(columns) {
            columns.forEach(function(column) {
                itemDef[column.colName] = "";
            });
        });

        request.on('row', function(columns) {
            var item = {};
            columns.forEach(function(column) {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    console.log(column.value);
                }
                item[column.metadata.colName] = column.value;
            });
            items.push(item);
        });
        request.on('done', function(rowCount, more) {
            console.log(rowCount + ' rows returned');
        });
        connection.execSql(request);
    };
};

module.exports = BaseRepository;

BaseRepository.prototype.SaveDataToDb = function(queries, clbk)
{
    var self = this;
    var connection = new Connection(config);
    var saveFinished = _.after(queries.length, function(message){
        if(message == "success") {
            console.log('Data saved successfully');
            connection.commitTransaction(function(err){
                if(err) console.log(err);
                clbk("success");
            });
        }
        else clbk(message);
    });
    connection.on('connect', function(err) {
        if (err) {
            console.log(err);
            connection.rollbackTransaction(function(err){
                if(err) console.log(err);
                clbk("Failed");
            });
        } else {
            connection.beginTransaction(function(err){
                if(err) console.log(err);
                var queryObj = queries[0];
                saveObject(queryObj.query, function(data){
                    self.emit(queryObj.key + 'datareceived', data);
                });
                self.on(queryObj.key + 'datareceived', function(message){
                    saveFinished(message);
                });
            }, "abc");
        }
    });

    var saveObject = function( query, clbk){
        var request = new Request(query, function(error, rowCount) {
            if (error) {
                //clbk("error" + err);
                console.log(error);
                connection.rollbackTransaction(function(err){
                    if(err) console.log(err);
                    clbk("Failed - " + error);
                });
            }
            else clbk("success");
        });
        request.on('done', function(rowCount, more) {
            console.log(rowCount + ' rows returned');
        });
        connection.execSql(request);
    };
};

