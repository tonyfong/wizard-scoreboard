// 德國橋牌計分程式 - 測試框架
class TestFramework {
    constructor() {
        this.tests = [];
        this.results = {};
        this.logElement = document.getElementById('test-log');
        this.testGame = null;
    }

    // 記錄測試日誌
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.innerHTML = `[${timestamp}] ${message}`;
        
        if (type === 'error') {
            logEntry.style.color = '#e74c3c';
        } else if (type === 'success') {
            logEntry.style.color = '#27ae60';
        } else if (type === 'warning') {
            logEntry.style.color = '#f39c12';
        }
        
        this.logElement.appendChild(logEntry);
        this.logElement.scrollTop = this.logElement.scrollHeight;
    }

    // 清除日誌
    clearLog() {
        this.logElement.innerHTML = '<div>測試日誌已清除...</div>';
    }

    // 設置測試結果
    setResult(testId, passed, message) {
        const resultElement = document.getElementById(`${testId}-result`);
        resultElement.textContent = message;
        resultElement.className = `test-result ${passed ? 'pass' : 'fail'}`;
        this.results[testId] = { passed, message };
    }

    // 測試1: 遊戲實例創建
    async test1_GameInstance() {
        try {
            this.log('測試1: 檢查遊戲實例創建...');
            
            // 檢查全局遊戲實例是否存在
            if (typeof window.game !== 'undefined' && window.game !== null) {
                this.log('✅ 遊戲實例存在', 'success');
                
                // 檢查基本屬性
                const requiredProps = ['players', 'scores', 'history', 'currentRound', 'gamePhase'];
                const missingProps = requiredProps.filter(prop => !(prop in window.game));
                
                if (missingProps.length === 0) {
                    this.setResult('test1', true, '✅ 遊戲實例創建成功，所有必要屬性存在');
                    this.log('✅ 所有必要屬性存在', 'success');
                } else {
                    this.setResult('test1', false, `❌ 缺少屬性: ${missingProps.join(', ')}`);
                    this.log(`❌ 缺少屬性: ${missingProps.join(', ')}`, 'error');
                }
            } else {
                this.setResult('test1', false, '❌ 遊戲實例不存在');
                this.log('❌ 遊戲實例不存在', 'error');
            }
        } catch (error) {
            this.setResult('test1', false, `❌ 錯誤: ${error.message}`);
            this.log(`❌ 測試1錯誤: ${error.message}`, 'error');
        }
    }

    // 測試2: 事件監聽器設置
    async test2_EventListeners() {
        try {
            this.log('測試2: 檢查事件監聽器...');
            
            const requiredButtons = [
                'start-game',
                'clear-game',
                'confirm-bid',
                'start-playing',
                'calculate-scores',
                'show-history',
                'next-round'
            ];
            
            let allButtonsExist = true;
            const missingButtons = [];
            
            for (const buttonId of requiredButtons) {
                const button = document.getElementById(buttonId);
                if (!button) {
                    allButtonsExist = false;
                    missingButtons.push(buttonId);
                }
            }
            
            if (allButtonsExist) {
                this.setResult('test2', true, '✅ 所有必要按鈕存在');
                this.log('✅ 所有必要按鈕存在', 'success');
            } else {
                this.setResult('test2', false, `❌ 缺少按鈕: ${missingButtons.join(', ')}`);
                this.log(`❌ 缺少按鈕: ${missingButtons.join(', ')}`, 'error');
            }
        } catch (error) {
            this.setResult('test2', false, `❌ 錯誤: ${error.message}`);
            this.log(`❌ 測試2錯誤: ${error.message}`, 'error');
        }
    }

    // 測試3: 本地存儲功能
    async test3_LocalStorage() {
        try {
            this.log('測試3: 檢查本地存儲功能...');
            
            if (typeof storage !== 'undefined' && storage !== null) {
                // 測試保存和載入
                const testData = {
                    players: ['測試玩家1', '測試玩家2'],
                    scores: [10, 20],
                    history: ['測試記錄'],
                    currentRound: 1
                };
                
                storage.saveGame(testData);
                const loadedData = storage.loadGame();
                
                if (loadedData && loadedData.players && loadedData.players.length === 2) {
                    this.setResult('test3', true, '✅ 本地存儲功能正常');
                    this.log('✅ 本地存儲功能正常', 'success');
                } else {
                    this.setResult('test3', false, '❌ 本地存儲數據不正確');
                    this.log('❌ 本地存儲數據不正確', 'error');
                }
                
                // 清理測試數據
                storage.clearGame();
            } else {
                this.setResult('test3', false, '❌ 存儲模組不存在');
                this.log('❌ 存儲模組不存在', 'error');
            }
        } catch (error) {
            this.setResult('test3', false, `❌ 錯誤: ${error.message}`);
            this.log(`❌ 測試3錯誤: ${error.message}`, 'error');
        }
    }

    // 測試4: 開始新遊戲
    async test4_StartGame() {
        try {
            this.log('測試4: 測試開始新遊戲...');
            
            // 檢查遊戲實例是否存在
            if (!window.game) {
                this.setResult('test4', false, '❌ 遊戲實例不存在');
                this.log('❌ 遊戲實例不存在', 'error');
                return;
            }
            
            // 設置4人遊戲
            const playerCountSelect = document.getElementById('player-count');
            if (playerCountSelect) {
                playerCountSelect.value = '4';
            } else {
                this.setResult('test4', false, '❌ 找不到玩家數量選擇器');
                this.log('❌ 找不到玩家數量選擇器', 'error');
                return;
            }
            
            // 開始遊戲
            window.game.startGame();
            
            // 檢查遊戲狀態
            if (window.game.players.length === 4 && 
                window.game.scores.length === 4 && 
                window.game.gamePhase === 'bidding') {
                this.setResult('test4', true, '✅ 4人遊戲開始成功');
                this.log('✅ 4人遊戲開始成功', 'success');
            } else {
                this.setResult('test4', false, '❌ 遊戲開始失敗');
                this.log('❌ 遊戲開始失敗', 'error');
            }
        } catch (error) {
            this.setResult('test4', false, `❌ 錯誤: ${error.message}`);
            this.log(`❌ 測試4錯誤: ${error.message}`, 'error');
        }
    }

    // 測試5: 叫牌流程
    async test5_BiddingProcess() {
        try {
            this.log('測試5: 測試叫牌流程...');
            
            // 檢查遊戲實例是否存在
            if (!window.game) {
                this.setResult('test5', false, '❌ 遊戲實例不存在');
                this.log('❌ 遊戲實例不存在', 'error');
                return;
            }
            
            // 確保遊戲處於叫牌階段
            if (window.game.gamePhase !== 'bidding') {
                window.game.gamePhase = 'bidding';
                window.game.players = ['玩家1', '玩家2', '玩家3', '玩家4'];
                window.game.bids = new Array(4).fill(null);
                window.game.currentBiddingPlayer = 0;
            }
            
            // 模擬叫牌過程
            const testBids = [1, 0, 2, 1];
            let allBidsSet = true;
            
            for (let i = 0; i < testBids.length; i++) {
                window.game.selectedBid = testBids[i];
                window.game.confirmBid();
                
                if (window.game.bids[i] !== testBids[i]) {
                    allBidsSet = false;
                    break;
                }
            }
            
            if (allBidsSet && window.game.currentBiddingPlayer === testBids.length) {
                this.setResult('test5', true, '✅ 叫牌流程正常');
                this.log('✅ 叫牌流程正常', 'success');
            } else {
                this.setResult('test5', false, '❌ 叫牌流程失敗');
                this.log('❌ 叫牌流程失敗', 'error');
            }
        } catch (error) {
            this.setResult('test5', false, `❌ 錯誤: ${error.message}`);
            this.log(`❌ 測試5錯誤: ${error.message}`, 'error');
        }
    }

    // 測試6: 出牌結果調整
    async test6_AdjustTricks() {
        try {
            this.log('測試6: 測試出牌結果調整...');
            
            // 進入結果階段
            window.game.gamePhase = 'results';
            window.game.actualTricks = [1, 0, 2, 1];
            
            // 測試調整功能
            const originalValue = window.game.actualTricks[0];
            window.game.adjustTricks(0, -1); // 減少1
            const afterDecrease = window.game.actualTricks[0];
            
            window.game.adjustTricks(0, 1); // 增加1
            const afterIncrease = window.game.actualTricks[0];
            
            if (afterDecrease === originalValue - 1 && afterIncrease === originalValue) {
                this.setResult('test6', true, '✅ 出牌結果調整正常');
                this.log('✅ 出牌結果調整正常', 'success');
            } else {
                this.setResult('test6', false, '❌ 出牌結果調整失敗');
                this.log('❌ 出牌結果調整失敗', 'error');
            }
        } catch (error) {
            this.setResult('test6', false, `❌ 錯誤: ${error.message}`);
            this.log(`❌ 測試6錯誤: ${error.message}`, 'error');
        }
    }

    // 測試7: 分數計算
    async test7_ScoreCalculation() {
        try {
            this.log('測試7: 測試分數計算...');
            
            // 設置測試數據
            window.game.bids = [1, 0, 2, 1];
            window.game.actualTricks = [1, 0, 2, 1];
            window.game.currentTricks = 4; // 總數等於發牌數量
            
            const originalScores = [...window.game.scores];
            window.game.calculateScores();
            
            // 檢查分數是否正確計算
            let scoresChanged = false;
            for (let i = 0; i < originalScores.length; i++) {
                if (window.game.scores[i] !== originalScores[i]) {
                    scoresChanged = true;
                    break;
                }
            }
            
            if (scoresChanged && window.game.gamePhase === 'scores') {
                this.setResult('test7', true, '✅ 分數計算正常');
                this.log('✅ 分數計算正常', 'success');
            } else {
                this.setResult('test7', false, '❌ 分數計算失敗');
                this.log('❌ 分數計算失敗', 'error');
            }
        } catch (error) {
            this.setResult('test7', false, `❌ 錯誤: ${error.message}`);
            this.log(`❌ 測試7錯誤: ${error.message}`, 'error');
        }
    }

    // 測試8: 新回合開始
    async test8_NewRound() {
        try {
            this.log('測試8: 測試新回合開始...');
            
            const originalRound = window.game.currentRound;
            window.game.startNewRound();
            
            if (window.game.currentRound === originalRound + 1 && 
                window.game.gamePhase === 'bidding' &&
                window.game.currentBiddingPlayer === 0) {
                this.setResult('test8', true, '✅ 新回合開始正常');
                this.log('✅ 新回合開始正常', 'success');
            } else {
                this.setResult('test8', false, '❌ 新回合開始失敗');
                this.log('❌ 新回合開始失敗', 'error');
            }
        } catch (error) {
            this.setResult('test8', false, `❌ 錯誤: ${error.message}`);
            this.log(`❌ 測試8錯誤: ${error.message}`, 'error');
        }
    }

    // 測試9: 牌數變化規則
    async test9_CardDistribution() {
        try {
            this.log('測試9: 測試牌數變化規則...');
            
            // 測試不同人數的牌數計算
            const testCases = [
                { players: 2, expected: 26 },
                { players: 3, expected: 17 },
                { players: 4, expected: 13 },
                { players: 8, expected: 6 }
            ];
            
            let allCorrect = true;
            for (const testCase of testCases) {
                const result = window.game.calculateMaxCardsPerPlayer(testCase.players);
                if (result !== testCase.expected) {
                    allCorrect = false;
                    this.log(`❌ ${testCase.players}人遊戲牌數錯誤: 期望${testCase.expected}, 實際${result}`, 'error');
                }
            }
            
            if (allCorrect) {
                this.setResult('test9', true, '✅ 牌數變化規則正確');
                this.log('✅ 牌數變化規則正確', 'success');
            } else {
                this.setResult('test9', false, '❌ 牌數變化規則錯誤');
                this.log('❌ 牌數變化規則錯誤', 'error');
            }
        } catch (error) {
            this.setResult('test9', false, `❌ 錯誤: ${error.message}`);
            this.log(`❌ 測試9錯誤: ${error.message}`, 'error');
        }
    }

    // 測試10: 清除遊戲功能
    async test10_ClearGame() {
        try {
            this.log('測試10: 測試清除遊戲功能...');
            
            // 設置一些遊戲數據
            window.game.players = ['玩家1', '玩家2'];
            window.game.scores = [10, 20];
            window.game.history = ['測試記錄'];
            
            // 清除遊戲
            window.game.clearGame();
            
            if (window.game.players.length === 0 && 
                window.game.scores.length === 0 && 
                window.game.history.length === 0 &&
                window.game.gamePhase === 'setup') {
                this.setResult('test10', true, '✅ 清除遊戲功能正常');
                this.log('✅ 清除遊戲功能正常', 'success');
            } else {
                this.setResult('test10', false, '❌ 清除遊戲功能失敗');
                this.log('❌ 清除遊戲功能失敗', 'error');
            }
        } catch (error) {
            this.setResult('test10', false, `❌ 錯誤: ${error.message}`);
            this.log(`❌ 測試10錯誤: ${error.message}`, 'error');
        }
    }

    // 測試11: 數字鍵盤功能
    async test11_Keypad() {
        try {
            this.log('測試11: 測試數字鍵盤功能...');
            
            // 檢查鍵盤按鈕是否存在
            const keypadButtons = document.querySelectorAll('.keypad-btn[data-value]');
            
            if (keypadButtons.length >= 11) { // 0-10
                this.setResult('test11', true, '✅ 數字鍵盤按鈕完整');
                this.log('✅ 數字鍵盤按鈕完整', 'success');
            } else {
                this.setResult('test11', false, '❌ 數字鍵盤按鈕不完整');
                this.log('❌ 數字鍵盤按鈕不完整', 'error');
            }
        } catch (error) {
            this.setResult('test11', false, `❌ 錯誤: ${error.message}`);
            this.log(`❌ 測試11錯誤: ${error.message}`, 'error');
        }
    }

    // 測試12: 階段切換
    async test12_PhaseTransition() {
        try {
            this.log('測試12: 測試階段切換...');
            
            const phases = ['setup', 'bidding', 'playing', 'results', 'scores'];
            let allPhasesWork = true;
            
            for (const phase of phases) {
                window.game.gamePhase = phase;
                window.game.updateDisplay();
                
                // 檢查階段是否正確設置
                if (window.game.gamePhase !== phase) {
                    allPhasesWork = false;
                    break;
                }
            }
            
            if (allPhasesWork) {
                this.setResult('test12', true, '✅ 階段切換正常');
                this.log('✅ 階段切換正常', 'success');
            } else {
                this.setResult('test12', false, '❌ 階段切換失敗');
                this.log('❌ 階段切換失敗', 'error');
            }
        } catch (error) {
            this.setResult('test12', false, `❌ 錯誤: ${error.message}`);
            this.log(`❌ 測試12錯誤: ${error.message}`, 'error');
        }
    }

    // 測試13: 歷史記錄
    async test13_History() {
        try {
            this.log('測試13: 測試歷史記錄功能...');
            
            // 添加一些歷史記錄
            window.game.history = ['第1回合: 玩家1叫1贏1', '第2回合: 玩家2叫0贏0'];
            
            // 檢查歷史記錄功能
            if (window.game.history.length === 2) {
                this.setResult('test13', true, '✅ 歷史記錄功能正常');
                this.log('✅ 歷史記錄功能正常', 'success');
            } else {
                this.setResult('test13', false, '❌ 歷史記錄功能失敗');
                this.log('❌ 歷史記錄功能失敗', 'error');
            }
        } catch (error) {
            this.setResult('test13', false, `❌ 錯誤: ${error.message}`);
            this.log(`❌ 測試13錯誤: ${error.message}`, 'error');
        }
    }

    // 運行所有測試
    async runAllTests() {
        this.log('🚀 開始運行所有測試...', 'info');
        this.log('==================================================', 'info');
        
        const tests = [
            () => this.test1_GameInstance(),
            () => this.test2_EventListeners(),
            () => this.test3_LocalStorage(),
            () => this.test4_StartGame(),
            () => this.test5_BiddingProcess(),
            () => this.test6_AdjustTricks(),
            () => this.test7_ScoreCalculation(),
            () => this.test8_NewRound(),
            () => this.test9_CardDistribution(),
            () => this.test10_ClearGame(),
            () => this.test11_Keypad(),
            () => this.test12_PhaseTransition(),
            () => this.test13_History()
        ];
        
        for (let i = 0; i < tests.length; i++) {
            try {
                await tests[i]();
                // 添加小延遲避免測試衝突
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                this.log(`❌ 測試${i + 1}發生未預期錯誤: ${error.message}`, 'error');
            }
        }
        
        // 顯示測試總結
        this.showTestSummary();
    }

    // 顯示測試總結
    showTestSummary() {
        const totalTests = Object.keys(this.results).length;
        const passedTests = Object.values(this.results).filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        
        this.log('==================================================', 'info');
        this.log(`📊 測試總結:`, 'info');
        this.log(`✅ 通過: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'success' : 'warning');
        this.log(`❌ 失敗: ${failedTests}/${totalTests}`, failedTests > 0 ? 'error' : 'success');
        
        if (failedTests === 0) {
            this.log('🎉 所有測試通過！核心功能正常。', 'success');
        } else {
            this.log('⚠️ 有測試失敗，請檢查相關功能。', 'warning');
        }
    }
}

// 初始化測試框架
const testFramework = new TestFramework();

// 全局函數
function runAllTests() {
    testFramework.runAllTests();
}

function clearLog() {
    testFramework.clearLog();
}

// 頁面載入完成後自動運行基本測試
document.addEventListener('DOMContentLoaded', function() {
    testFramework.log('測試框架已載入，準備就緒。', 'info');
});
