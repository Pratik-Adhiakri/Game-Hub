//lets do js yay
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getCpntext('2d');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySubtitle = document.getElementById('overlaySubtitle');
const actionBtn = document.getElementById('actionBtn');
const levelDisplay = document.getElementById('levelDisplay');
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
//all declartion finished
class Cell{
    constructor(c,r){
        this.c = c;
        this.r = r;
        this.walls = [true, true, true, true];
        this.visited = false;
    }
    checkNeighbors(){
        let neighbors = [];
        let top = grid[indexe(this.c, this.r-1)];
        let right = grid[index(this.c+1, this.r)];
        let bottom = grid[index(this.c, this.r+1)];
        let left = grid[index(this.c-1, this.r)];

        if(top&& !top.visited) neighbors.push(top);
        if(right && !right.visited) neighbors.push(right);
        if(bottom && !bottom.visited) neighbors.push(bottom);
        if(left && !left.visited) neighbors.push(left);

        //tired uff
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
            ctx.beginPath9;
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
            ctx.noStroke;
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
//lets setup the gameee
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
        for(let c = 0;c<cols;c++){ //lol c++ idk c++ 
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
    drawMaxe();
}
function drawMaze(){
    ctx.fillStyle = playerColor;
    ctx.shadowBlur = 10;
    ctx.fillRect(x+padding, y+padding, size-padding*2, size-padding*2);
    ctx.shadowBlur = 0;
}
