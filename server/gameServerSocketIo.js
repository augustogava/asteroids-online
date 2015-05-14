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
    	message[message.length] = { id: players[i].id, x: players[i].x, y:players[i].y, r:players[i].r, show:players[i].show, kills:players[i].kills, deaths:players[i].deaths, nick:players[i].nick };
    }
//    console.log(message)
    io.emit("update_player", message);
}, 10);


io.on('connection', function(socket){
    var index = 0;
    var p = undefined;
    
    socket.on('add_player', function(msg){
    	console.log( "add_player " + msg.id )
    	
    	p = new Player();
        p.id = msg.id;
        p.connection = socket;
        p.show = true;
        
        var index = players.push(p) - 1;
	});
    
	socket.on('update_player', function(msg){
//		console.log("update_player" + msg.id + " x: " + msg.x + " y: " + msg.y);
		 for (var i=0; i < players.length; i++) {
	    	if( players[i].id == msg.id){
	    		players[i].nick = msg.nick;
	    		players[i].x = msg.x;
	    		players[i].y = msg.y;
	    		players[i].r = msg.r;
	    		players[i].kills = msg.kills;
	    		players[i].deaths = msg.deaths;
	    		players[i].show = msg.show;
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
	    		//players.splice(i, 1);
	    		players[i].show = false;
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
