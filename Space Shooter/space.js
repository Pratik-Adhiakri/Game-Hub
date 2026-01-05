//js is here wow
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('scoreValue');
const finalScoreEl = document.getElementById('finalScore');
const healthFill = document.getElementById('healthFill');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

canvas.width = 800;
canvas.height = 600;
let gameActive = false;
let score = 0;
let frameCount = 0;
const keys = {
    w:false,
    a:false,
    s:false,
    d:false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
    Space: false
};
const player = {
    x: canvas.width/2,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 5,
    health: 100,
    maxHealth:100,
    lastShot: 0,
    shootDelay:15
};
let projectiles = [];
let enemies = [];
let stars = [];
//finally all defining stuffs is over

function initStars(){
    stars = [];
    for(let i=0;i<100;i++){
        stars.push({
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height,
            size: Math.random()*2,
            speed:Math.random()*3+0.5;
        });
    }
}
function creareExplosion(x,y,color){
    for(let i=0;i<15;i++){
        particles.push({
            x:x,
            y:y,
            vx: (Math.random()-0.5)*8,
            vy: (Math.random()-0.5)*8,
            life: 30 + Math.random()*20,
            color:color,
            size: Math.random()*3+1
        });
    }
}
function spawnEnemy(){
    const size =  30+ Math.random()*20;
    const type = Math.random();
    let speed = 2 + Math.random()*2;
    let hp = 1;
    let color = '#ff3333';
    if(type>0.8){
        speed = 5;
        color = '#ffaa00';
        hp = 1;
    } else if(type>0.95){
        speed = 1;
        color = '#cc00cc';
        hp = 5;
    }
    enemies.push({
        x: Math.random()* (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: speed,
        color: color,
        hp:hp,
        maxHp:hp
    });
}
//iam back yay
function updateStars(){
    ctx.fillStyle = '#fff';
    stars.forEach(star=>{
        star.y += star.speed;
        if(star.y>canvas.height){
            star.y = 0;
            star.x = Math.random()*canvas.width;
        }
        ctx.globalAlpha = Math.random()*0.5+0.3;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1.0;
}
function drawPlayer(){
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(0,-20);
    ctx.lineTo(15,15);
    ctx.lineTo(0,10);
    ctx.lineTo(-15,15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(0,0,5,0,Math.PI*2);
    ctx.fill();

    if(keys.w||keys.ArrowUp){
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.moveTo(-5,15);
        ctx.lineTo(0,25 + Math.random()*10);
        ctx.lineTo(5,15);
        ctx.fill();
    }
    ctx.restore();
}
function updatePlayer(){
    if(keys.w||keys.ArrowUp) player.y -= player.speed;
    if(keys.s||keys.ArrowDown) player.y += player.speed;
    if(keys.a||keys.ArrowLeft) player.x -= player.speed;
    if(keys.d||keys.ArrowRight) player.x += player.speed;
    if(player.x<20) player.x = 20;
    if(player.x>canvas.width - 20) player.x = canvas.width - 20;
    if(player.y<20) player.y = 20;
    if(player.y>canvas.width-20) player.y = canvas.height - 20;
    if(keys.Space||keys[''] && frameCount>player.lastShot + player.shpptDelay){
        projectiles.push({
            x:player.x,
            y:player.y-20,
            width:4,
            height:15,
            speed:10,
            color:'#fff'
        });
        player.lastShot = frameCount;
    }
}
//done hard functionss
function updateProjectiles(){
    for(let i=projectiles.length-1;i>=0;i--){
        let p = projectiles[i];
        p.y -= p.speed;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(p.x - p.width/2, p.y, p.width, p.height);
        ctx.shadowBlur = 0;
        if(p.y<-20){
            projectiles.splice(i,1);
        }
    }
}
function updateEnemies(){
    if(frameCount%60===0){
        spawnEnemy();
    }
    for(let i=enemies.length-1;i>=0;i--){
        let e= emeies[i];
        e.y+=e.speed;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        if(e.color==='#ff3333'){
            ctx.moveTo(e.x + e.width/2, e.y+e.height);
            ctx.lineTo(e.x+e.width, e.y);
            ctx.lineTo(e.x,e.y);
        } else if(e.color==='#ffaa00'){
            ctx.moveTo(e.x+e.width/2,e.y+e.height);
            ctx.lineTo(e.x+ e.width, e.y);
            ctx.lineTo(e.x+e.width/2,e.y+e.height/3);
            ctx.lineTo(e.x,e.y);
        } else{
            ctx.rect(e.x,e.y,e.width,e.height);
        }
        ctx.fill();
        if(
            player.x<e.x+e.width &&
            player.x>e.x &&
            player.y<e.y+ e.height &&
            player.y>e.y
        ){
            player.health -= 20;
            createExplosion(player.x, player.y, '#ff0000');
            enemies.splice(i,1);
            updateHealthUI();
            if(player.health<=0) endGame();
            continue;
        }
        for(let j=projectiles.length -1;j>=0;j--){
            let p= projectiles[j];
            if(
                p.x>e.x &&
                p.x<e.x + e.width &&
                p.y > e.y &&
                p.y <e.y + e.height
            ) {
                e.hp--;
                projectiles.splice(j,1);
                createExplosion(p.x,p.y,'#fff');
                if(e.hp<=0){
                    score+=100;
                    scoreEl.innerText = score;
                    createExplosion(e.x+e.width/2,e.y+e.height/2,e.color);
                }
                break;
            }
        }
        if(e.y>canvas.height){
            enemies.splice(i,1);
        }
    } 
}
//finally finished the hardest function ufff