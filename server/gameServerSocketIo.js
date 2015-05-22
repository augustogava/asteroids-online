var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Player			= require("./Player.js");

var players = [ ];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};
	
	return false;
}

io.on('connection', function(socket){
    var index = 0;
    var p = undefined;
    
    socket.on('add_player', function(msg){
    	console.log( "add_player " + msg.id )
    	
    	p = new Player();
        p.id = msg.id;
        p.connection = socket;
        p.alive = true;
        p.x = msg.x;
        p.y = msg.y;
        p.r = msg.r;
        p.kills = 0;
        p.deaths = 0;
        p.nick = msg.nick;
        
        var message = { id: p.id, x: p.x, y:p.y, r:p.r, alive:p.alive, nick:p.nick, kills: 0, deaths: 0 };
        io.emit("add_player", message);
        
        for (i = 0; i < players.length; i++) {
    		var existingPlayer = players[i];
    		this.emit("add_player", { id: existingPlayer.id, x: existingPlayer.x, y:existingPlayer.y, r:p.r, alive:existingPlayer.alive, nick:existingPlayer.nick, kills: 0, deaths: 0 } );
    	};
    	
        var index = players.push(p) - 1;
        
       
	});
    
	socket.on('move_player', function(data){
		var movePlayer = playerById( p.id );

		// Player not found
		if (!movePlayer) {
			console.log("Player not found: "+ p.id);
			return;
		};
		
		movePlayer.x = data.x;
		movePlayer.y = data.y;
		movePlayer.r = data.r;

		io.emit("move_player", { id: movePlayer.id, x: movePlayer.x, y:movePlayer.y, r:movePlayer.r } );
	});
	
	socket.on('add_bullets', function(msg){
		if( p.alive ){
			msg.player_id = p.id;
			io.emit("add_bullets", msg);
		}
	});
	
	socket.on('add_score_player', function(data){
		io.emit("add_score_player", data);
	});
	
	socket.on('add_score_deaths', function(data){
		io.emit("add_score_deaths", data);
	});
	
	socket.on('player_die', function(msg){
		console.log("player_die" + msg.id );
		for(var i = players.length-1; i>=0; i--){
	    	if( players[i].id == msg.id){
	    		players[i].alive = false;
	    		console.log("removed: " + i)
	    	}
	    }
		
		io.emit("player_die", msg);
	});
	
	socket.on('active_player', function(data){
		var movePlayer = playerById( p.id );

		// Player not found
		if (!movePlayer) {
			console.log("Player not found: "+ p.id);
			return;
		};
		
		movePlayer.alive = data.alive;
		io.emit("active_player", { id: movePlayer.id, alive:movePlayer.alive } );
	});
	
	socket.on('disconnect', function(){
//		players.splice(index, 1);
		for(var i = players.length-1; i>=0; i--){
	    	if( p != undefined && players[i].id == p.id){
	    		players.splice(i, 1);
	    		console.log("disconnect: " + i)
	    	}
	    }
		
		io.emit("disconnect", { id: p.id } );
	});
	
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
