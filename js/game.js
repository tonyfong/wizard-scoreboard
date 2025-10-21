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
        
        // 新增功能
        this.playerOrder = []; // 玩家出牌順序
        this.currentDealer = 0; // 當前發牌者索引
        this.scoringMethod = 'squared'; // 計分方法：squared 或 cubed
        
        // 遊戲階段管理
        this.gamePhase = 'setup'; // setup, bidding, playing, results, scores
        this.currentBiddingPlayerIndexIndex = 0; // 當前叫牌玩家在playerOrder中的索引
        this.selectedBid = null; // 當前選擇的叫牌數
        
        // 先初始化事件監聽器
        this.initializeEventListeners();
        
        // 然後嘗試載入保存的遊戲狀態
        if (this.loadGameState()) {
            console.log('成功載入保存的遊戲狀態');
            this.updateDisplay();
        }
        
        // 初始化玩家名稱輸入框
        this.updatePlayerNames();
        
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
        
        // 玩家數量變化時更新玩家名稱輸入框
        document.getElementById('player-count').addEventListener('change', () => this.updatePlayerNames());
        
        // 計分方法選擇
        document.querySelectorAll('input[name="scoring-method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.scoringMethod = e.target.value;
                this.saveGameData();
            });
        });
        
        // 快速清除遊戲按鈕
        document.getElementById('clear-game-quick').addEventListener('click', () => {
            if (confirm('確定要清除當前遊戲嗎？')) {
                this.clearGame();
            }
        });
        
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

    // 更新玩家名稱輸入框
    updatePlayerNames() {
        const playerCount = parseInt(document.getElementById('player-count').value);
        const container = document.getElementById('player-names-container');
        
        container.innerHTML = '';
        
        for (let i = 0; i < playerCount; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'player-name-input';
            input.placeholder = `玩家${i + 1}`;
            input.value = `玩家${i + 1}`;
            input.id = `player-name-${i}`;
            container.appendChild(input);
        }
    }
    
    // 開始新遊戲
    startGame() {
        console.log('開始新遊戲...');
        const playerCount = parseInt(document.getElementById('player-count').value);
        console.log(`選擇的玩家數量: ${playerCount}`);
        
        // 獲取自定義玩家名稱
        this.players = [];
        for (let i = 0; i < playerCount; i++) {
            const nameInput = document.getElementById(`player-name-${i}`);
            const playerName = nameInput ? nameInput.value.trim() || `玩家${i + 1}` : `玩家${i + 1}`;
            this.players.push(playerName);
        }
        
        // 隨機選擇第一個發牌者
        this.currentDealer = Math.floor(Math.random() * playerCount);
        
        // 重新排列玩家順序，讓發牌者排在最前面
        this.playerOrder = [];
        for (let i = 0; i < playerCount; i++) {
            this.playerOrder.push((this.currentDealer + i) % playerCount);
        }
        
        this.scores = new Array(playerCount).fill(0);
        this.history = [];
        this.currentRound = 0;
        this.currentTricks = 0;
        this.isIncreasing = true;
        this.gamePhase = 'bidding';
        this.currentBiddingPlayerIndex = 0;
        this.selectedBid = null;
        
        // 清除叫牌摘要顯示
        this.clearBiddingSummary();
        
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
        // 在進入結果前才初始化為叫牌數，因此此處預設為null
        this.actualTricks = new Array(this.players.length).fill(null);
        this.trumpSuit = this.getRandomSuit();
        this.gamePhase = 'bidding';
        this.currentBiddingPlayerIndex = 0;
        this.selectedBid = null;
        
        // 清除上一回合的叫牌摘要顯示
        this.clearBiddingSummary();
        
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
        
        // 隱藏所有固定按鈕欄
        const biddingSummary = document.getElementById('bidding-summary');
        const resultsActionBar = document.querySelector('.results-action-bar');
        const scoreActionButtons = document.querySelector('#score-display .action-buttons');
        
        if (biddingSummary) biddingSummary.style.display = 'none';
        if (resultsActionBar) resultsActionBar.style.display = 'none';
        if (scoreActionButtons) scoreActionButtons.style.display = 'none';
        
        // 設置body類以處理底部間距
        document.body.classList.remove('with-bottom-gap', 'results-phase');
        if (this.gamePhase === 'bidding') {
            document.body.classList.add('with-bottom-gap');
        } else if (this.gamePhase === 'results') {
            document.body.classList.add('results-phase');
        }
        
        // 控制數字鍵盤的顯示
        const keypad = document.getElementById('number-keypad');
        if (keypad) {
            if (this.gamePhase === 'bidding') {
                keypad.style.display = 'flex';
            } else {
                keypad.style.display = 'none';
            }
        }
        
        // 顯示當前階段
        const currentPhase = document.getElementById(this.gamePhase === 'setup' ? 'game-setup' : 
                                                   this.gamePhase === 'bidding' ? 'bidding-phase' :
                                                   this.gamePhase === 'playing' ? 'bidding-phase' :
                                                   this.gamePhase === 'results' ? 'trick-results' : 'score-display');
        if (currentPhase) {
            currentPhase.classList.add('active');
        }
        
        // 根據階段更新內容和顯示相應的固定按鈕欄
        if (this.gamePhase === 'bidding') {
            this.updateBiddingDisplay();
            // 檢查是否需要顯示叫牌摘要（所有玩家都叫完牌時）
            if (this.currentBiddingPlayerIndex >= this.players.length) {
                if (biddingSummary) biddingSummary.style.display = 'block';
            }
        } else if (this.gamePhase === 'results') {
            this.updateResultsDisplay();
            if (resultsActionBar) resultsActionBar.style.display = 'block';
        } else if (this.gamePhase === 'scores') {
            this.updateScoresDisplay();
            if (scoreActionButtons) scoreActionButtons.style.display = 'flex';
        }
    }

    // 更新叫牌顯示
    updateBiddingDisplay() {
        // 更新標題信息
        const currentRoundEl = document.getElementById('current-round');
        const cardsPerPlayerEl = document.getElementById('cards-per-player');
        const trumpSuitEl = document.getElementById('trump-suit');
        const maxTricksEl = document.getElementById('max-tricks');
        
        if (currentRoundEl) currentRoundEl.textContent = this.currentRound;
        if (cardsPerPlayerEl) cardsPerPlayerEl.textContent = this.currentTricks;
        if (trumpSuitEl) trumpSuitEl.textContent = this.trumpSuit;
        if (maxTricksEl) maxTricksEl.textContent = this.currentTricks;
        
        // 更新玩家狀態顯示
        this.updatePlayersBiddingStatus();

        // 更新底部數字鍵盤上的總叫牌提示
        const totalBids = this.bids.reduce((sum, bid) => sum + (bid || 0), 0);
        const totalIndicator = document.getElementById('total-bids-indicator');
        if (totalIndicator) {
            totalIndicator.textContent = `已共叫${totalBids}墩`;
        }
        const confirmBtn = document.getElementById('confirm-bid');
        if (confirmBtn) {
            confirmBtn.textContent = '確定';
        }
        
        // 更新當前叫牌玩家
        if (this.currentBiddingPlayerIndex < this.players.length) {
            // 計算已叫總數
            const totalBids = this.bids.reduce((sum, bid) => sum + (bid || 0), 0);
            
            // 顯示數字鍵盤
            this.showKeypad();
        } else {
            // 所有玩家都叫完牌了
            this.showBiddingSummary();
        }
    }
    
    // 更新玩家叫牌狀態顯示
    updatePlayersBiddingStatus() {
        const container = document.getElementById('players-bidding-status');
        const totalBids = this.bids.reduce((sum, bid) => sum + (bid || 0), 0);
        
        // 按照出牌順序顯示玩家
        const orderedPlayers = this.playerOrder.map(orderIndex => ({
            index: orderIndex,
            player: this.players[orderIndex],
            isCurrentPlayer: this.playerOrder[this.currentBiddingPlayerIndex] === orderIndex,
            hasBid: this.bids[orderIndex] !== null && this.bids[orderIndex] !== undefined,
            bidValue: this.bids[orderIndex] || 0
        }));
        
        container.innerHTML = orderedPlayers.map(({index, player, isCurrentPlayer, hasBid, bidValue}) => {
            let statusText = '';
            if (isCurrentPlayer) {
                statusText = `請叫牌`;
            } else if (hasBid) {
                statusText = `已叫牌: ${bidValue}墩`;
            } else {
                statusText = '等待叫牌中';
            }
            
            return `
                <div class="player-bidding-card ${isCurrentPlayer ? 'current' : ''}">
                    <div class="player-info">
                        <h3>${player}</h3>
                        <div class="status">${statusText}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 顯示叫牌摘要
    showBiddingSummary() {
        const biddingSummary = document.getElementById('bidding-summary');
        const startPlayingBtn = document.getElementById('start-playing');
        
        if (biddingSummary) {
            biddingSummary.style.display = 'block';
        }
        
        if (startPlayingBtn) {
            startPlayingBtn.style.display = 'block';
        }
        
        // 更新玩家狀態顯示，顯示所有玩家的叫牌結果
        this.updatePlayersBiddingStatus();
        
        this.hideKeypad();
    }

    // 清除叫牌摘要
    clearBiddingSummary() {
        document.getElementById('bidding-summary').style.display = 'none';
        document.getElementById('start-playing').style.display = 'none';
        // 清除玩家狀態顯示
        const playersStatus = document.getElementById('players-bidding-status');
        if (playersStatus) {
            playersStatus.innerHTML = '';
        }
    }

    // 顯示數字鍵盤
    showKeypad() {
        const keypad = document.getElementById('number-keypad');
        keypad.style.display = 'flex';
        // 顯示底部固定區域時增加頁面底部空白，避免遮擋最後一張卡片
        document.body.classList.add('with-bottom-gap');
        
        // 更新按鈕狀態
        document.querySelectorAll('.keypad-btn[data-value]').forEach(btn => {
            const value = parseInt(btn.dataset.value);
            const totalBids = this.bids.reduce((sum, bid) => sum + (bid || 0), 0);
            const isLastPlayer = this.currentBiddingPlayerIndex === this.players.length - 1;
            
            // 顯示所有從 0 到最大牌數的按鈕
            if (value <= this.currentTricks) {
                btn.style.display = 'block';
                
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
            } else {
                // 隱藏超過最大牌數的按鈕
                btn.style.display = 'none';
            }
            
            // 高亮選中的數字
            if (value === this.selectedBid) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });

        // 每次顯示鍵盤時同步刷新總叫牌提示
        const totalIndicator = document.getElementById('total-bids-indicator');
        const totalBids = this.bids.reduce((sum, bid) => sum + (bid || 0), 0);
        if (totalIndicator) totalIndicator.textContent = `已共叫${totalBids}墩`;
        const confirmBtn = document.getElementById('confirm-bid');
        if (confirmBtn) {
            confirmBtn.textContent = '確定';
        }
    }

    // 隱藏數字鍵盤
    hideKeypad() {
        const keypad = document.getElementById('number-keypad');
        keypad.style.display = 'none';
        document.body.classList.remove('with-bottom-gap');
        
        // 重置所有按鈕的顯示狀態
        document.querySelectorAll('.keypad-btn[data-value]').forEach(btn => {
            btn.style.display = 'block';
            btn.disabled = false;
            btn.classList.remove('selected');
        });
    }

    // 選擇叫牌數
    selectBid(value) {
        this.selectedBid = value;
        console.log(`選擇叫牌數: ${value}`);
        this.updateBiddingDisplay();
    }

    // 確認叫牌
    confirmBid() {
        if (this.selectedBid === null || this.selectedBid === undefined) {
            alert('請選擇叫牌數！');
            return;
        }
        
        const currentPlayerIndex = this.playerOrder[this.currentBiddingPlayerIndex];
        console.log(`玩家${currentPlayerIndex + 1}叫牌: ${this.selectedBid}`);
        this.bids[currentPlayerIndex] = this.selectedBid;
        this.currentBiddingPlayerIndex++;
        this.selectedBid = null; // 重置為null而不是0
        
        if (this.currentBiddingPlayerIndex < this.players.length) {
            const nextPlayerIndex = this.playerOrder[this.currentBiddingPlayerIndex];
            console.log(`輪到玩家${nextPlayerIndex + 1}叫牌`);
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
            // 進入結果階段時，將未初始化的actualTricks設為對應叫牌數
            for (let i = 0; i < this.players.length; i++) {
                if (this.actualTricks[i] === null || this.actualTricks[i] === undefined) {
                    this.actualTricks[i] = this.bids[i] ?? 0;
                }
            }
            this.updateDisplay();
        }, 1000);
    }

    // 更新結果顯示
    updateResultsDisplay() {
        // 更新標題信息
        const currentRoundEl = document.getElementById('current-round-results');
        const cardsPerPlayerEl = document.getElementById('cards-per-player-results');
        const trumpSuitEl = document.getElementById('trump-suit-results');
        
        if (currentRoundEl) currentRoundEl.textContent = this.currentRound;
        if (cardsPerPlayerEl) cardsPerPlayerEl.textContent = this.currentTricks;
        if (trumpSuitEl) trumpSuitEl.textContent = this.trumpSuit;
        
        const resultsList = document.getElementById('results-list');
        // 按照出牌順序顯示玩家
        const orderedPlayers = this.playerOrder.map(orderIndex => ({
            index: orderIndex,
            player: this.players[orderIndex]
        }));
        
        resultsList.innerHTML = orderedPlayers.map(({index, player}) => {
            // 將預設墩數設為該玩家叫牌數（僅在尚未初始化時）
            if (this.actualTricks[index] === null || this.actualTricks[index] === undefined) {
                this.actualTricks[index] = this.bids[index];
            }
            
            const currentValue = this.actualTricks[index];
            const canDecrease = currentValue > 0;
            const canIncrease = currentValue < this.currentTricks;
            
            return `
                <div class="player-result">
                    <div class="player-info">
                        <h3>${player}</h3>
                        <div class="bid-info">已叫牌: ${this.bids[index]} 墩</div>
                    </div>
                    <div class="trick-controls">
                        <div class="trick-number ${currentValue !== this.bids[index] ? 'mismatch' : ''}">${currentValue}</div>
                        <div class="triangle-buttons">
                            <button class="triangle-btn" onclick="game.adjustTricks(${index}, 1)" ${!canIncrease ? 'disabled' : ''}>▲</button>
                            <button class="triangle-btn" onclick="game.adjustTricks(${index}, -1)" ${!canDecrease ? 'disabled' : ''}>▼</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 調整墩數
    adjustTricks(playerIndex, change) {
        const currentValue = this.actualTricks[playerIndex] !== null && this.actualTricks[playerIndex] !== undefined 
            ? this.actualTricks[playerIndex] 
            : this.bids[playerIndex];
        const newValue = currentValue + change;
        
        console.log(`玩家${playerIndex + 1}調整墩數: ${currentValue} + ${change} = ${newValue}`);
        
        if (newValue >= 0 && newValue <= this.currentTricks) {
            this.actualTricks[playerIndex] = newValue;
            this.updateResultsDisplay();
        } else {
            console.log(`調整失敗: 新值${newValue}超出範圍[0, ${this.currentTricks}]`);
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
        
        // 驗證總墩數是否等於發牌數量
        const totalTricks = this.actualTricks.reduce((sum, tricks) => sum + tricks, 0);
        console.log(`總墩數: ${totalTricks}, 發牌數量: ${this.currentTricks}`);
        
        if (totalTricks !== this.currentTricks) {
            alert(`錯誤！所有玩家的出牌結果總數必須等於發牌數量。\n\n當前總數: ${totalTricks}\n發牌數量: ${this.currentTricks}\n\n請調整後重新計算。`);
            return;
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
                // 根據選擇的計分方法計算扣分
                if (this.scoringMethod === 'cubed') {
                    this.scores[index] -= (difference * difference * difference);
                } else {
                    this.scores[index] -= (difference * difference);
                }
            }
        });
    }

    // 更新分數顯示
    updateScoresDisplay() {
        // 更新標題信息
        document.getElementById('current-round-scores').textContent = this.currentRound;
        document.getElementById('cards-per-player-scores').textContent = this.currentTricks;
        document.getElementById('trump-suit-scores').textContent = this.trumpSuit;
        
        const scoreDisplay = document.getElementById('players-score');
        
        // 按照出牌順序顯示玩家
        const orderedPlayers = this.playerOrder.map(orderIndex => ({
            index: orderIndex,
            player: this.players[orderIndex]
        }));
        
        scoreDisplay.innerHTML = orderedPlayers.map(({index, player}) => {
            const currentScore = this.scores[index];
            const previousScore = this.currentRound > 1 ? this.scores[index] - this.getCurrentRoundScore(index) : 0;
            const currentRoundScore = this.getCurrentRoundScore(index);
            
            return `
                <div class="player-score">
                    <div class="player-info">
                        <h3>${player}</h3>
                        <div class="score-formula">
                            上局${previousScore} + 今局${currentRoundScore}
                        </div>
                    </div>
                    <div class="score-value">${currentScore}</div>
                </div>
            `;
        }).join('');
    }
    
    // 獲取當前回合的分數
    getCurrentRoundScore(playerIndex) {
        if (this.bids[playerIndex] === null || this.bids[playerIndex] === undefined || 
            this.actualTricks[playerIndex] === null || this.actualTricks[playerIndex] === undefined) {
            return 0;
        }
        
        const bid = this.bids[playerIndex];
        const actual = this.actualTricks[playerIndex];
        const difference = actual - bid;
        
        if (difference === 0) {
            return 10 + (actual * actual);
        } else {
            return -(difference * difference);
        }
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
        // 輪轉發牌者：找到當前發牌者在playerOrder中的位置，然後輪轉到下一個
        const currentDealerIndex = this.playerOrder.indexOf(this.currentDealer);
        const nextDealerIndex = (currentDealerIndex + 1) % this.players.length;
        this.currentDealer = this.playerOrder[nextDealerIndex];
        
        // 重新排列玩家順序，讓新的發牌者排在最前面
        const newOrder = [];
        for (let i = 0; i < this.players.length; i++) {
            newOrder.push((this.currentDealer + i) % this.players.length);
        }
        this.playerOrder = newOrder;
        
        // 重置叫牌順序，從新的發牌者開始
        this.currentBiddingPlayerIndex = 0;
        
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
            this.currentBiddingPlayerIndex = 0;
            this.selectedBid = null;
            
            // 清除叫牌摘要顯示
            this.clearBiddingSummary();
            
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
            currentBiddingPlayer: this.currentBiddingPlayerIndex,
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
            this.currentBiddingPlayerIndex = gameState.currentBiddingPlayer || 0;
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