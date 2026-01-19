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
    status: 'MENU',
    score: 0,
    highScore: localStorage.getItem('snake_highscore')||0,
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
            this.ctx.resume();
        }
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if(slide!==0){
            osc.frequency.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        }
        gain.gain.setValueAtTime(0.3,this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01,this.ctx.currentTime+duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
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
    constructor(x,y ,color, speed, life){
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
        this.nextDirection = {x:1, y:0};
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
        audio.playDie();
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
            this.position.x = Math.floor(Math.random() * this.gridW);
            this.position.y = Math.floor(Math.random() * this.gridH);
            valid = true;
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
    draw(ctx){
        const x= this.position.x * CONFIG.gridSize;
        const y = this.position.y* CONFIG.gridSize;
        const center = CONFIG.gridSize/2;
        ctx.fillStyle = this.color;
        if(gameState.theme ==='neon'){
            ctx.shadowColor = this.color;
        }
        if(this.type==='normal'){
            ctx.beginPath();
            ctx.arc(x + center, y + center, CONFIG.gridSize/2 -2, 0, Math.PI*2);
            ctx.fill();
        } else{
            ctx.beginPath();
            ctx.moveTo(x + center, y+2);
            ctx.lineTo(x + CONFIG.gridSize - 2, y+center);
            ctx.lineTo(x + center, y+CONFIG.gridSize - 2);
            ctx.lineTo(x+2, y+center);
            ctx.fill();
        }
    }
}
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let animationId;
function resize(){
    const container = document.getElementById('crt-monitor');
    canvas.height = container.clientHeight;
    canvas.width = container.clientWidth;
}
window.addEventListener('resize', resize);
resize();
function getGridDimensions(){
    return{
        w: Math.floor(canvas.width/CONFIG.gridSize),
        h: Math.floor(canvas.height/CONFIG.gridSize)
    };
}
const particles = new ParticleSystem();
let snake;
let food;

const keys = {};
window.addEventListener('keydown', e=>{
    keys[e.code]=true;
    if(gameState.status==='MENU'||gameState.status==='GAMEOVER'){
        audio.playUI();if(e.code==='Enter'||e.code==='Space'){
            startGame();
        }
        return;
    }
    if(e.code==='Space'){
        togglePause();
        return;
    }
    if(gameState.status==='PLAYING'){
        switch(e.code){
            case 'ArrowUp':snake.changeDirection(0, -1); break;
            case 'ArrowDown': snake.changeDirection(0,1); break;
            case 'ArrowLeft': snake.changeDirection(-1,0); break;
            case 'ArrowRight': snake.changeDirection(1,0); break;
        }
    }
});
window.addEventListener('keyup', e=> keys[e.code]=false);
function blindTouch(id, callback){
    const el = document.querySelector(id);
    if(!el) return;
    el.addEventListener('keyup', e=>keys[e.code]=false);
    const handle = (e)=>{
        e.preventDefault();
        audio.playUI();
        callback();
    };
    el.addEventListener('mousedown', handle);
    el.addEventListener('touchstart', handle);
}
blindTouch('.d-up', ()=>snake && snake.changeDirection(0,-1));
blindTouch('.d-down', ()=> snake && snake.changeDirection(0,1));
blindTouch('.d-left', ()=>snake && snake.changeDirection(-1,0));
blindTouch('.d-right', ()=>snake && snake.changeDirection(1,0));
blindTouch('#ctrl-action',()=>togglePause());
blindTouch('#ctrl-dash', ()=>{
    if(gameState.status==='PLAYING'){
        snake.update();
        particles.explode(snake.getHeadpixelpos().x, snake.getHeadpixelpos().y, '#fff', 5);
    }
});
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('menu-btn').addEventListener('click', showMenu);
document.getElementById('resume-btn').addEventListener('click', togglePause);
document.getElementById('quit-btn').addEventListener('click', showMenu);
document.getElementById('settings-btn').addEventListener('click', showSettings);
document.getElementById('back-btn').addEventListener('click', showMenu);
document.getElementById('theme-toggle').addEventListener('click', ()=>{
    const themes = ['classic', 'neon', 'retro'];
    let idx = themes.indexOf(gameState.theme);
    idx = (idx+1) % themes.length;
    gameState.theme = themes[idx];
    document.getElementById('theme-toggle').innerText = gameState.theme.toLocaleUpperCase();
    audio.playUI();
});
document.getElementById('sound-toggle').addEventListener('click', ()=>{
    gameState.soundEnabled = !gameState.soundEnabled;
    document.getElementById('sound-toggle').innerText = gameState.soundEnabled ? "ON":"OFF";
    audio.playUI();
});
function initGame(){
    const dims = getGridDimensions();
    snake = new Snake(dims.w, dims.h);
    food = new Food(dims.w, dims.h);
    snake.color = CONFIG.colors[gameState.theme].snake;
    food.color = CONFIG.colors[gameState.theme].food;
    
    gameState.score = 0;
    gameState.level = 1;
    gameState.speed = CONFIG.baseSpeed;
    particles.reset();
    updateHUD();
}
// thid is deadass js
function startGame(){
    initGame();
    gameState.status = 'PLAYING';
    gameState.lastTime = performance.now();
    gameState.tickAccumulator = 0;
    document.querySelectorAll('.ui-layer').forEach(el =>el.classList.remove('active'));
    document.getElementById('high-score-display').innerText = gameState.highScore;
    if(!animationId) loop(performance.now());
    audio.playPowerup();
}
function showMenu(){
    gameState.status = 'MENU';
    document.querySelectorAll('.ui-layer').forEach(el => el.classList.remove('active'));
    document.getElementById('main-menu').classList.add('active');
}
function showSettings(){
    document.querySelectorAll('.ui-layer').forEach(el => el.classList.remove('active'));
    document.getElementById('settings-menu').classList.add('active');
}
//i am back now i have got so many things to do
function togglePause(){
    if(gameState.status==='PLAYING'){
        gameState.status = 'PAUSED';
        document.getElementById('pause-menu').classList.add('active');
    } else if(gameState.status==='PAUSED'){
        gameState.status = 'PLAYING';
        document.getElementById('pause-menu').classList.remove('active');
        gameState.lastTime = performance.now();
    }
}
function updateHUD(){
    document.getElementById('score-display').innerText=gameState.score;
    document.getElementById('level-display').innerText=gameState.level;
}
function updateUI(){
    if(gameState.status==='GAMEOVER'){
        document.getElementById('final-score').innerText = gameState.score;
        document.getElementById('game-over').classList.add('active');
        if(gameState.score>gameState.highScore){
            gameState.highScore = gameState.score;
            localStorage.setItem('snake_highscore',gameState.highScore);
            document.getElementById('high-score-display').innerText = gameState.highScore;
        }
    }
}

//boring af
function loop(timestamp){
    const deltaTime = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;
    if(gameState.status==='PLAYING'){
        gameState.tickAccumulator += deltaTime;
        while(gameState.tickAccumulator>=gameState.speed){
            gameState.tickAccumulator -= gameState.speed;
            update();
        }
        particles.update();
    }
    render();
    animationId = requestAnimationFrame(loop);
}
function update(){
    snake.update();
    if(snake.isDead) return;
    const head = snake.body[0];
    if(head.x===food.position.x&&head.y===food.position.y){
        const points = food.type==='bonus'?50:10;
        gameState.score +=points;
        audio.playEat();
        const pixelPos = snake.getHeadpixelpos();
        particles.explode(pixelPos.x,pixelPos.y,food.color,15);
        snake.grow(food.type==='bonus'?2:1);
        food.spawn(snake.body);
        if(gameState.score%50===0){
            gameState.level++;
            gameState.speed = Math.max(CONFIG.minSpeed, CONFIG.baseSpeed - (gameState.level * CONFIG.speedDecrement));
            audio.playPowerup();
        }
        updateHUD();
    }
}
function render(){
    ctx.fillStyle = CONFIG.colors[gameState.theme].bg;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    if(gameState.theme==='retro'){
        ctx.strokeStyle = CONFIG.colors[gameState.theme].grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let x=0;x<=canvas.width;x+=CONFIG.gridSize){
            ctx.moveTo(x,0);
            ctx.lineTo(x,canvas.height);
        }
        for(let y=0;y<=canvas.height;y+=CONFIG.gridSize){
            ctx.moveTo(0,y);
            ctx.lineTo(canvas.width,y);
        }
        ctx.stroke();
    }
    if(gameState.status==='PLAYING'||gameState.status==='PAUSED'){
        food.draw(ctx);
        snake.draw(ctx);
        particles.draw(ctx);
    }
}
resize();
showMenu();
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
let konamiIndex = 0;
window.addEventListener('keydown',(e)=>{
    if(e.code===konami[konamiIndex]){
        konamiIndex++;
        if(konamiIndex===konami.length){
            alert('ACTIVATED GOD MODE!!!(kidding but here is 1000points)');
            gameState.score +=1000;
            updateHUD();
            konamiIndex=0;
        }
    }else{
        konamiIndex = 0;
    }
});