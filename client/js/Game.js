var socket;
var canvas;
var ctx;

var player = {
	id : Math.ceil(Math.random() * 1000000),
	x : 50 + Math.ceil(Math.random() * $(window).width() - 50),
	y : 50 + Math.ceil(Math.random() * $(window).height() - 50),
	r : 0,
	alive : true,
	kills : 0,
	deaths : 0,
	nick : "Player"
};

var enemies = [];
var shootList = [];

var vx = 0, vy = 0, acceleration = 0, accelerationForcex = 0, accelerationForcey = 0;
var deltaInput = undefined;
var rAdd = 4.5, accelerationFactor = 15, bulletAcceleration = 8;
var playersDeadList = [];
var pxs = [];
var smoke_player = [];
var particles = [];
var rint = 1000 / 50;
var mouseXpos = 0, mouseYpos = 0;
var key = [ 0, 0, 0, 0, 0 ]; // left, right, up, down, space
var fdsDelta = new Date().getTime();
var fps = 0, fpsAtual = 0;

//players size
var wTriangle = 15;
var hTriangle = 30;
var v = [ [ 0, -hTriangle / 2 ], [ wTriangle / 2, hTriangle / 2 ],
		[ -wTriangle / 2, hTriangle / 2 ] ];

/*************************************************
 * 
 *                    Ready	
 *                  
 *************************************************/
$( document ).ready(function() {
    initSocket();
    initCanvas();
    initKeyEvents();
});

/**
 * WEBSOCKET
 */
function initSocket(){
	socket = io("http://localhost:3000");
	
	socket.on('add_player', function(data) {
		console.info("New player: " + data.id);
		enemies.push(data);
		
		updateScore();
	});
	
	socket.on('add_score_player', function(data) {
		console.info("Add_score_player " + data.id);
		var scorePlayer = enemyById(data.id);
		scorePlayer.kills += 1;
	});
	
	socket.on('add_score_deaths', function(data) {
		console.info("add_score_deaths " + data.id);
		var scorePlayer = enemyById(data.id);
		scorePlayer.deaths += 1;
	});

	socket.on('disconnect', function(msg) {
		console.info("disconnect: " + msg.id);
		removePlayer(msg.id)
	});

	socket.on('move_player', function(data) {
		// console.log(msg)
		var movePlayer = enemyById(data.id);

		// Player not found
		if (!movePlayer) {
			console.log("Player not found: " + data.id);
			return;
		}

		movePlayer.x = data.x;
		movePlayer.y = data.y;
		movePlayer.r = data.r;

	});

	socket.on('add_bullets', function(msg) {
//		if (player.id != msg.player_id) {
			var s = new Shoot(Math.ceil(Math.random() * 1000000), msg.x, msg.y, msg.r, msg.player_id);
			var ind = shootList.push(s) - 1;
//		}
	});

	socket.on('player_die', function(data) {
		console.info("player_die event " + " == " + data.id);
		
		var diePlayer = enemyById(data.id);
		diePlayer.alive = false;
		addParticles( diePlayer.x, diePlayer.y);
		
		player.x = 50 + Math.ceil(Math.random() * $(window).width() - 50);
		player.y = 50 + Math.ceil(Math.random() * $(window).height() - 50);
		
		player.deaths += 1;
		
		removeBulletsFromPlayer(diePlayer);
		
		updateScore();
		movePlayer();
		setTimeout("activatePlayer(" + diePlayer.id + ");", 1000);
	});

	socket.on('active_player', function(data) {
		var activePlayer = enemyById(data.id);

		// Player not found
		if (!activePlayer) {
			console.log("Player not found: " + data.id);
			return;
		}

		console.info("active_player " + data.id + " live: " + data.alive)
		activePlayer.alive = data.alive;
	});
}

function initCanvas(){
	canvas = document.getElementById('canvas');
    canvas.width = $(window).width();
    canvas.height = $(window).height();
    
    ctx = canvas.getContext('2d');
}

function initKeyEvents(){
	
	canvas.addEventListener('mousemove', function(evt) {

		var mousePos = getMousePos(canvas, evt);
		mouseXpos = mousePos.x;
		mouseYpos = mousePos.y;

	}, false);
	
	document.onkeydown = function(e) {
		changeKey((e || window.event).keyCode, 1);
	}
	document.onkeyup = function(e) {
		changeKey((e || window.event).keyCode, 0);
	}
}



/*************************************************
 * 
 *                    WEBSOCKETS	
 *                  
 *************************************************/
function activatePlayer( id ) {
	var activatePlayer = enemyById(id);
	
	activatePlayer.alive = true;
	console.info("active player: " + activatePlayer.id + " alive " + activatePlayer.alive);
	
	socket.emit('active_player', {
		id : activatePlayer.id,
		alive : activatePlayer.alive
	});
}

function insertPlayer() {
	var message = {
		id : player.id,
		nick : player.nick,
		x : player.x,
		y : player.y,
		r : player.r
	};
	
	socket.emit('add_player', message);
}

function movePlayer() {
	if( vx == 0 && vy == 0 && !key[0] && !key[1])
		return ;
	
	console.info("move");
	var message = {
		x : player.x,
		y : player.y,
		r : player.r
	};
	socket.emit('move_player', message);
}

function updateServerBullets(bullet) {
	socket.emit('add_bullets', bullet);
}

function addScorePlayer( p ) {
	socket.emit('add_score_player', p);
}

function addScoreDeathsPlayer( p ) {
	socket.emit('add_score_deaths', p);
}

/*************************************************
 * 
 *            Array Manipulations	
 *                  
 *************************************************/
function enemyById(id) {
	var i;
	for (i = 0; i < enemies.length; i++) {
		if (enemies[i].id == id)
			return enemies[i];
	}
	;

	return false;
};

function existInPlayerList(find, list) {
	for (var i = 0; i < list.length; i++) {
		if (list[i].id == find.id) {
			return true;
		}
	}

	return false;
}

function removeSmoke(b) {
	for (var i = smoke_player.length - 1; i >= 0; i--) {
		if (smoke_player[i].id == b) {
			smoke_player.splice(i, 1);
		}
	}
}

function removeParticles(b) {
	for (var i = particles.length - 1; i >= 0; i--) {
		if (particles[i].id == b) {
			particles.splice(i, 1);
		}
	}
}

function removeBullet(b) {
	for (var i = shootList.length - 1; i >= 0; i--) {
		if (shootList[i].id == b) {
			shootList.splice(i, 1);
		}
	}
}

function removeBulletsFromPlayer(b) {
	for (var i = shootList.length - 1; i >= 0; i--) {
		if (shootList[i].player_id.id == b.id ) {
			shootList.splice(i, 1);
		}
	}
}

function removePlayer(b) {
	for (var i = enemies.length - 1; i >= 0; i--) {
		if (enemies[i].id == b) {
			enemies.splice(i, 1);
		}
	}
}

function removeDiedPlayer(b) {
	for (var i = playersDeadList.length - 1; i >= 0; i--) {
		if (playersDeadList[i].id == b) {
			playersDeadList.splice(i, 1);
		}
	}
}

function updateDiedList() {
	for (var i = playersDeadList.length - 1; i >= 0; i--) {
		if ((new Date().getTime() - playersDeadList[i].lastTimeDied) > 800) {
			removeDiedPlayer(playersDeadList[i].id);
		}
	}
}

/*************************************************
 * 
 *           			GAME	
 *                  
 *************************************************/
function initGame() {
	insertPlayer();
	initStars();

	setInterval(function() {
		detectaInput();
		detectaCollisions();

		calculateFps();
		process()
		draw();
	}, 1000 / 50);

	setInterval(function() {
		updateLeaderboard();
	}, 1000);
}

function calculateFps() {
	if ((new Date().getTime() - fdsDelta) > 1000) {
		fdsDelta = new Date().getTime();
		fpsAtual = fps
		fps = 0;
	}
	fps++;
	// console.info(fpsAtual)
}

function initStars() {
	pxs = [];
	for (var i = 0; i < 50; i++) {
		pxs[i] = new Star();
		pxs[i].reset();
	}
}

function process() {
	updateGamePos();
	movePlayer();
}

function shoot() {
	var x = player.x + (33 * Math.sin(convertToRadians(player.r)));
	var y = player.y + (33 * Math.cos(convertToRadians(player.r)) * -1);

	var s = new Shoot(Math.ceil(Math.random() * 1000000), x, y, player.r, player.id);
//	var ind = shootList.push(s) - 1;

	updateServerBullets(s);
}

/**
 * 		COLISAO	
 */
function line_intersects(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
 
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;
 
    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
 
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        return 1;
    }
 
    return 0; // No collision
}
function detectaCollisions() {
	for (var i = 0; i < shootList.length; i++) {
		var a = shootList[i];
		if ( a.player_id == player.id ) {
			var playerAct = enemyById( a.player_id );
			for (var e = 0; e < enemies.length; e++) {
				var b = enemies[e];
				if ( a.player_id != b.id ) {
					var xP = b.x - (wTriangle / 2);
					var yP = b.y - (hTriangle / 2);
					var wTriangleNew = wTriangle + 15;
					if (b.alive == true && (a.x + a.width) > xP
							&& a.x < (xP + wTriangleNew) && (a.y + a.height) > yP
							&& a.y < (yP + hTriangle)) {
						console.info("colidiu: " + b.id);
						b.alive = false;
						b.lastTimeDied = new Date().getTime();
						
						addParticles(b.x, b.y);
						
						playersDeadList.push(b);
	
						addScorePlayer(playerAct);
						addScoreDeathsPlayer(b);
						
						removeBulletsFromPlayer(b);
						removeBullet(a.id);
	
						player.kills += 1;
	
						updateScore();
	
						console.info(b)
						socket.emit('player_die', b);
					}
				}
			}
		}
	}
}

function addParticles(x, y){
	console.info("add particles " + x + " " + y);
	for(var e=0; e<7; e++){
		var particle = new Particles();
		var playerActualized = enemyById(player.id);
		particle.reset(x, y);
		particles.push(particle);
	}
}

function detectaInput() {
	if (key[4]
			&& ((new Date().getTime() - deltaInput) > 350 || deltaInput == undefined)) {
		shoot();
		deltaInput = new Date().getTime();
	}

	if (key[0]) { // esquerda
		player.r -= rAdd;
		// acceleration = 0;
		if (player.r < 0)
			player.r = 360;
	}

	if (key[1]) { // direita
		player.r += rAdd;

		if (player.r > 360)
			player.r = 0;
	}

	if (key[2]) { // up
		acceleration -= accelerationFactor;

		accelerationForcex = acceleration * Math.sin(convertToRadians(player.r)) * -1;
		accelerationForcey = acceleration * Math.cos(convertToRadians(player.r));

		vx += (accelerationForcex / 100); // * Math.sin( convertToRadians(
											// player.r ) ) * -1;
		vy += (accelerationForcey / 100); // * Math.cos( convertToRadians(
											// player.r ) );

		var smoke = new Smoke();
		var playerActualized = enemyById(player.id);
		smoke.reset(playerActualized.x, playerActualized.y, Math.sin(convertToRadians(player.r))
				* -1, Math.cos(convertToRadians(player.r)));
		smoke_player.push(smoke);
		
	}

	if (key[3]) { // down
		acceleration += accelerationFactor;

		accelerationForcex = acceleration
				* Math.sin(convertToRadians(player.r)) * -1;
		accelerationForcey = acceleration
				* Math.cos(convertToRadians(player.r));

		vx += (accelerationForcex / 100); // * Math.sin( convertToRadians(
											// player.r ) ) * -1;
		vy += (accelerationForcey / 100); // * Math.cos( convertToRadians(
											// player.r ) );
	}

	if (acceleration > 5)
		acceleration = 5;

	if (acceleration < -5)
		acceleration = -5;

	if (vx > 5)
		vx = 5;

	if (vx < -5)
		vx = -5;

	if (vy > 5)
		vy = 5;

	if (vy < -5)
		vy = -5;
}

function updateBullets() {
	for (var i = 0; i < shootList.length; i++) {
		var b = shootList[i];

		var bvx = bulletAcceleration * Math.sin(convertToRadians(b.r));
		var bvy = bulletAcceleration * Math.cos(convertToRadians(b.r)) * -1;

		b.x += bvx;
		b.y += bvy;

		if (b.y < 0 || b.y > $(window).height() || b.x > $(window).width()
				|| b.x < 0)
			removeBullet(b.id);
	}
}

function updateGamePos() {

	updateBullets();

	acceleration *= .99;
	acceleration *= .99;

	vx *= .997;
	vy *= .997;

	player.x += vx;
	player.y += vy;

	if( Math.abs(vx) < .5 && Math.abs(vy) < .5 && !keyPressing()  ){
		vx = 0;
		vy = 0;
	}
	
//	if(vx < .2 && vy < .2 && !key[0] && !key[1] && !key[2] && !key[3] )
//		vy = 0;
	
	if (player.y < 0)
		player.y = $(window).height();

	if (player.y > $(window).height())
		player.y = 0;

	if (player.x > $(window).width())
		player.x = 0;

	if (player.x < 0)
		player.x = $(window).width();
	
//	console.info( acceleration + " " + vx + " " + vy)

}

function drawPlayer() {
	ctx.save();
	ctx.translate(player.x, player.y);
	ctx.fillStyle = "#fff";
	ctx.rotate(convertToRadians(player.r))
	ctx.beginPath();
	ctx.moveTo(v[0][0], v[0][1]);
	ctx.lineTo(v[1][0], v[1][1]);
	ctx.lineTo(v[2][0], v[2][1]);
	ctx.closePath();
	ctx.fill();

	var l = player.nick.length;
	ctx.fillText(player.nick, -4 - (l * 2), 30);

	ctx.restore();
}

function drawPlayers() {
	for (var i = 0; i < enemies.length; i++) {
		var pl = enemies[i];
		if (pl.alive) {
			// console.log( ball )

			ctx.save();
			ctx.translate(pl.x, pl.y);
			ctx.fillStyle = "red";

			ctx.rotate(convertToRadians(pl.r))
			ctx.beginPath();
			ctx.moveTo(v[0][0], v[0][1]);
			ctx.lineTo(v[1][0], v[1][1]);
			ctx.lineTo(v[2][0], v[2][1]);
			ctx.closePath();
			ctx.fill();

			var l = pl.nick.length;
			ctx.fillText(pl.nick, -4 - (l * 2), 30);

			ctx.restore();
		}
	}
}

function drawBullets() {
	for (var i = 0; i < shootList.length; i++) {
		var b = shootList[i];
		ctx.save();
		ctx.translate(b.x, b.y);

		ctx.rotate(convertToRadians(b.r))
		ctx.beginPath();
		ctx.moveTo(0, 15);
		ctx.lineTo(0, 0);
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#ff0000';
		ctx.stroke();

		// ctx.arc(0, 0, 3, 0, 2 * Math.PI, false);
		// ctx.fillStyle = 'red';
		// ctx.fill();

		ctx.restore();
	}
}

function drawStars() {
	for (var i = 0; i < pxs.length; i++) {
		pxs[i].fade();
		pxs[i].move();
		pxs[i].draw();
	}
}

function drawSmoke() {
	for (var i = 0; i < smoke_player.length; i++) {
		if( smoke_player[i] == undefined )
			return;
		smoke_player[i].fade();
		smoke_player[i].move();
		smoke_player[i].draw();
	}
}

function drawParticles() {
	for (var i = 0; i < particles.length; i++) {
		if( particles[i] == undefined )
			return;
		
		particles[i].fade();
		particles[i].move();
		particles[i].draw();
	}
}

function drawBG() {
	ctx.clearRect(0, 0, $(window).width(), $(window).height());
}

function draw() {
	drawBG();
	drawStars();

	if (player.alive)
		drawSmoke();

	drawParticles();
	drawPlayers();
	drawBullets();
}



/*************************************************
 * 
 *           GAME INTERECTIONS	
 *           
 *************************************************/
function setNick(nick) {
	$("#overlays, #intro").hide();

	player.nick = nick

	aliveScore();

	initGame();
}

function aliveScore() { $("#leaderboard").show(); }
function hideScore() { $("#leaderboard").hide(); }
function updateScore() { var scorePlayer = enemyById(player.id);  $("#score").html(scorePlayer.kills + " / " + scorePlayer.deaths); }

function updateLeaderboard() {
	var html = "";
	var lstPlayers = enemies.slice();

	// console.info(lstPlayers);
	lstPlayers.sort(function(a, b) {
		return b.kills - a.kills;
	});

	// console.info(lstPlayers);
	var l = lstPlayers.length > 10 ? 10 : lstPlayers.length;
	for (var i = 0; i < lstPlayers.length; i++) {
		var pl = lstPlayers[i];
		html += (i + 1) + ". " + pl.nick + " (" + pl.kills + " / " + pl.deaths
				+ ") <br>";
	}

	$("#leaderboardUpdate").html(html);
}



/*************************************************
 * 
 *                  Diversos	
 *                  
 *************************************************/
function keyPressing(){
	if( !key[0] && !key[1] && !key[2] && !key[3] && !key[3] )
		return false;
	
	return true;
}

function getMousePos(canvas, evt) {
	var obj = canvas;
	var top = 0;
	var left = 0;
	while (obj && obj.tagName != 'BODY') {
		top += obj.offsetTop;
		left += obj.offsetLeft;
		obj = obj.offsetParent;
	}

	var mouseX = evt.clientX - left + window.pageXOffset;
	var mouseY = evt.clientY - top + window.pageYOffset;
	return {
		x : mouseX,
		y : mouseY
	};
}

function changeKey(which, to) {

	switch (which) {
	case 65:
	case 37:
		key[0] = to;
		break; // left
	case 87:
	case 38:
		key[2] = to;
		break; // up
	case 68:
	case 39:
		key[1] = to;
		break; // right
	case 83:
	case 40:
		key[3] = to;
		break;// down
	case 32:
		key[4] = to;
		break;// down
	}

}

function convertToRadians(degree) { return degree * (Math.PI / 180); }
