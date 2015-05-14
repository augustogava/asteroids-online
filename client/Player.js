var Player = function() {
};

Player.prototype = {
	id: "",
	x: 0,
	y: 0,
	r: 0,
	show: true,
	kills: 0,
	deaths: 0,
	nick: "",
	connection: null,
	
	add: function(){
		console.log("add");
	}
}

module.exports = Player;