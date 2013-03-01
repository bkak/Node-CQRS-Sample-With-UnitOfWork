var index = function()
{
	this.salesOrders = ko.observableArray();
	this.loadOrders = function(){
		var self = this;
        var data =[{id:1, CustomerName:"ABC"},{id:2, CustomerName:"PQR"}];
		//$.getJSON('/getsalesorderjson', function(data)
		{
            $.each(data, function(){
                var newline = new salesOrder();
                newline.id(this.id);
                newline.CustomerName(this.CustomerName);
                self.salesOrders.push(newline);
            });
	    };
	};
};
var salesOrder = function(){
	this.id = ko.observable(GenerateGUID());
	this.CustomerName = ko.observable();
	this.SalesOrderLines = ko.observableArray();
    this.Error = ko.observable();
	var self = this;
	this.Total = ko.computed(function(){
		var total =0;
		$.each(self.SalesOrderLines(), function(){
			total = total + this.Total();
		});
		return total;
	});
    var socket = io.connect('http://localhost');
    socket.on('exception', function (data) {
        self.Error(data);
    });
	this.GetItems = function(){
		return;
		$.getJSON('/getitems', function(data){
			$.each(data, function(){
				var newline = new salesOrderLine();
				newline.Item(this.name);
				newline.Rate(this.rate);
				self.SalesOrderLines.push(newline);
			});		  
		  });
	};
	this.AddLine = function(){
		self.SalesOrderLines.push(new salesOrderLine());
	};
	this.Create = function(){
		var jsondata = ko.toJSON(self);

		 var jsd = jQuery.parseJSON(jsondata);
         self.Error("");
      //  jsd["id"] = "a2ce72c2-72a3-4cb3-9dd6-4036fe59ba4b";
        var cmd =  { id: jsd.id, command: 'CreateSale', payload: jsd };
		$.post("/save", cmd, function() { alert('Processing');});
	};
    this.Update= function(){
        var jsondata = ko.toJSON(self);
        var jsd = jQuery.parseJSON(jsondata);
       // jsd["id"] = "a2ce72c2-72a3-4cb3-9dd6-4036fe59ba4b";
        var cmd =  { id: jsd.id, command: 'UpdateSale', payload: jsd };
        $.post("/save", cmd, function() { alert('success');});
    };
}
var salesOrderLine = function(){
	this.id = ko.observable();
	this.Item = ko.observable();
	this.Rate = ko.observable(0);
	this.Amount = ko.observable(1);
	var self = this;
	this.Total = ko.computed(function(){
		return self.Rate() * self.Amount();
	});
};
$(document).ready(function () {
	if($("#sectionsalesorder").length >0)
	{
		var so = new salesOrder();
		ko.applyBindings(so, $("#sectionsalesorder")[0]);
	}
	else
	{
		var so = new index();
		so.loadOrders();
		ko.applyBindings(so, $("#sectionsalesorderindex")[0]);
	}

});
function GenerateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}