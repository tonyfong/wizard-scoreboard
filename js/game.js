// 遊戲狀態管理
class Game {
    constructor() {
        console.log('初始化遊戲...');
        this.players = [];
        this.scores = [];
        this.history = [];
        this.currentRound = 0;
        this.currentTricks = 0; // 當前回合的牌數
        this.trumpSuit = null; // 當前回合的王牌花色
        this.bids = []; // 玩家叫牌數
        this.actualTricks = []; // 玩家實際贏得的墩數
        this.maxCardsTotal = 52; // 一副牌共52張
        this.isIncreasing = true; // 是否在增加牌數
        
        // 遊戲階段管理
        this.gamePhase = 'setup'; // setup, bidding, playing, results, scores
        this.currentBiddingPlayer = 0; // 當前叫牌的玩家索引
        this.selectedBid = 0; // 當前選擇的叫牌數
        
        // 先初始化事件監聽器
        this.initializeEventListeners();
        
        // 然後嘗試載入保存的遊戲狀態
        if (this.loadGameState()) {
            console.log('成功載入保存的遊戲狀態');
            this.updateDisplay();
        }
        
        console.log('遊戲初始化完成');
    }

    // 初始化事件監聽器
    initializeEventListeners() {
        console.log('設置事件監聽器...');
        
        // 檢查必要的DOM元素是否存在
        const startButton = document.getElementById('start-game');
        if (!startButton) {
            console.error('找不到開始遊戲按鈕！');
            return;
        }
        console.log('找到開始遊戲按鈕');
        
        // 開始遊戲按鈕
        startButton.addEventListener('click', () => this.startGame());
        
        // 清除遊戲按鈕
        const clearButton = document.getElementById('clear-game');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearGame());
            console.log('找到清除遊戲按鈕');
        } else {
            console.error('找不到清除遊戲按鈕！');
        }
        
        // 數字鍵盤按鈕
        document.querySelectorAll('.keypad-btn[data-value]').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectBid(parseInt(e.target.dataset.value)));
        });
        
        // 確定叫牌按鈕
        document.getElementById('confirm-bid').addEventListener('click', () => this.confirmBid());
        
        // 開始出牌按鈕
        document.getElementById('start-playing').addEventListener('click', () => this.startPlaying());
        
        // 計算分數按鈕
        document.getElementById('calculate-scores').addEventListener('click', () => this.calculateScores());
        
        // 歷史記錄按鈕
        document.getElementById('show-history').addEventListener('click', () => this.showHistory());
        
        // 下一局按鈕
        document.getElementById('next-round').addEventListener('click', () => this.nextRound());
        
        // 分數頁面的清除遊戲按鈕
        const clearGameFromScores = document.getElementById('clear-game-from-scores');
        if (clearGameFromScores) {
            clearGameFromScores.addEventListener('click', () => this.clearGame());
            console.log('找到分數頁面清除遊戲按鈕');
        }
        
        console.log('事件監聽器設置完成');
    }

    // 開始新遊戲
    startGame() {
        console.log('開始新遊戲...');
        const playerCount = parseInt(document.getElementById('player-count').value);
        console.log(`選擇的玩家數量: ${playerCount}`);
        
        this.players = Array.from({length: playerCount}, (_, i) => `玩家${i + 1}`);
        this.scores = new Array(playerCount).fill(0);
        this.history = [];
        this.currentRound = 0;
        this.currentTricks = 0;
        this.isIncreasing = true;
        this.gamePhase = 'bidding';
        this.currentBiddingPlayer = 0;
        this.selectedBid = 0;
        
        console.log('開始第一回合');
        this.startNewRound();
        this.updateDisplay();
        this.saveGameState();
    }

    // 開始新回合
    startNewRound() {
        this.currentRound++;
        const maxCards = this.calculateMaxCardsPerPlayer(this.players.length);
        
        // 計算當前回合的牌數
        if (this.currentTricks === maxCards) {
            this.isIncreasing = false;
            this.currentTricks = maxCards - 1;
        } else if (this.currentTricks === 1 && !this.isIncreasing) {
            this.isIncreasing = true;
            this.currentTricks = 2;
        } else if (this.isIncreasing) {
            this.currentTricks = Math.min(this.currentTricks + 1, maxCards);
        } else {
            this.currentTricks = Math.max(this.currentTricks - 1, 1);
        }

        console.log(`第${this.currentRound}回合，每人${this.currentTricks}張牌，${this.isIncreasing ? '遞增中' : '遞減中'}`);
        
        this.bids = new Array(this.players.length).fill(null);
        this.actualTricks = new Array(this.players.length).fill(0);
        this.trumpSuit = this.getRandomSuit();
        this.gamePhase = 'bidding';
        this.currentBiddingPlayer = 0;
        this.selectedBid = 0;
        this.updateDisplay();
    }

    // 計算每位玩家最多可以拿到幾張牌
    calculateMaxCardsPerPlayer(playerCount) {
        switch(playerCount) {
            case 2: return 26;
            case 3: return 17;
            case 4: return 13;
            case 5: return 10;
            case 6: return 8;
            case 7: return 7;
            case 8: return 6;
            default: return 7;
        }
    }

    // 獲取隨機花色
    getRandomSuit() {
        const suits = ['♠', '♥', '♦', '♣'];
        return suits[Math.floor(Math.random() * suits.length)];
    }

    // 更新顯示
    updateDisplay() {
        this.showGamePhase();
        this.updateScoreDisplay();
        this.updateHistoryDisplay();
    }

    // 顯示當前遊戲階段
    showGamePhase() {
        // 隱藏所有階段
        document.querySelectorAll('.game-state').forEach(state => {
            state.classList.remove('active');
        });
        
        // 顯示當前階段
        const currentPhase = document.getElementById(this.gamePhase === 'setup' ? 'game-setup' : 
                                                   this.gamePhase === 'bidding' ? 'bidding-phase' :
                                                   this.gamePhase === 'playing' ? 'bidding-phase' :
                                                   this.gamePhase === 'results' ? 'trick-results' : 'score-display');
        if (currentPhase) {
            currentPhase.classList.add('active');
        }
        
        // 根據階段更新內容
        if (this.gamePhase === 'bidding') {
            this.updateBiddingDisplay();
        } else if (this.gamePhase === 'results') {
            this.updateResultsDisplay();
        } else if (this.gamePhase === 'scores') {
            this.updateScoresDisplay();
        }
    }

    // 更新叫牌顯示
    updateBiddingDisplay() {
        document.getElementById('current-round').textContent = this.currentRound;
        document.getElementById('cards-per-player').textContent = this.currentTricks;
        document.getElementById('trump-suit').textContent = this.trumpSuit;
        document.getElementById('max-tricks').textContent = this.currentTricks;
        
        // 更新當前叫牌玩家
        if (this.currentBiddingPlayer < this.players.length) {
            document.getElementById('current-player-name').textContent = this.players[this.currentBiddingPlayer];
            
            // 計算已叫總數
            const totalBids = this.bids.reduce((sum, bid) => sum + (bid || 0), 0);
            document.getElementById('total-bids').textContent = totalBids;
            
            // 顯示數字鍵盤
            this.showKeypad();
        } else {
            // 所有玩家都叫完牌了
            this.showBiddingSummary();
        }
    }

    // 顯示叫牌摘要
    showBiddingSummary() {
        document.getElementById('bidding-summary').style.display = 'block';
        document.getElementById('start-playing').style.display = 'block';
        
        const bidsList = document.getElementById('bids-list');
        bidsList.innerHTML = this.players.map((player, index) => 
            `<div>${player}: ${this.bids[index]} 墩</div>`
        ).join('');
        
        this.hideKeypad();
    }

    // 顯示數字鍵盤
    showKeypad() {
        const keypad = document.getElementById('number-keypad');
        keypad.style.display = 'flex';
        
        // 更新按鈕狀態
        document.querySelectorAll('.keypad-btn[data-value]').forEach(btn => {
            const value = parseInt(btn.dataset.value);
            const totalBids = this.bids.reduce((sum, bid) => sum + (bid || 0), 0);
            const isLastPlayer = this.currentBiddingPlayer === this.players.length - 1;
            
            // 禁用超過最大牌數的選項
            if (value > this.currentTricks) {
                btn.disabled = true;
            }
            // 最後一個玩家不能讓總數等於最大牌數
            else if (isLastPlayer && totalBids + value === this.currentTricks) {
                btn.disabled = true;
            }
            else {
                btn.disabled = false;
            }
            
            // 高亮選中的數字
            if (value === this.selectedBid) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    // 隱藏數字鍵盤
    hideKeypad() {
        document.getElementById('number-keypad').style.display = 'none';
    }

    // 選擇叫牌數
    selectBid(value) {
        this.selectedBid = value;
        console.log(`選擇叫牌數: ${value}`);
        this.updateBiddingDisplay();
    }

    // 確認叫牌
    confirmBid() {
        if (this.selectedBid === 0) {
            alert('請選擇叫牌數！');
            return;
        }
        
        console.log(`玩家${this.currentBiddingPlayer + 1}叫牌: ${this.selectedBid}`);
        this.bids[this.currentBiddingPlayer] = this.selectedBid;
        this.currentBiddingPlayer++;
        this.selectedBid = 0;
        
        if (this.currentBiddingPlayer < this.players.length) {
            console.log(`輪到玩家${this.currentBiddingPlayer + 1}叫牌`);
            this.updateBiddingDisplay();
        } else {
            console.log('所有玩家都叫完牌了');
            this.showBiddingSummary();
        }
        
        this.saveGameState();
    }

    // 開始出牌
    startPlaying() {
        this.gamePhase = 'playing';
        this.hideKeypad();
        // 這裡可以添加出牌階段的邏輯
        // 暫時直接跳到結果階段
        setTimeout(() => {
            this.gamePhase = 'results';
            this.updateDisplay();
        }, 1000);
    }

    // 更新結果顯示
    updateResultsDisplay() {
        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = this.players.map((player, index) => `
            <div class="player-result">
                <div>
                    <strong>${player}</strong><br>
                    叫牌: ${this.bids[index]} 墩
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 18px; margin-bottom: 5px;">${this.actualTricks[index] || this.bids[index]}</div>
                    <div class="adjust-buttons">
                        <button class="adjust-btn" onclick="game.adjustTricks(${index}, -1)">-</button>
                        <button class="adjust-btn" onclick="game.adjustTricks(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 調整墩數
    adjustTricks(playerIndex, change) {
        const newValue = (this.actualTricks[playerIndex] || this.bids[playerIndex]) + change;
        if (newValue >= 0 && newValue <= this.currentTricks) {
            this.actualTricks[playerIndex] = newValue;
            this.updateResultsDisplay();
        }
    }

    // 計算分數
    calculateScores() {
        // 確保所有玩家都有實際墩數
        for (let i = 0; i < this.players.length; i++) {
            if (this.actualTricks[i] === null || this.actualTricks[i] === undefined) {
                this.actualTricks[i] = this.bids[i];
            }
        }
        
        this.calculateScoresInternal(this.actualTricks);
        
        // 記錄歷史
        const record = this.players.map((player, index) => 
            `${player}: 叫${this.bids[index]}贏${this.actualTricks[index]}`
        ).join(' | ');
        this.history.push(record);
        
        this.gamePhase = 'scores';
        this.updateDisplay();
        this.saveGameState();
    }

    // 內部計分方法
    calculateScoresInternal(actualTricks) {
        this.players.forEach((_, index) => {
            const bid = this.bids[index];
            const tricks = actualTricks[index];
            const difference = tricks - bid;
            
            if (difference === 0) {
                this.scores[index] += 10 + (tricks * tricks);
            } else {
                this.scores[index] -= (difference * difference);
            }
        });
    }

    // 更新分數顯示
    updateScoresDisplay() {
        const scoreDisplay = document.getElementById('players-score');
        scoreDisplay.innerHTML = this.players.map((player, index) => `
            <div class="player-score">
                <div class="player-name">${player}</div>
                <div class="score-value">${this.scores[index]}</div>
            </div>
        `).join('');
    }

    // 更新分數顯示（通用）
    updateScoreDisplay() {
        if (this.players.length > 0) {
            this.updateScoresDisplay();
        }
    }

    // 顯示歷史記錄
    showHistory() {
        const modal = document.getElementById('history-modal');
        const historyList = document.getElementById('history-list');
        
        historyList.innerHTML = this.history.map((record, index) => `
            <div style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>第${index + 1}回合：</strong> ${record}
            </div>
        `).join('');
        
        modal.style.display = 'block';
    }

    // 下一局
    nextRound() {
        this.startNewRound();
    }

    // 清除遊戲
    clearGame() {
        if (confirm('確定要清除所有遊戲數據嗎？這將重置所有分數和歷史記錄。')) {
            console.log('清除遊戲數據...');
            
            // 重置所有遊戲狀態
            this.players = [];
            this.scores = [];
            this.history = [];
            this.currentRound = 0;
            this.currentTricks = 0;
            this.trumpSuit = null;
            this.bids = [];
            this.actualTricks = [];
            this.isIncreasing = true;
            this.gamePhase = 'setup';
            this.currentBiddingPlayer = 0;
            this.selectedBid = 0;
            
            // 清除本地存儲
            storage.clearGame();
            
            // 重置界面
            this.updateDisplay();
            
            console.log('遊戲數據已清除');
            alert('遊戲數據已清除，可以重新開始！');
        }
    }

    // 更新歷史記錄顯示
    updateHistoryDisplay() {
        // 這個方法在手機版中主要用於彈窗顯示
    }

    // 保存遊戲狀態
    saveGameState() {
        const gameState = {
            players: this.players,
            scores: this.scores,
            history: this.history,
            currentRound: this.currentRound,
            currentTricks: this.currentTricks,
            trumpSuit: this.trumpSuit,
            bids: this.bids,
            actualTricks: this.actualTricks,
            isIncreasing: this.isIncreasing,
            gamePhase: this.gamePhase,
            currentBiddingPlayer: this.currentBiddingPlayer,
            selectedBid: this.selectedBid
        };
        storage.saveGame(gameState);
    }

    // 載入遊戲狀態
    loadGameState() {
        const gameState = storage.loadGame();
        if (gameState) {
            this.players = gameState.players || [];
            this.scores = gameState.scores || [];
            this.history = gameState.history || [];
            this.currentRound = gameState.currentRound || 0;
            this.currentTricks = gameState.currentTricks || 0;
            this.trumpSuit = gameState.trumpSuit;
            this.bids = gameState.bids || [];
            this.actualTricks = gameState.actualTricks || [];
            this.isIncreasing = gameState.isIncreasing ?? true;
            this.gamePhase = gameState.gamePhase || 'setup';
            this.currentBiddingPlayer = gameState.currentBiddingPlayer || 0;
            this.selectedBid = gameState.selectedBid || 0;
            return true;
        }
        return false;
    }
}

// 確保DOM完全載入後再初始化遊戲
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM載入完成，初始化遊戲...');
    const game = new Game();
    window.game = game; // 將遊戲實例設為全局變量，方便調試
});

// 如果DOM已經載入，立即初始化
if (document.readyState === 'loading') {
    console.log('等待DOM載入...');
} else {
    console.log('DOM已載入，立即初始化遊戲...');
    const game = new Game();
    window.game = game;
}