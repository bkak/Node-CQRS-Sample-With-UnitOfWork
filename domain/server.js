var colors = require('./../colors')
    , msgbus = require('../msgbus')
    , domain = require('cqrs-domain').domain;

var options = {
    commandHandlersPath: __dirname + '/commandHandlers',
    aggregatesPath: __dirname + '/aggregates',
    sagaHandlersPath: __dirname + '/sagaHandlers',  // optional, only if using sagas
    sagasPath: __dirname + '/sagas',
    eventStore: {
        type: 'mongoDb', //'inMemory',
        dbName: 'cqrssamplecustom'
    },
    commandQueue: {
        type: 'mongoDb', //'mongoDb',
        dbName: 'cqrssamplecustom'
    },
    repository: {                                   // optional
        type: 'mongoDb',                            // example with mongoDb
        dbName: 'cqrssamplecustom',
        collectionName: 'sagas',                    // optional
        host: 'localhost'
    }
};

domain.initialize(options, function(err) {
    if(err) {
        console.log(err);
    }

    // on receiving a message (__=command__) from msgbus pass it to
    // the domain calling the handle function
    msgbus.onCommand(function(cmd) {
        console.log(colors.blue('\ndomain -- received command ' + cmd.command + ' from redis:'));
        console.log(cmd);
        console.log(colors.cyan('\n-> handle command ' + cmd.command));
        domain.handle(cmd);
    });

    // on receiving a message (__=event) from domain pass it to the msgbus
    domain.on('event', function(evt) {
        console.log('domain: ' + evt.event);
        msgbus.emitEvent(evt);
    });
    domain.on('DomainException', function(err){
        console.log('DomainException: ' + err.message);
        msgbus.emitException(err);
    })  ;
    console.log('Starting domain service'.cyan);
});