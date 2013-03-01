var base = require('cqrs-domain').aggregateBase;
var _ = require('underscore');

module.exports = base.extend({
    //Commands
    Id:"",
    CustomerName:"",
    //LastName : obs.computed(return firstname + " Sir "),
    LineItems:[],
    CreateSale : function(data, callback){
        this.apply(this.toEvent('SaleCreated', data));
        if(data.SalesOrderLines)
        {
            for(var i = 0; i < data.SalesOrderLines.length;)
            {
                this.apply(this.toEvent('LineItemAdded', data.SalesOrderLines[i]));
                i = i + 1;
            }
        }
        callback();
    },
    UpdateSale : function(data, callback){
        this.apply(this.toEvent('SaleUpdated', data));
        if(data.SalesOrderLines)
        {
            for(var i = 0; i < data.SalesOrderLines.length;)
            {
                var lineItem = _.where(this.LineItems, {Id : data.SalesOrderLines[i].Id});
                if(lineItem.length > 0)
                    this.apply(this.toEvent('LineItemUpdated', data.SalesOrderLines[i]));
                else
                    this.apply(this.toEvent('LineItemAdded', data.SalesOrderLines[i]));
                i = i + 1;
            }
        }
        callback();
    },
    DeleteSale : function(data, callback){
        this.apply(this.toEvent('SaleDeleted', data));
        callback();
    },
    AddLine : function(data, callback)
    {
        this.apply(this.toEvent('LineItemAdded', data));
        callback();
    },
    //Events
    SaleCreated : function(data)
    {
        this.Id = data.Id;
        this.CustomerName = data.CustomerName; //this.set(data);
    },
    SaleUpdated : function(data)
    {
        this.Id = data.Id;
        this.CustomerName = data.CustomerName; //this.set(data);
    },
    SaleDeleted : function(data)
    {
        this.set('destroyed', true);
    },
    LineItemAdded : function(data)
    {
        var lineItem = new SalesItem(data.Id, data.Item, data.Rate, data.Amount, data.Total);
        this.LineItems.push(lineItem);
    },
    LineItemUpdated : function(data)
    {
        var lineItem = _.where(this.LineItems, {Id : data.Id});
        lineItem[0].Update(data.Id, data.Item, data.Rate, data.Amount, data.Total);
    }


});
var SalesItem = function(id, item, rate, amount, total)
{
    this.Id = id;
    this.Item = item;
    this.Rate = rate;
    this.Amount = amount;
    this.Total = total;
    var self = this;
    this.Update = function(id, item, rate, amount, total)
    {
        self.Id = id;
        self.Item = item;
        self.Rate = rate;
        self.Amount = amount;
        self.Total = total;
    }
}