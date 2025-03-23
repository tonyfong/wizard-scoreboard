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
        const startButton = document.getElementById('start-game');
        if (!startButton) {
            console.error('找不到開始遊戲按鈕！');
            return;
        }
        
        startButton.addEventListener('click', () => {
            console.log('點擊開始遊戲按鈕');
            this.startGame();
        });
        
        // 使用事件委託來處理動態生成的按鈕
        document.addEventListener('click', (event) => {
            if (event.target.id === 'submit-bids') {
                console.log('點擊提交叫牌按鈕');
                this.submitBids();
            } else if (event.target.id === 'submit-tricks') {
                console.log('點擊提交結果按鈕');
                this.submitTricks();
            }
        });
        console.log('事件監聽器設置完成');
    }

    // 計算每位玩家最多可以拿到幾張牌
    calculateMaxCardsPerPlayer(playerCount) {
        // 根據玩家數量計算每人最多可以拿到的牌數
        switch(playerCount) {
            case 2:
                return 26; // 52/2 = 26
            case 3:
                return 17; // 51/3 = 17
            case 4:
                return 13; // 52/4 = 13
            case 5:
                return 10; // 50/5 = 10
            case 6:
                return 8;  // 48/6 = 8
            case 7:
                return 7;  // 49/7 = 7
            case 8:
                return 6;  // 48/8 = 6
            default:
                return 7;  // 預設值
        }
    }

    // 開始新遊戲
    startGame() {
        console.log('開始新遊戲...');
        const playerCountSelect = document.getElementById('player-count');
        if (!playerCountSelect) {
            console.error('找不到玩家數量選擇框！');
            return;
        }
        
        const playerCount = parseInt(playerCountSelect.value);
        console.log(`選擇的玩家數量: ${playerCount}`);
        
        this.players = Array.from({length: playerCount}, (_, i) => `玩家${i + 1}`);
        this.scores = new Array(playerCount).fill(0); // 初始分數為0
        this.history = [];
        this.currentRound = 0;
        this.currentTricks = 0; // 從0開始，startNewRound會將其增加到1
        this.isIncreasing = true; // 開始時設置為遞增模式
        
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
            // 達到最大值後開始遞減
            this.isIncreasing = false;
            this.currentTricks = maxCards - 1;
        } else if (this.currentTricks === 1 && !this.isIncreasing) {
            // 達到最小值後開始遞增
            this.isIncreasing = true;
            this.currentTricks = 2;
        } else if (this.isIncreasing) {
            // 遞增階段
            this.currentTricks = Math.min(this.currentTricks + 1, maxCards);
        } else {
            // 遞減階段
            this.currentTricks = Math.max(this.currentTricks - 1, 1);
        }

        console.log(`第${this.currentRound}回合，每人${this.currentTricks}張牌，${this.isIncreasing ? '遞增中' : '遞減中'}`);
        
        this.bids = new Array(this.players.length).fill(null);
        this.actualTricks = new Array(this.players.length).fill(0);
        this.trumpSuit = this.getRandomSuit();
        this.updateDisplay();
    }

    // 獲取隨機花色
    getRandomSuit() {
        const suits = ['♠', '♥', '♦', '♣'];
        return suits[Math.floor(Math.random() * suits.length)];
    }

    // 更新顯示
    updateDisplay() {
        console.log('更新顯示...');
        
        // 更新分數顯示
        const scoreDisplay = document.getElementById('players-score');
        if (!scoreDisplay) {
            console.error('找不到分數顯示區域！');
            return;
        }
        scoreDisplay.innerHTML = this.players.map((player, index) => `
            <div class="player-score">
                <div class="player-name">${player}</div>
                <div class="score-value">${this.scores[index]}</div>
            </div>
        `).join('');

        // 更新叫牌表單
        const roundInputs = document.getElementById('round-inputs');
        if (!roundInputs) {
            console.error('找不到叫牌輸入區域！');
            return;
        }
        this.updateBiddingForm();

        // 更新出牌表單
        const trickInputs = document.getElementById('trick-inputs');
        if (!trickInputs) {
            console.error('找不到出牌輸入區域！');
            return;
        }
        this.updateTrickForm();

        // 更新歷史記錄
        const historyList = document.getElementById('history-list');
        if (!historyList) {
            console.error('找不到歷史記錄區域！');
            return;
        }
        this.updateHistory();
        
        console.log('顯示更新完成');
    }

    // 更新叫牌表單
    updateBiddingForm() {
        const roundInputs = document.getElementById('round-inputs');
        const maxCards = this.calculateMaxCardsPerPlayer(this.players.length);
        roundInputs.innerHTML = `
            <div class="round-info">
                <p>第${this.currentRound}回合 - 每人${this.currentTricks}張牌</p>
                <p>王牌花色：${this.trumpSuit}</p>
                <p class="round-hint">提示：總墩數為${this.currentTricks}，所有玩家叫牌總和不能等於總墩數</p>
                <p class="cards-info">（注意：由於一副牌只有52張，${this.players.length}位玩家每人最多只能拿${maxCards}張牌）</p>
            </div>
            ${this.players.map((player, index) => `
                <div class="round-input">
                    <label for="bid-${index}">${player}的叫牌數（0-${this.currentTricks}）：</label>
                    <input type="number" id="bid-${index}" min="0" max="${this.currentTricks}" value="0">
                </div>
            `).join('')}
            <button id="submit-bids">提交叫牌</button>
        `;
    }

    // 更新出牌表單
    updateTrickForm() {
        const trickInputs = document.getElementById('trick-inputs');
        if (this.bids.some(bid => bid === null)) {
            trickInputs.innerHTML = '<p>請先完成叫牌</p>';
            return;
        }

        trickInputs.innerHTML = `
            ${this.players.map((player, index) => `
                <div class="round-input">
                    <label for="trick-${index}">${player}實際贏得的墩數（0-${this.currentTricks}）：</label>
                    <input type="number" id="trick-${index}" min="0" max="${this.currentTricks}" value="0">
                </div>
            `).join('')}
            <button id="submit-tricks">提交結果</button>
        `;
    }

    // 更新歷史記錄
    updateHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = this.history.map((record, index) => `
            <div class="history-item">
                <strong>第${index + 1}回合：</strong>
                ${record}
            </div>
        `).join('');
    }

    // 提交叫牌
    submitBids() {
        const bids = this.players.map((_, index) => 
            parseInt(document.getElementById(`bid-${index}`).value) || 0
        );

        // 驗證輸入
        if (bids.some(bid => bid < 0 || bid > this.currentTricks)) {
            alert(`叫牌數必須在0到${this.currentTricks}之間！`);
            return;
        }

        // 驗證最後一個玩家的叫牌
        const totalBids = bids.reduce((sum, bid) => sum + bid, 0);
        if (totalBids === this.currentTricks) {
            alert('最後一個玩家不能叫這個數，因為所有玩家都可能贏到所需的墩數！');
            return;
        }

        this.bids = bids;
        this.updateDisplay();
        this.saveGameState(); // 保存遊戲狀態
    }

    // 提交實際贏得的墩數
    submitTricks() {
        const tricks = this.players.map((_, index) => 
            parseInt(document.getElementById(`trick-${index}`).value) || 0
        );

        // 驗證輸入
        if (tricks.some(trick => trick < 0 || trick > this.currentTricks)) {
            alert(`贏得的墩數必須在0到${this.currentTricks}之間！`);
            return;
        }

        // 驗證總墩數
        const totalTricks = tricks.reduce((sum, trick) => sum + trick, 0);
        if (totalTricks !== this.currentTricks) {
            alert(`所有玩家贏得的墩數之和必須等於${this.currentTricks}！`);
            return;
        }

        // 計算分數
        this.calculateScores(tricks);

        // 記錄歷史
        const record = this.players.map((player, index) => 
            `${player}: 叫${this.bids[index]}贏${tricks[index]}`
        ).join(' | ');
        this.history.push(record);

        // 更新顯示
        this.updateDisplay();

        // 保存遊戲狀態
        this.saveGameState();

        // 開始新回合
        this.startNewRound();
    }

    // 計算分數
    calculateScores(actualTricks) {
        this.players.forEach((_, index) => {
            const bid = this.bids[index];
            const tricks = actualTricks[index];
            const difference = tricks - bid;
            
            if (difference === 0) {
                // Just Make: 10 + 贏墩數 * 贏墩數
                this.scores[index] += 10 + (tricks * tricks);
            } else {
                // Up or Down: -(贏墩數 - 叫墩數) * (贏墩數 - 叫墩數)
                this.scores[index] -= (difference * difference);
            }
        });
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
            isIncreasing: this.isIncreasing
        };
        storage.saveGame(gameState);
    }

    // 載入遊戲狀態
    loadGameState() {
        const gameState = storage.loadGame();
        if (gameState) {
            this.players = gameState.players;
            this.scores = gameState.scores;
            this.history = gameState.history;
            this.currentRound = gameState.currentRound;
            this.currentTricks = gameState.currentTricks;
            this.trumpSuit = gameState.trumpSuit;
            this.bids = gameState.bids;
            this.actualTricks = gameState.actualTricks;
            this.isIncreasing = gameState.isIncreasing ?? true;
            this.updateDisplay();
            return true;
        }
        return false;
    }
}

// 初始化遊戲
const game = new Game(); 