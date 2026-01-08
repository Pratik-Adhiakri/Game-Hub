const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySubtitle = document.getElementById('overlaySubtitle');
const actionBtn = document.getElementById('actionBtn');
const levelDisplay = document.getElementById('levelValue');
const timeDisplay = document.getElementById('timeValue');

let cols,rows;
let size = 30;
let grid = [];
let stack = [];
let current;
let playerPosition = {c:0,r:0};
let goalPosition = {c:0,r:0};
let level = 1;
let gameRunning = false;
let startTime;
let timerInterval;

const wallColor = '#ffd700';
const playerColor = '#ffffff';
const goalColor = '#ff4500';
const visitedColor = '#111111';

class Cell{
    constructor(c,r){
        this.c = c;
        this.r = r;
        this.walls = [true, true, true, true];
        this.visited = false;
    }
    checkNeighbors(){
        let neighbors = [];
        let top = grid[index(this.c, this.r-1)];
        let right = grid[index(this.c+1, this.r)];
        let bottom = grid[index(this.c, this.r+1)];
        let left = grid[index(this.c-1, this.r)];

        if(top && !top.visited) neighbors.push(top);
        if(right && !right.visited) neighbors.push(right);
        if(bottom && !bottom.visited) neighbors.push(bottom);
        if(left && !left.visited) neighbors.push(left);

        if(neighbors.length > 0){
            let r = Math.floor(Math.random()*neighbors.length);
            return neighbors[r];
        } else{
            return undefined;
        }
    }
    draw(){
        let x = this.c * size;
        let y = this.r * size;
        ctx.strokeStyle = wallColor;
        ctx.lineWidth = 2;
        if(this.walls[0]){
            ctx.beginPath();
            ctx.moveTo(x,y);
            ctx.lineTo(x+size,y);
            ctx.stroke();
        }
        if(this.walls[1]){
            ctx.beginPath();
            ctx.moveTo(x + size, y);
            ctx.lineTo(x+size, y + size);
            ctx.stroke();
        }
        if(this.walls[2]){
            ctx.beginPath();
            ctx.moveTo(x+size, y+size);
            ctx.lineTo(x, y+size);
            ctx.stroke();
        }
        if(this.walls[3]){
            ctx.beginPath();
            ctx.moveTo(x, y+size);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        if(this.visited){
            ctx.fillStyle = visitedColor;
            ctx.fillRect(x+2,y+2,size-4,size-4);
        }
    }
}
function index(c,r){
    if(c<0||r<0||c>cols-1||r>rows-1){
        return -1;
    }
    return c+r*cols;
}
function removeWalls(a,b){
    let x = a.c - b.c;
    if(x===1){
        a.walls[3] = false;
        b.walls[1] = false;
    } else if(x===-1){
        a.walls[1] = false;
        b.walls[3] = false;
    }
    let y=a.r-b.r;
    if(y===1){
        a.walls[0] = false;
        b.walls[2] = false;
    } else if(y===-1){
        a.walls[2] = false;
        b.walls[0] = false;
    }
}

function setUpGame(){
    canvas.width = 600;
    canvas.height = 600;
    if(window.innerWidth<650){
        canvas.width = window.innerWidth -40;
        canvas.height = canvas.width;
    }
    cols = Math.floor(canvas.width/size);
    rows = Math.floor(canvas.height/size);
    grid = [];
    for(let r=0;r<rows;r++){
        for(let c = 0;c<cols;c++){ 
            let cell = new Cell(c,r);
            grid.push(cell);
        }
    }
    current = grid[0];
    stack = [];
    playerPosition = {c:0, r:0};
    goalPosition = { c:cols -1, r:rows-1};
    generateMaze();
}
function generateMaze(){
    while(true){
        current.visited = true;
        let next = current.checkNeighbors();
        if(next){
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else if(stack.length>0){
            current = stack.pop();
        } else{
            break;
        }
    }
    drawMaze();
}
function drawMaze(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    for(let i=0; i<grid.length; i++) {
        grid[i].draw();
    }
    drawGoal();
    drawPlayer();
}
function drawGoal(){
    let x = goalPosition.c * size;
    let y = goalPosition.r * size;
    let padding = size * 0.25;
    ctx.fillStyle = goalColor;
    ctx.shadowBlur = 10;
    ctx.shadowColor = goalColor;
    ctx.fillRect(x+padding, y+padding, size-padding*2, size-padding*2);
    ctx.shadowBlur = 0;
}
function drawPlayer(){
    let x = playerPosition.c * size;
    let y = playerPosition.r* size;
    let padding = size *0.25;
    ctx.fillStyle = playerColor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = playerColor;
    ctx.beginPath();
    ctx.arc(x+size/2, y+size/2, (size/2)-padding+2, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
}
function movePlayer(dc, dr){
    if(!gameRunning) return;
    let currentCellIndex = index(playerPosition.c, playerPosition.r);
    let currentCell = grid[currentCellIndex];
    let canMove = false;

    if (dc === 0 && dr === -1 && !currentCell.walls[0]) canMove = true; 
    if (dc === 1 && dr === 0 && !currentCell.walls[1]) canMove = true; 
    if (dc === 0 && dr === 1 && !currentCell.walls[2]) canMove = true; 
    if (dc === -1 && dr === 0 && !currentCell.walls[3]) canMove = true; 

    if (canMove) {
        playerPosition.c += dc;
        playerPosition.r += dr;
        
        requestAnimationFrame(() => {
            drawMaze();
            checkWin();
        });
    }
}
function checkWin(){
    if(playerPosition.c === goalPosition.c && playerPosition.r === goalPosition.r){
        levelComplete();
    }
}
function startTimer(){
    startTime = Date.now();
    timerInterval = setInterval(()=>{
       let delta = Date.now()-startTime;
       let seconds = Math.floor(delta/1000);
       let minutes = Math.floor(seconds / 60);
       let s = seconds % 60;
       timeDisplay.innerText = `${minutes < 10 ? '0' : ''}${minutes}:${s < 10 ? '0' : ''}${s}`;
    },1000);
}
function stopTimer(){
    clearInterval(timerInterval);
}
function initGame(){
    setUpGame();
    overlay.classList.remove('visible');
    gameRunning = true;
    startTimer();
}
function levelComplete(){
    gameRunning = false;
    stopTimer();
    level++;
    if(level%2===0 && size>15){
        size -=2;
    }
    overlayTitle.innerText = "SECTOR CLEARED";
    overlaySubtitle.innerText = `Preparing Level ${level}...`;
    actionBtn.innerText = "NEXT LEVEL";
    levelDisplay.innerText = level;
    overlay.classList.add('visible');
}
window.addEventListener('keydown', (e)=>{
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            movePlayer(0, -1);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            movePlayer(1, 0);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            movePlayer(-1, 0);
            break;
    }
});
actionBtn.addEventListener('click', initGame);
setUpGame();
