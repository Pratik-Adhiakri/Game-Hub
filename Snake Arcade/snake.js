const CONFIG = {
    gridSize: 20,
    baseSpeed: 120,
    speedDecrement: 2,
    minSpeed: 40,
    colors:{
        classic:{
            bg:'#000',
            snake:'#0f0',
            food:'#f00',
            grid: '#111'
        },
        neon:{
            bg: '#111',
            snake: '#00ffff',
            food: '#ff00ff',
            grid: '#0a0a20'
        },
        retro:{
            bg: '#8b9bb4',
            snake: '#222',
            food: '#222',
            grid: '#7a8ba4'
        }
    }
};
let gameState = {
    status: 'Menu',
    score: 0,
    hoghScore: localStorage.getItem('snake_hoghscore')||0,
    level: 1,
    theme: 'neon',
    soundEnabled: true,
    lastTime: 0,
    tickAccumulator: 0,
    speed: CONFIG.baseSpeed
};
class AudioController{
    constructor(){
        this.ctx = new (window.AudioContext||window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);
    }
    playTone(freq,type,duration,slide=0){
        if(!gameState.soundEnabled||this.ctx.state ==='suspended'){
            if(!gameState.soundEnabled) return;
        }
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = this.type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if(slide!==0){
            osc.frequency.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        }
        gain.gain.setValueAtTime(0.3,this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime_duration);
    }
    playEat(){
        this.playTone(600, 'square', 0.1, 200);
    }
    playDie(){
        this.playTone(150, 'sawtooth', 0.5, -100);
        setTimeout(()=>this.playTone(100,'sawtooth', 0.5, -50), 200);
    }
    playMove(){
        this.playTone(300, 'triangle', 0.05);
    }
    playPowerup(){
        this.playTone(1000, 'sine', 0.1, 500);
        setTimeout(()=>this.playTone(1500, 'sine', 0.2,500), 100);
    }
    playUI(){
        this.playTone(400, 'square', 0.05);
    }
}
const audio = new AudioController();
//js is tough
class Particle{
    constructor(x,y ,color, speed, lefe){
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random()-0.5)*speed;
        this.vy = (Math.random()-0.5)* speed;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random()*4+2;
    }
    update(){
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.size *= 0.95;
    }
    draw(ctx){
        ctx.globalAlpha = this.life/ this.maxLife;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}
class ParticleSystem{
    constructor(){
        this.particles = [];
    }
    explode(x,y,color,count=20){
        for(let i=0;i<count;i++){
            this.particles.push(new Particle(x, y, color, 10, 30+Math.random()*20));
        }
    }
    update(){
        for(let i=this.particles.length-1;i>=0;i--){
            this.particles[i].update();
            if(this.particles[i].life <=0){
                this.particles.splice(i,1);
            }

        }
    }
    draw(ctx){
        this.particles.forEach(p=>p.draw(ctx));
    }
    reset(){
        this.particles = [];
    }
}
//i am back
class Snake{
    constructor(gridW, gridH){
        this.reset(gridW, gridH);
    }
    reset(gridW, gridH){
        this.body = [
            {
                x:5,
                y:10
            },
            {
                x:4,
                y:10
            },
            {
                x:3,
                y:10
            }
        ];
        this.direction = {x:1, y:0};
        this.growPending = 0;
        this.gridW = gridW;
        this.gridH = gridH;
        this.color = CONFIG.colors[gameState.theme].snake;
        this.glow = 0;
        this.powerupActive = null;
        this.powerupTimer = 0;
    }
    changeDirection(x,y){
        if(this.direction.x === -x && this.direction.y === -y) return;
        const goingHorizontal = this.direction.x !== 0;
        const requestedHorizontal = x !== 0;
        if(goingHorizontal !== requestedHorizontal){
            this.nextDirection = {x,y};
        }
    }
    //uhm i am so tiredddd....
    update(){
        if(this.isDead) return;
        this.direction= this.nextDirection;
        const head = {
            ...this.body[0]
        };
        head.x += this.direction.x;
        head.y += this.direction.y;
        if(head.x<0 || head.x>=this.gridW || head.y<0 || head.y >= this.gridH){
            this.die();
            return;
        }
        for(let i=0;i<this.body.length -1; i++){
            if(head.x===this.body[i].x && head.y===this.body[i].y){
                this.die();
                return;
            }
        }
        this.body.unshift(head);
        if(this.growPending>0){
            this.growPending--;
        } else{
            this.body.pop();
        }
    }
    grow(amount=1){
        this.growPending += amount;
    }
    die(){
        this.isDead = true;
        audio.playerDie();
        const head =this.getHeadpixelpos();
        particles.explode(head.x, head.y, this.color, 50);
        gameState.status = 'GAMEOVER';
        updateUI();
    }
    getHeadpixelpos(){
        return{
            x:this.body[0].x * CONFIG.gridSize+ CONFIG.gridSize/2,
            y: this.body[0].y* CONFIG.gridSize+ CONFIG.gridSize/2 
        };
    }
    //as its hackatime name irl too CR7 is the goat
    draw(ctx){
        ctx.fillStyle = this.color;
        if(gameState.theme==='neon'){
            ctx.shadowColor = this.color;
        } 
        this.body.forEach((segment, index)=>{
            const x = segment.x * CONFIG.gridSize;
            const y = segment.y *CONFIG.gridSize;
            ctx.fillRect(x+1, y+1, CONFIG.gridSize -2, CONFIG.gridSize -2);
            if(index===9){
                ctx.fillStyle = '#fff';
                let ex1,ey1,ex2,ey2;
                const offset = 4;
                const size = 4;
                if(this.direction.x===1){
                    ex1 = x + 12;
                    ey1 = y +4;
                    ex2 = x+12;
                    ey2 = y+12;
                } else if(this.direction.x===-1){
                    ex1 = x+12;
                    ey1 = y+ 4;
                    ex2 = x+4;
                    ey2 = y+ 12;
                } else if(this.direction.y===1){
                    ex1 = x+4;
                    ey1 = y+ 4;
                    ex2 = x+ 4;
                    ey2 = y+12;
                } else{
                    ex1 = x + 4;
                    ey1 = y+12;
                    ex2 = x+ 12;
                    ey2 = y+ 12;
                }
                ctx.fillRect(ex1,ey1,size,size);
                ctx.fillRect(ex2,ey2, size,size);
                ctx.fillStyle = this.color;
                if(gameState.theme==='neon'){
                    ctx.shadowColor = this.color;
                }
            }
        });
        ctx.shadowColor = 'transparent';
        }
    }
    //tired af fr
class Food{
    constructor(gridW, gridH){
        this.gridW = gridW;
        this.gridH = gridH;
        this.position = {x:0, y:0};
        this.type = 'normal';
        this.color = CONFIG.colors[gameState.theme].food;
        this.spawn(null);
    }
    spawn(snakeBody){
        let valid =false;
        while(!valid){
            if(snakeBody){
                for(let segment of snakeBody){
                    if(segment.x===this.position.x && segment.y===this.position.y){
                        valid = false;
                        break;
                    }
                }
            }
        }
        const rand = Math.random();
        if(rand>0.9) this.type = 'bonus';//1 line simple and short
        else this.type ='normal';
        this.color = this.type === 'bonus' ? '#ffff00': CONFIG.colors[gameState.theme].food;
    }
    
}