//js is here now
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const bestScoreDisplay = document.getElementById('best-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const historyBtn = document.getElementById('history-btn');
const historyBtnOver = document.getElementById('history-btn-over');
const historyScreen = document.getElementById('history-screen');
const scoreList = document.getElementById('score-list');
const backBtn = document.getElementById('back-btn');
//finally all constants declaration is dobe now let's ufff
let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem('spaceDodgerHighScore')||0;
let animationId; 
let frameCount = 0;
let previousScreen =  startScreen;

const player = {
    x: canvas.width/2,
    y: canvas.height-50,
    width: 30,
    height:30,
    color: '#0f3460',
    speed: 5,
    dx:0
};
let enemies = [];
const enemyBaseSpeed = 3;
const enemySpawnRate = 60;
let rightPressed = false;
let leftPressed = false;

//lets add eventlisteners yay
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
historyBtn.addEventListener('click', ()=> showHistory(startScreen));
historyBtnOver.addEventListener('click', ()=>showHistory(gameOverScreen));
backBtn.addEventListener('click', hidehistory);
bestScoreDisplay.textContent = highScore;
 
function keyDownHandler(e){
    if(e.key=="Right"||e.key==="ArrowRight"|| e.key==="d"|| e.key==="D"){
        rightPressed = true;
    } else if(e.key==="Left"||e.key==="ArrowLeft"||e.key==="a"||e.key==="A"){
        leftPressed = true;
    }
}
function keyUpHandler(e){
    if(e.key==="Right"||e.key==="ArrowRight"||e.key==="d"||e.key==="D"){
        rightPressed = false;
    } else if(e.key==="Left"||e.key==="ArrowLeft"||e.key==="a"||e.key==="A"){
        leftPressed = false;
    }
}
function startGame(){
    gameRunning = true;
    score = 0;
    enemies = [];
    frameCount = 0;
    player.x = canvas.width/2 - player.width/2;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    scoreDisplay.textContent = score;
    if(animationId) cancelAnimationFrame(animationId);
    gameLoop();
}
function gameOver(){
    gameRunning = false;
    cancelAnimationFrame(animationId);
    if(score>highScore) {
        highScore = score;
        localStorage.setItem('spaceDodgerHighScore', highScore);
    }
    saveScoreToHistory(score);
    finalScoreDisplay.textContent = score;
    bestScoreDisplay.textContent = highScore;
    gameOverScreen.classList.remove('hidden');
}
function saveScoreToHistory(score){
    const history = JSON.parse(localStorage.getItem('spaceDodgerHistory')||'[]');
    const date = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    history.unshift({score:score, date:date});
    if(history.length>10) history.pop();
    localStorage.setItem('spaceDodgerHistory', JSON.stringify(history));
}
function showHistory(fromScreen){
    previousScreen = fromScreen;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    historyScreen.classList.remove('hidden');
    const history = JSON.parse(localStorage.getItem('spaceDodgerHistory')||'[]');
    scoreList.innerHTML = history.length ? '' : '<li>No games played, play some.</li>';
    history.forEach(item=>{
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.date}</span><strong>${item.score}</strong>`;
        scoreList.appendChild(li);
    });
}
function hidehistory(){
    historyScreen.classList.add('hidden');
    previousScreen.classList.remove('hidden');
}
function spawnEnemy(){
    const size = Math.random()*20+20;
    const x = Math.random()*(canvas.width - size);
    enemies.push({
        x:x,
        y: -size,
        width:size,
        height:size,
        speed: enemyBaseSpeed + (score*0.1),
        color: `hsl(${Math.random()*60+330}, 70%, 60%)`
    });
}
function drawPlayer(){
    ctx.beginPath();
    ctx.rect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#e94560';
    ctx.fill();
    ctx.closePath();
}
function drawEnemies(){
    enemies.forEach(enemy=>{
        ctx.beginPath();
        ctx.rect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.closePath();
    });
    ctx.shadowBlur = 0;
}
function update(){
    if(rightPressed && player.x<canvas.width - player.width){
        player.x += player.speed;
    } else if(leftPressed && player.x>0){
        player.x -= player.speed;
    }
    frameCount++;
    let currentSpawnRate = Math.max(20, enemySpawnRate - Math.floor(score/5));
    if(frameCount % currentSpawnRate===0){
        spawnEnemy();
    }
    for(let i=0;i<enemies.length;i++){
        let e = enemies[i];
        e.y += e.speed;
        if(
        player.x  < e.x + e.width &&
        player.x + player.width>e.x&&
        player.y< e.y + e.height &&
        player.y + player.height> e.y      
    ) {
        gameOver();
        return;
    }
    if(e.y>canvas.height){
        enemies.splice(i, 1);
        i--;
        score++;
        scoreDisplay.textContent = score;
    }
     }
}
//almostttt
function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawEnemies();
}
function gameLoop(){
    if(!gameRunning) return;
    update();
    draw();
    if(gameRunning){
        animationId = requestAnimationFrame(gameLoop);
    }
}
ctx.fillStyle = '#16213e';
ctx.fillRect(0,0,canvas.width, canvas.height);