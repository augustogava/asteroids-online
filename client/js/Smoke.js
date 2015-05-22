function Smoke() {
    this.settings = {time_to_live:1000, x_maxspeed:3, y_maxspeed:0, radius_max:2.7, rt:1, x_origin:960, y_origin:540, random:true, blink:true};

    this.reset = function(x, y, vx, vy) {
    	this.id = Math.ceil( Math.random()*1000000 );
    	
    	this.x = x + ( vx * 20 );
    	this.x = this.x - 3 + (Math.random()*7);
    	
        this.y = y + ( vy * 20 );
        
        this.deltaAlive = new Date().getTime();
        
        this.r = ((this.settings.radius_max-1)*Math.random()) + .5;
        
        this.dx = ( vx * 2 ) * Math.random() < 0.5 ? -1 : 1;
        
        this.dy = vy * 1  * Math.random() < 0.5 ? -1 : 1;
        
//        this.dx = (Math.random()*this.settings.x_maxspeed) * (Math.random() < .5 ? -1 : 1);
//        this.dy = (Math.random()*this.settings.y_maxspeed) * (Math.random() < .5 ? -1 : 1);
        
        this.hl = (this.settings.time_to_live/rint)*(this.r/this.settings.radius_max);
        
        this.opacity = 1;
        this.rt = Math.random()*this.hl;
        this.settings.rt = Math.random()+1;
        
        this.stop = Math.random()*.2+.4;
        
        this.settings.xdrift *= Math.random() * (Math.random() < .5 ? -1 : 1);
        this.settings.ydrift *= Math.random() * (Math.random() < .5 ? -1 : 1);
    }

    this.fade = function() {
        this.rt += this.settings.rt;
        
    }

    this.draw = function() {
    	if(this.settings.blink && (this.rt <= 0 || this.rt >= this.hl)){
    		this.settings.rt = this.settings.rt*-1;
    	}else if(this.rt >= this.hl){
        	removeSmoke(this.id);
        }
    	
    	if( (new Date().getTime()-this.deltaAlive) > this.settings.time_to_live){
    		removeSmoke(this.id);
    	}
    	
        var new_opacity = 0+(this.rt/this.hl);
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,Math.PI*2,true);
        ctx.closePath();
        
//        g = ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r*new_opacity);
//        g.addColorStop(0.0, 'rgba(255,255,255,'+new_opacity+')');
//        g.addColorStop(this.stop, 'rgba(77,101,181,'+(new_opacity*.6)+')');
//        g.addColorStop(1.0, 'rgba(77,101,181,0)');
//       
        this.opacity -= .05;
        
        ctx.fillStyle = "rgba(244,244,244," + this.opacity + ")";
        ctx.fill();
        
    }

    this.move = function() {
        this.x += (this.rt/this.hl)*this.dx;
        this.y += (this.rt/this.hl)*this.dy;
        this.r += .1;
        
        if(this.x > $(window).width() || this.x < 0) removeSmoke(this.id);
        if(this.y > $(window).height() || this.y < 0) removeSmoke(this.id);
    }
}
