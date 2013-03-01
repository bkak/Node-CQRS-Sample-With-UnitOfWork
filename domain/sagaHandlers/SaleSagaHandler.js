sagaHandlerBase = require('cqrs-domain').sagaHandlerBase;

module.exports = sagaHandlerBase.extend({
    events: ['SaleCreated'],
    saga: 'SaleSaga'
});

