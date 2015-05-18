function Star() {
    this.settings = {time_to_live:8000, x_maxspeed:3, y_maxspeed:0, radius_max:1.7, rt:1, x_origin:960, y_origin:540, random:true, blink:true};

    this.reset = function() {
    	this.x = (this.settings.random ? $(window).width()*Math.random() : this.settings.x_origin);
        this.y = (this.settings.random ? $(window).height()*Math.random() : this.settings.y_origin);
        this.r = ((this.settings.radius_max-1)*Math.random()) + 1.3;
        
        this.dx = (Math.random()*this.settings.x_maxspeed) * (Math.random() < .5 ? -1 : 1);
        this.dy = (Math.random()*this.settings.y_maxspeed) * (Math.random() < .5 ? -1 : 1);
        
        this.hl = (this.settings.time_to_live/rint)*(this.r/this.settings.radius_max);
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
    	if(this.settings.blink && (this.rt <= 0 || this.rt >= this.hl)) this.settings.rt = this.settings.rt*-1;
        else if(this.rt >= this.hl) this.reset();
        var new_opacity = 1-(this.rt/this.hl);
        
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,Math.PI*2,true);
        ctx.closePath();
        
//        g = ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r*new_opacity);
//        g.addColorStop(0.0, 'rgba(255,255,255,'+new_opacity+')');
//        g.addColorStop(this.stop, 'rgba(77,101,181,'+(new_opacity*.6)+')');
//        g.addColorStop(1.0, 'rgba(77,101,181,0)');
//        
        ctx.fillStyle = "rgba(255,255,255," + new_opacity + ")";
        ctx.fill();
        
    }

    this.move = function() {
        this.x += (this.rt/this.hl)*this.dx;
        this.y += (this.rt/this.hl)*this.dy;
        if(this.x > $(window).width() || this.x < 0) this.dx *= -1;
        if(this.y > $(window).height() || this.y < 0) this.dy *= -1;
    }
}
