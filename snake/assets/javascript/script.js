const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas
const canvasSize = Math.min(window.innerWidth * 0.9, 400);
canvas.width = canvasSize;
canvas.height = canvasSize;
const grid = canvasSize / 20; // 20x20 grid

let snake = [{x: 10*grid, y: 10*grid}];
let food = randomPosition();
let powerUp = null;
let obstacles = generateObstacles(5);

let dx = grid, dy = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameSpeed = 150;
let gameInterval = null;
let isPaused = false;

// DOM elements
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
scoreEl.textContent = score;
highScoreEl.textContent = highScore;

const gameOverModal = document.getElementById('gameOverModal');
const finalScore = document.getElementById('finalScore');
const retryBtn = document.getElementById('retryBtn');

function randomPosition() {
    return {
        x: Math.floor(Math.random()*20)*grid,
        y: Math.floor(Math.random()*20)*grid
    };
}

function generateObstacles(count) {
    let obs = [];
    while (obs.length < count) {
        let pos = randomPosition();
        if (!snake.some(s => s.x === pos.x && s.y === pos.y)) obs.push(pos);
    }
    return obs;
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw obstacles
    ctx.fillStyle = 'gray';
    obstacles.forEach(ob => ctx.fillRect(ob.x, ob.y, grid-1, grid-1));

    // Draw power-up
    if (powerUp) {
        ctx.fillStyle = 'gold';
        ctx.fillRect(powerUp.x, powerUp.y, grid-1, grid-1);
    }

    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, grid-1, grid-1);

    // Draw snake
    ctx.fillStyle = 'lime';
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, grid-1, grid-1));

    moveSnake();
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = score;
        food = randomPosition();
        if (score % 5 === 0) increaseSpeed();
        if (Math.random() < 0.3) powerUp = randomPosition();
    } else if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
        score += 3; // bonus points
        scoreEl.textContent = score;
        powerUp = null;
    } else {
        snake.pop();
    }

    // Collision detection
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height ||
        snake.slice(1).some(s => s.x === head.x && s.y === head.y) ||
        obstacles.some(o => o.x === head.x && o.y === head.y)) {
        gameOver();
    }
}

function gameOver() {
    finalScore.textContent = score;
    gameOverModal.style.display = 'flex';
    clearInterval(gameInterval);

    if (score > highScore) {
        localStorage.setItem('highScore', score);
        highScoreEl.textContent = score;
    }
}

retryBtn.addEventListener('click', () => {
    gameOverModal.style.display = 'none';
    resetGame();
});

function resetGame() {
    snake = [{x: 10*grid, y: 10*grid}];
    dx = grid; dy = 0;
    score = 0;
    scoreEl.textContent = score;
    obstacles = generateObstacles(5);
    powerUp = null;
    gameSpeed = 150;
    clearInterval(gameInterval);
    if (!isPaused) gameInterval = setInterval(draw, gameSpeed);
}

function increaseSpeed() {
    if (gameSpeed > 50) {
        gameSpeed -= 10;
        clearInterval(gameInterval);
        if (!isPaused) gameInterval = setInterval(draw, gameSpeed);
    }
}

// Desktop controls
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -grid; }
    if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = grid; }
    if (e.key === 'ArrowLeft' && dx === 0) { dx = -grid; dy = 0; }
    if (e.key === 'ArrowRight' && dx === 0) { dx = grid; dy = 0; }
});

// Mobile swipe controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, {passive: true});

canvas.addEventListener('touchend', e => {
    const touch = e.changedTouches[0];
    const dxTouch = touch.clientX - touchStartX;
    const dyTouch = touch.clientY - touchStartY;

    if (Math.abs(dxTouch) > Math.abs(dyTouch)) {
        if (dxTouch > 0 && dx === 0) { dx = grid; dy = 0; }
        if (dxTouch < 0 && dx === 0) { dx = -grid; dy = 0; }
    } else {
        if (dyTouch > 0 && dy === 0) { dx = 0; dy = grid; }
        if (dyTouch < 0 && dy === 0) { dx = 0; dy = -grid; }
    }
}, {passive: true});

// Buttons
document.getElementById('restartBtn').addEventListener('click', resetGame);

document.getElementById('pauseBtn').addEventListener('click', () => {
    if (isPaused) {
        gameInterval = setInterval(draw, gameSpeed);
        isPaused = false;
        document.getElementById('pauseBtn').textContent = "Pause";
    } else {
        clearInterval(gameInterval);
        isPaused = true;
        document.getElementById('pauseBtn').textContent = "Resume";
    }
});

// Start game
gameInterval = setInterval(draw, gameSpeed);
