var base = require('cqrs-domain').aggregateBase;
var _ = require('underscore');

module.exports = base.extend({
    //Commands
    Id:"",
    AccountName:"",
    CreateJournal : function(data, callback){
        console.log('CreateJournal' + data.id);
        if(data.AccountName == undefined || data.AccountName =="") {
            throw {name :"DomainException", message : "Account Name cannot be blank in Journal"};
        }
        this.apply(this.toEvent('JournalHeaderCreated', data));
        callback();
    },
    JournalHeaderCreated : function(data, callback)
    {
        console.log('JournalHeaderCreated' + data.id);
        this.Id = data.id;
        this.Accountname = data.AccountName;
    }
});