//var EventEmitter = require('events').EventEmitter;
var sagaBase = require('cqrs-domain').sagaBase;

//var commandEmitter = new EventEmitter();

module.exports = sagaBase.extend({
    SaleCreated: function(evt) {
        console.log( 'SaleSaga : ' + evt.id+ "_JV");
        var cmd =  ({id : evt.id + "_JV", AccountName : evt.CustomerName});
        var command = {id : evt.id + "_JV", payload:cmd, command : 'CreateJournal'};
        console.log('in sale saga');
        this.sendCommand(command);
        //console.log('command sent');
        //commandEmitter.emit('done');
    }
});