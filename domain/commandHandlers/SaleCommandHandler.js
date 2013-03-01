var commandHandlerBase = require('cqrs-domain').commandHandlerBase;

module.exports = commandHandlerBase.extend({

    aggregate: 'SalesAggregate',

    commands: ['CreateSale', 'UpdateSale', 'DeleteSale' ]

});