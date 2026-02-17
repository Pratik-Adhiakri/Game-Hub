// i am back now lets make and do the logic
class AudioSynthesizer{
    constructor(){
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = 0.3;
    }
    playshootsound(){
        if(this.context.state==='suspended') this.context.resume();
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, this.context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100,this.context.currentTime+0.1);
            oscillator.gain.setValueAtTime(0.1,this.context.currentTime);
            oscillator.gain.exponentialRampToValueAtTime(0.01,this.context.currentTime+0.1);
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            oscillator.start();
            oscillator.stop(this.context.currentTime + 0.1);
    }
     playexplosionsound(){
        if(this.context.state==='suspended') this.context.resume();
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(100,this.context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100,this.context.currentTime + 0.3);
            oscillator.gain.setValueAtTime(0.2,this.context.currentTime);
            oscillator.gain.exponentialRampToValueAtTime(0.01,this.context.currentTime+0.3);
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            oscillator.start();
            oscillator.stop(this.context.currentTime+ 0.3);
    }
        playhitsound(){
            if(this.context.state==='suspended')this.context.resume();
                const oscillator =this.context.createOscillator();
                const gainNode =this.context.createGain();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(200,this.context.currentTime);
                oscillator.frequency.linearRampToValueAtTime(100,this.context.currentTime+0.1);
                oscillator.connect(gainNode);
                gainNode.connect(this.context.destination);
                oscillator.start();
                oscillator.stop(this.context.currentTime+0.1);
            }
            playupgradesound(){
                if(this.context.state==='suspended') this.context.resume();
                const oscillator = this.context.createOscillator();
                const gainNode =this.context.createGain();
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(400,this.context.currentTime);
                oscillator.frequency.linearRampToValueAtTime(800,this.context.currentTime+0.2);
                gainNode.gain.setValueAtTime(0.1,this.context.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.01,this.context.currentTime+0.3);
                oscillator.connect(gainNode);
                gainNode.connect(this.context.destination);
                oscillator.start();
                oscillator.stop(this.context.currentTime+0.3);
            }
            //well this wasnt necessary but why not it is game hehe
}
class vector2{
    constructor(x,y){
        this.x =x;
        this.y = y;
    }
    add(other){
        return new vector2(this.x+other.x,this.y+other.y);
    }
    subtract(other){
        return new vector2(this.x-other.x,this.y=other.y);
    }
    multiply(scalar){
        return new vector2(this.x*scalar,this.y*scalar);
    }
    magnitude(){
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    normalize(){
        const mag = this.magnitude();
        if(mag===0) return new vector2(0,0);
        return new vector2(this.x/mag,this.y/mag);
    }
}
//i am back
class Particle{
    constructor(x,y,color,speed,life){
        this.position =new vector2(x,y);
        this.velocity = new vector2(Math.random()-0.5,Math.random()*speed);
        this.color =color;
        this.life = life;
        this.maxLife =life;
        this.size = Math.random()*3+1;
    }
    update(){
        this.position =this.position.add(this.velocity);
        this.life--;
        this.size =this.size*0.95;
    }
    draw(ctx){
        ctx.save();
        ctx.globalAlpha =this.life/this.maxLife;
        ctx.fillStyle=this.color;
        ctx.beginPath();
        ctx.arc(this.position.x,this.position.y,this.size,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}
class FloatingText{
    constructor(x,y,text,color){
        this.position=new vector2(x,y);
        this.text = text;
        this.color = color;
        this.life=60;
        this.velocity= new vector2(0,-1);
    }
    update(){
        this.position = this.position.add(this.velocity);
        this.life--;
    }
    draw(ctx){
        ctx.save();
        ctx.globalAlpha= Math.max(0,this.life/60);
        ctx.fillStyle = this.color;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(this.text,this.position.x,this.position.y);
        ctx.restore();
    }
}
class Projectile{
    constructor(x,y,direction,speed,damage,color){
        this.position =new vector2(x,y);
        this.direction= direction;
        this.speed =speed;
        this.damage =  damage;
        this.color = color;
        this.active = true;
        this.radius =3;
        this.trail =[];
    }
    update(){
        this.trail.push({
            x: this.position.x,
            y:this.position.y
        });
        if(this.trail.length>5)this.trail.shift();
        this.position = this.position.add(this.direction.multiply(this.speed));
        if(this.position.x<0||this.position.x>game.canvas.width||this.position.y<0||this.position.y<game.canvas.height){
            this.active =false;
        }
    }
    draw(ctx){
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth=2;
        ctx.beginPath();
        if(this.trail.length>0){
            ctx.moveTo(this.trail[0].x,this.trail[0].y);
            for(let i=1;i<this.trail.length;i++){
                ctx.lineTo(this.trail[i].x,this.trail[i].y);
            }
            ctx.lineTo(this.position.x,this.position.y);
        }
        ctx.stroke();
        ctx.fillStyle=this.color;
        ctx.beginPath();
        ctx.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}
class Enemy{
    constructor(type,waveNumber){
        this.type =type;
        this.active = true;
        const side =Math.floor(Math.random()*4);
        let x,y;
        const buffer =50;
        if(side===0){
            x=Math.random()*game.canvas.width;
            y = -buffer;
        }else if(side===1){
            x=game.canvas.width+buffer;
            y= Math.random()*game.canvas.height;
        }else if(side===2){
            x = Math.random()*game.canvas.width;
            y= game.canvas.height+ buffer;
        }else{
            x =buffer;
            y = Math.random()*game.canvas.height;
        }
        this.position=new vector2(x,y);
        const center = new vector2(game.canvas.width/2,game.canvas.height/2);
        this.direction =center.subtract(this.position).normalize();
        this.angle=Math.atan2(this.direction.y,this.direction.x);
        let difficultyMultiplier =1;
        if(waveNumber>2){
            difficultyMultiplier = 1+((waveNumber-2)*0.2);
        }
        if(this.type==='fast'){
            this.speed =(2.0+(waveNumber*0.1))*difficultyMultiplier;
            this.health = (8+(waveNumber*1.5))*difficultyMultiplier;
            this.color ='#ff0055';
            this.radius=10;
            this.scoreValue = 20;
            this.creditsValue= 5;
            this.damage=10;
        }else if(this.type==='tank'){
            this.speed=(0.6+(waveNumber*0.05))*difficultyMultiplier;
            this.health = (35+(waveNumber*4))*difficultyMultiplier;
            this.color ='#aa00ff';
            this.radius =15;
            this.scoreValue =30;
            this.creditsValue=10;
            this.damage = 15;
        }
    }
    update(){
    const center = new vector2(game.canvas.width/2,game.canvas.height/2);
    this.direction =center.subtract(this.position).normalize();
    this.position = this.position.add(this.direction.multiply(this.speed));
    this.angle =Math.atan2(this.direction.y,this.direction.x);
    const dist =this.position.subtract(center).magnitude();
    if(dist<40){
        game.player.takeDamage(this.damage);
        this.active =false;
        game.audio.playhitsound();
        game.createExplosion(this.position.x,this.position.y,'#ff5500',10);
    }
    }
    takeDamage(amount){
        this.health -=amount;
        game.createFloatingText(this.position.x,this.position.y-10,Math.floor(amount), '#fff');
        if(this.health<=0){
            this.active = false;
            game.addScore(this.scoreValue);
            game.addCredits(this.creditsValue);
            game.createExplosion(this.position.x,this.position.y,this.color,20);
            game.audio.playexplosionsound();
        }
    }
    draw(ctx){
        ctx.save();
        ctx.translate(this.position.x,this.position.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        if(this.type==='fast'){
            ctx.beginPath();
            ctx.moveTo(10,0);
            ctx.lineTo(-10,8);
            ctx.lineTo(-6,0);
            ctx.lineTo(-10,-8);
            ctx.closePath();
            ctx.fill();
        } else if(this.type==='tank'){
            ctx.fillRect(-15,-15,30,30);
            ctx.strokeStyle ='#fff';
            ctx.strokeRect(-15,-15,30,30);
        }else{
            ctx.beginPath();
            ctx.moveTo(15,0);
            ctx.lineTo(-10,10);
            ctx.lineTo(-10,-10);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}
//i am so tired
class Player{
    constructor(){
        this.rotation=0;
        this.health =100;
        this.maxHealth =100;
        this.fireRate =15;
        this.fireCooldown =0;
        this.damage =10;
        this.projectileSpeed =8;
        this.multiShot =0;
        this.color ='#00f3ff';
    }
    reset(){
        this.health =100;
        this.fireRate =15;
        this.damage = 10;
        this.fireRate=15;
        this.projectileSpeed=8;
        this.multiShot = 0;
    }
    update(mouseX,mouseY){
        const centerX = game.canvas.width/2;
    }
}