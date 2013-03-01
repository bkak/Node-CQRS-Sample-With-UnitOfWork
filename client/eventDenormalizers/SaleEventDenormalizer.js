var base = require('cqrs-eventdenormalizer').eventDenormalizerBase;
var BaseRepo = require('./../Repository/baseRepository');

module.exports = base.extend({
    events: ['SaleCreated',{'SaleUpdated': 'update'}, {'SaleDeleted': 'delete'},'LineItemAdded'],
    collectionName: 'Sale',

    SaleCreated : function(evt, aux, callback){
        var data = evt.payload;
        console.log('Received Sale Created : ' + data.id);
        var queries = [{ query : "insert into SalesDummy values('" + data.id + "','"+ data.CustomerName+ "')", key:'SaleCreated' + evt.id}];
        console.log(queries[0].query);
        var baseRepo = new BaseRepo();
        baseRepo.SaveDataToDb(queries, function(message){
            if(message == "success"){
                console.log(message + " : " + 'Sale Created for event : ' + evt.Id );
            }
            else {
                console.log(message);
            }
        });
        callback(null);
    },

    LineItemAdded :function(evt, aux, callback)
    {
        var data = evt.payload;
        console.log('Received Line Item Added: ' + data.id);
        var queries = [{ query : "insert into SalesDummyItem values('" + data.id + "','"+ data.Item+ "'," + data.Rate + ","+ data.Amount + "," + data.Total + ",'" + evt.id +  "')", key:'SalesItemCreated' + data.id}];
        console.log(queries[0].query);
        var baseRepo = new BaseRepo();
        baseRepo.SaveDataToDb(queries, function(message){
            if(message =="success"){
                console.log(message + " : " + 'Sales Item Created for event : ' + data.id );
            }
            else {
                console.log(message);
            }
        });
        callback(null);
    }
});