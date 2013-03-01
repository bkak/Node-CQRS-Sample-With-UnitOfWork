var commandHandlerBase = require('cqrs-domain').commandHandlerBase;

module.exports = commandHandlerBase.extend({
    aggregate: 'JournalAggregate',
    commands: ['CreateJournal']
});