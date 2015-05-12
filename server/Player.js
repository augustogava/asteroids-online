var Player = function() {
};

Player.prototype = {
	id: "",
	x: 0,
	y: 0,
	r: 0,
	connection: null,
	
	add: function(){
		console.log("add");
	}
}

module.exports = Player;