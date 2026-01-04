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