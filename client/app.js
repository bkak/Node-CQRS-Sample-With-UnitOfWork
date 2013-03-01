var express = require('express')
    , http = require('http')
    , colors = require('./../colors')
    , socket = require('socket.io')
    , contextEventDenormalizer = require('cqrs-eventdenormalizer').contextEventDenormalizer
    , repository = require('viewmodel').write;


var app = express()
    , server = http.createServer(app)
    , io = socket.listen(server);

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express['static'](__dirname + '/public'));

    app.set('view engine', 'jade');
    app.set('views', __dirname + '/app/views');
});



io.configure(function() {
    io.set('log level', 1);
});

console.log('\nBOOTSTRAPPING:'.cyan);

var options = {
    denormalizersPath: __dirname + '/eventDenormalizers',
    repository: {
        type: 'mongoDb', //'mongoDb',
        dbName: 'cqrssamplecustom'
    },
    eventQueue: {
        type: 'mongoDb', //'mongoDb',
        dbName: 'cqrssamplecustom'
    }
};

console.log('1. -> viewmodel'.cyan);
var msgbus = require('./../msgbus');
repository.init(options.repository, function(err) {

    console.log('2. -> eventdenormalizer'.cyan);
    contextEventDenormalizer.initialize(options, function(err) {
        if(err) {
            console.log(err);
        }

        console.log('3. -> routes'.cyan);
        require('./app/routes').actions(app, options);

        console.log('4. -> message bus'.cyan);


        // on receiving an __event__ from redis via the hub module:
        //
        // - let it be handled from the eventDenormalizer to update the viewmodel storage
        msgbus.onEvent(function(data) {
            console.log(colors.cyan('eventDenormalizer -- denormalize event ' + data.event));
            contextEventDenormalizer.denormalize(data);
        });
        msgbus.onException(function(err) {
            console.log(colors.red('Emitting Domain Exception to socket io. Error -- ' + err.message));
            io.sockets.emit('exception', err.message);
        });

        // on receiving an __event__ from contextEventDenormalizer module:
        //
        // - forward it to connected browsers via socket.io

        contextEventDenormalizer.on('event', function(evt) {
            console.log(colors.magenta('\nsocket.io -- publish event ' + evt.event + ' to browser'));
            io.sockets.emit('events', evt);
        });

        // SETUP COMMUNICATION CHANNELS

        // on receiving __commands__ from browser via socket.io emit them on the ĥub module (which will
        // forward it to message bus (redis pubsub))
        io.sockets.on('connection', function(socket) {
            var conn = socket.handshake.address.address + ":" + socket.handshake.address.port;
            console.log(colors.magenta(conn + ' -- connects to socket.io'));

            socket.on('commands', function(data) {
                console.log(colors.magenta('\n' + conn + ' -- sends command ' + data.command + ':'));
                console.log(data);

                msgbus.emitCommand(data);
            });
        });

        // START LISTENING
        var port = 3000;
        console.log(colors.cyan('\nStarting server on port ' + port));
        server.listen(port);
    });
});

app.post('/save', function(req, res){
    var data = req.body;
    msgbus.emitCommand(data);
    res.send('Processing');
});