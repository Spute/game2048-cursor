class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.bestScore = localStorage.getItem('bestScore') || 0;
        this.history = [];
        this.init();
    }

    // 初始化游戏
    init() {
        // 清空网格和历史记录
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.history = [];
        document.getElementById('score').textContent = '0';
        document.getElementById('best-score').textContent = this.bestScore;
        
        // 初始添加两个数字
        this.addNewTile();
        this.addNewTile();
        
        // 更新视图
        this.updateView();
        
        // 添加键盘事件监听
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // 添加按钮事件监听
        document.getElementById('new-game').addEventListener('click', () => this.restart());
        document.getElementById('retry').addEventListener('click', () => this.restart());
        // 添加撤销按钮事件监听
        document.getElementById('undo').addEventListener('click', () => this.undo());
    }

    // 在随机空位置添加新数字（2或4）
    addNewTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    // 更新视图
    updateView() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.querySelector(`.grid-cell[data-row="${i}"][data-col="${j}"]`);
                const value = this.grid[i][j];
                cell.textContent = value || '';
                cell.className = `grid-cell${value ? ` tile-${value}` : ''}`;
            }
        }
    }

    // 处理键盘事件
    handleKeyPress(event) {
        let moved = false;
        
        switch(event.key) {
            case 'ArrowUp':
                this.saveState(); // 在移动前保存状态
                moved = this.moveUp();
                break;
            case 'ArrowDown':
                this.saveState();
                moved = this.moveDown();
                break;
            case 'ArrowLeft':
                this.saveState();
                moved = this.moveLeft();
                break;
            case 'ArrowRight':
                this.saveState();
                moved = this.moveRight();
                break;
            default:
                return;
        }

        if (moved) {
            this.addNewTile();
            this.updateView();
            
            if (this.isGameOver()) {
                this.showGameOver();
            }
        } else {
            // 如果没有移动，删除刚才保存的状态
            this.history.pop();
        }
    }

    // 向左移动
    moveLeft() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = this.grid[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                    moved = true;
                }
            }
            const newRow = row.concat(Array(4 - row.length).fill(0));
            if (newRow.join(',') !== this.grid[i].join(',')) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        this.updateScore();
        return moved;
    }

    // 向右移动
    moveRight() {
        this.grid = this.grid.map(row => row.reverse());
        const moved = this.moveLeft();
        this.grid = this.grid.map(row => row.reverse());
        return moved;
    }

    // 向上移动
    moveUp() {
        this.grid = this.transpose(this.grid);
        const moved = this.moveLeft();
        this.grid = this.transpose(this.grid);
        return moved;
    }

    // 向下移动
    moveDown() {
        this.grid = this.transpose(this.grid);
        const moved = this.moveRight();
        this.grid = this.transpose(this.grid);
        return moved;
    }

    // 矩阵转置
    transpose(grid) {
        return grid[0].map((_, i) => grid.map(row => row[i]));
    }

    // 更新分数
    updateScore() {
        document.getElementById('score').textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
            document.getElementById('best-score').textContent = this.bestScore;
        }
    }

    // 检查游戏是否结束
    isGameOver() {
        // 检查是否有空格
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }
        
        // 检查是否有相邻的相同数字
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.grid[i][j] === this.grid[i][j + 1]) return false;
                if (this.grid[j][i] === this.grid[j + 1][i]) return false;
            }
        }
        
        return true;
    }

    // 显示游戏结束
    showGameOver() {
        const gameMessage = document.querySelector('.game-message');
        gameMessage.classList.add('game-over');
        gameMessage.querySelector('p').textContent = '游戏结束！';
    }

    // 重新开始游戏
    restart() {
        const gameMessage = document.querySelector('.game-message');
        gameMessage.classList.remove('game-over');
        this.init();
    }

    // 保存当前状态
    saveState() {
        this.history.push({
            grid: this.grid.map(row => [...row]),
            score: this.score
        });
        // 只保留最近的 20 步
        if (this.history.length > 20) {
            this.history.shift();
        }
    }

    // 撤销到上一步
    undo() {
        if (this.history.length === 0) return;
        
        const lastState = this.history.pop();
        this.grid = lastState.grid;
        this.score = lastState.score;
        
        this.updateView();
        this.updateScore();
    }
}

// 启动游戏
window.onload = () => {
    new Game2048();
}; 