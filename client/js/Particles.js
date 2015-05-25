function Particles() {
    this.settings = {time_to_live:2000, rt:1, x_origin:960, y_origin:540, random:true};

    this.reset = function(x, y) {
    	this.id = Math.ceil( Math.random()*1000000 );
    	
    	this.x = x //+ ( vx * 20 );
    	
        this.y = y //+ ( vy * 20 );
        
        this.deltaAlive = new Date().getTime();
        
        this.dx = ( Math.random() * 2 ) * ( Math.random() < 0.5 ? -1 : 1 );
        this.dy = (Math.random() * 2 ) * ( Math.random() < 0.5 ? -1 : 1 );
        this.dr = (Math.random() * 5 ) * ( Math.random() < 0.5 ? -1 : 1 );
        
//        this.dx = (Math.random()*this.settings.x_maxspeed) * (Math.random() < .5 ? -1 : 1);
//        this.dy = (Math.random()*this.settings.y_maxspeed) * (Math.random() < .5 ? -1 : 1);
        
        this.hl = this.settings.time_to_live;
        this.opacity = 1;
        this.rt = Math.random()*this.hl;
        this.settings.rt = Math.random()+1;

        this.r = Math.random()*1000;
        this.stop = Math.random()*.2+.4;
    }

    this.fade = function() {
        this.rt += this.settings.rt;
        
    }

    this.draw = function() {
    	/*if((this.rt <= 0 || this.rt >= this.hl)){
    		this.settings.rt = this.settings.rt*-1;
    	}else if(this.rt >= this.hl){
    		removeParticles(this.id);
        }*/
    	
    	if( (new Date().getTime()-this.deltaAlive) > this.settings.time_to_live){
    		removeParticles(this.id);
    	}

    	
    	ctx.save();
    	ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.rotate(convertToRadians(this.r))
        ctx.moveTo(0, 17);
		ctx.lineTo(0, 0);
        ctx.lineWidth = 1;
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = '#ff0000';
        ctx.stroke();
        ctx.restore();
        
    }

    this.move = function() {
        this.x += this.dx;
        this.y += this.dy;
        this.r += this.dr;
        this.opacity -= .006
        if(this.x > $(window).width() || this.x < 0) removeParticles(this.id);
        if(this.y > $(window).height() || this.y < 0) removeParticles(this.id);
    }
}
