var Shoot = function(id, x,y,r, player_id) {
	this.add(id, x,y,r, player_id);
};

Shoot.prototype = {
	id: 0,
	x: 0,
	y: 0,
	width: 10,
	height: 10,
	r: 0,
	index: 0,
	player_id: 0,
	
	add: function( id, x, y, r, player_id){
		this.id = id ;
		this.x = x;
		this.y = y;
		this.r = r;
		this.player_id = player_id;
	}
}