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