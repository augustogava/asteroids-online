var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Player			= require("./Player.js");

var players = [ ];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

setInterval(function() { 
    var message = [];
	 
    for (var i=0; i < players.length; i++) {
    	message[message.length] = { id: players[i].id, x: players[i].x, y:players[i].y, r:players[i].r };
    }
    io.emit("position", message);
}, 10);


io.on('connection', function(socket){
    var index = 0;
    var p = undefined;
    socket.on('add_player', function(msg){
//    	console.log( players )
    	console.log( "add_player " + msg.id )
    	
    	p = new Player();
        p.id = msg.id;
        p.connection = socket;
        
        var index = players.push(p) - 1;
	});
    
	socket.on('update_player', function(msg){
//		console.log("update_player" + msg.id + " x: " + msg.x + " y: " + msg.y);
		 for (var i=0; i < players.length; i++) {
	    	if( players[i].id == msg.id){
	    		players[i].x = msg.x;
	    		players[i].y = msg.y;
	    		players[i].r = msg.r;
	    	}
	    }
	});
	
	socket.on('add_bullets', function(msg){
		io.emit("add_bullets", msg);
	});
	
	socket.on('player_die', function(msg){
		console.log("player_die" + msg.id );
		for(var i = players.length-1; i>=0; i--){
	    	if( players[i].id == msg.id){
	    		players.splice(i, 1);
	    		console.log("removed: " + i)
	    	}
	    }
		
		io.emit("player_die", msg);
	});
	
	socket.on('disconnect', function(){
//		players.splice(index, 1);
		for(var i = players.length-1; i>=0; i--){
	    	if( p != undefined && players[i].id == p.id){
	    		players.splice(i, 1);
	    		console.log("removed: " + i)
	    	}
	    }
	});
	
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
