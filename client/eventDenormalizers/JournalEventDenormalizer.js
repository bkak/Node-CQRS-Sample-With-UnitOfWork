var base = require('cqrs-eventdenormalizer').eventDenormalizerBase;
var BaseRepo = require('./../Repository/baseRepository');

module.exports = base.extend({
    events: ['JournalHeaderCreated'],
    collectionName: 'Journal',
    JournalHeaderCreated :  function(evt, aux, callback){
        console.log('Denormalizing Journal Header');
    }
    });