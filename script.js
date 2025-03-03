// 选择DOM元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const gameOverMessage = document.getElementById('game-over');
const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('restart-btn');

// 游戏常量
const gridSize = 20;
const tileCount = canvas.width / gridSize;
const tileCountHeight = canvas.height / gridSize;

// 游戏变量
let snake = [];
let food = { x: 0, y: 0 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameSpeed = 10;
let gameInterval;

// 更新高分显示
highScoreElement.textContent = highScore;

// 初始化游戏
function initGame() {
    // 重置蛇的位置和大小
    snake = [
        { x: 10, y: 10 }
    ];
    
    // 重置分数
    score = 0;
    scoreElement.textContent = score;
    
    // 随机放置食物
    placeFood();
    
    // 设置初始方向（向右）
    dx = 1;
    dy = 0;
    
    // 隐藏游戏结束信息
    gameOverMessage.classList.add('hidden');
    
    // 开始游戏循环
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    gameRunning = true;
    gameInterval = setInterval(gameLoop, 1000 / gameSpeed);
    
    // 更新按钮显示
    startButton.classList.add('hidden');
    restartButton.classList.remove('hidden');
}

// 游戏主循环
function gameLoop() {
    if (!gameRunning) return;
    
    // 更新蛇的位置
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到食物
    checkFood();
    
    // 绘制游戏
    drawGame();
}

// 移动蛇
function moveSnake() {
    // 创建新的蛇头（基于当前头部和方向）
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // 将新头部添加到蛇的前面
    snake.unshift(head);
    
    // 如果没有吃到食物，移除尾部（保持蛇的长度）
    if (head.x !== food.x || head.y !== food.y) {
        snake.pop();
    }
}

// 检查碰撞（墙壁或自身）
function checkCollision() {
    const head = snake[0];
    
    // 墙壁碰撞检测
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCountHeight) {
        return true;
    }
    
    // 自身碰撞检测（从第二个身体部分开始检查）
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 检查是否吃到食物
function checkFood() {
    const head = snake[0];
    
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 放置新食物
        placeFood();
        
        // 更新高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 每100分增加游戏速度
        if (score % 100 === 0) {
            gameSpeed += 1;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, 1000 / gameSpeed);
        }
    }
}

// 随机放置食物
function placeFood() {
    // 确保食物不会出现在蛇身上
    let validPosition = false;
    
    while (!validPosition) {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCountHeight);
        
        validPosition = true;
        
        // 检查是否与蛇身重叠
        for (let i = 0; i < snake.length; i++) {
            if (food.x === snake[i].x && food.y === snake[i].y) {
                validPosition = false;
                break;
            }
        }
    }
}

// 绘制游戏元素
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制食物
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    
    // 绘制蛇
    ctx.fillStyle = 'lime';
    for (let i = 0; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize - 1, gridSize - 1);
    }
    
    // 绘制蛇头（不同颜色）
    ctx.fillStyle = '#0f0';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 1, gridSize - 1);
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    
    // 显示游戏结束信息
    finalScoreElement.textContent = score;
    gameOverMessage.classList.remove('hidden');
    
    // 更新按钮显示
    startButton.classList.add('hidden');
    restartButton.classList.remove('hidden');
}

// 键盘控制
document.addEventListener('keydown', function(event) {
    // 防止方向键滚动页面
    if ([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
        event.preventDefault();
    }
    
    if (!gameRunning) return;
    
    // 左键 (防止反向移动)
    if (event.keyCode === 37 && dx === 0) {
        dx = -1;
        dy = 0;
    }
    
    // 上键
    else if (event.keyCode === 38 && dy === 0) {
        dx = 0;
        dy = -1;
    }
    
    // 右键
    else if (event.keyCode === 39 && dx === 0) {
        dx = 1;
        dy = 0;
    }
    
    // 下键
    else if (event.keyCode === 40 && dy === 0) {
        dx = 0;
        dy = 1;
    }
});

// 触摸控制（针对移动设备）
let touchStartX, touchStartY;

canvas.addEventListener('touchstart', function(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    event.preventDefault();
});

canvas.addEventListener('touchmove', function(event) {
    if (!gameRunning) return;
    event.preventDefault();
    
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // 确定滑动距离较大的方向（水平或垂直）
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (diffX > 0 && dx === 0) {
            // 向右滑动
            dx = 1;
            dy = 0;
        } else if (diffX < 0 && dx === 0) {
            // 向左滑动
            dx = -1;
            dy = 0;
        }
    } else {
        // 垂直滑动
        if (diffY > 0 && dy === 0) {
            // 向下滑动
            dx = 0;
            dy = 1;
        } else if (diffY < 0 && dy === 0) {
            // 向上滑动
            dx = 0;
            dy = -1;
        }
    }
    
    // 更新起始触摸点位置
    touchStartX = touchEndX;
    touchStartY = touchEndY;
});

// 按钮事件监听
startButton.addEventListener('click', initGame);
restartButton.addEventListener('click', initGame);

// 初始绘制空白游戏屏幕
drawGame();
