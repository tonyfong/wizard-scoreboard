// 德國橋牌計分程式 - 內聯測試腳本
// 這個腳本可以直接在主遊戲頁面的控制台中運行

function runInlineTests() {
    console.log('🧪 開始運行內聯測試...');
    console.log('==================================================');
    
    let passedTests = 0;
    let totalTests = 0;
    
    function test(name, condition, message) {
        totalTests++;
        if (condition) {
            console.log(`✅ ${name}: ${message}`);
            passedTests++;
        } else {
            console.log(`❌ ${name}: ${message}`);
        }
    }
    
    // 測試1: 遊戲實例
    test('遊戲實例', 
         typeof window.game !== 'undefined' && window.game !== null,
         '遊戲實例存在');
    
    // 測試2: 基本屬性
    if (window.game) {
        test('基本屬性', 
             'players' in window.game && 'scores' in window.game && 'gamePhase' in window.game,
             '基本屬性存在');
        
        // 測試3: 牌數計算
        test('牌數計算-2人', 
             window.game.calculateMaxCardsPerPlayer(2) === 26,
             '2人遊戲牌數正確');
        
        test('牌數計算-4人', 
             window.game.calculateMaxCardsPerPlayer(4) === 13,
             '4人遊戲牌數正確');
        
        test('牌數計算-8人', 
             window.game.calculateMaxCardsPerPlayer(8) === 6,
             '8人遊戲牌數正確');
        
        // 測試4: 遊戲流程
        const originalPlayers = window.game.players;
        const originalScores = window.game.scores;
        const originalPhase = window.game.gamePhase;
        
        // 設置測試數據
        window.game.players = ['測試玩家1', '測試玩家2', '測試玩家3', '測試玩家4'];
        window.game.scores = [0, 0, 0, 0];
        window.game.gamePhase = 'bidding';
        window.game.bids = [1, 0, 2, 1];
        window.game.actualTricks = [1, 0, 2, 1];
        window.game.currentTricks = 4;
        
        test('叫牌數據設置', 
             window.game.players.length === 4 && window.game.bids.length === 4,
             '叫牌數據設置成功');
        
        // 測試5: 分數計算
        try {
            const originalScoresCopy = [...window.game.scores];
            window.game.calculateScoresInternal(window.game.actualTricks);
            const scoresChanged = window.game.scores.some((score, index) => score !== originalScoresCopy[index]);
            
            test('分數計算', 
                 scoresChanged,
                 '分數計算功能正常');
        } catch (error) {
            test('分數計算', false, `分數計算錯誤: ${error.message}`);
        }
        
        // 恢復原始數據
        window.game.players = originalPlayers;
        window.game.scores = originalScores;
        window.game.gamePhase = originalPhase;
    }
    
    // 測試6: 存儲功能
    test('存儲模組', 
         typeof storage !== 'undefined',
         '存儲模組存在');
    
    if (typeof storage !== 'undefined') {
        try {
            const testData = { test: 'data' };
            storage.saveGame(testData);
            const loadedData = storage.loadGame();
            
            test('存儲功能', 
                 loadedData && loadedData.test === 'data',
                 '存儲功能正常');
            
            storage.clearGame();
        } catch (error) {
            test('存儲功能', false, `存儲功能錯誤: ${error.message}`);
        }
    }
    
    // 測試7: DOM元素
    const requiredElements = [
        'start-game',
        'player-count',
        'number-keypad',
        'confirm-bid'
    ];
    
    let elementsFound = 0;
    requiredElements.forEach(id => {
        if (document.getElementById(id)) {
            elementsFound++;
        }
    });
    
    test('DOM元素', 
         elementsFound === requiredElements.length,
         `找到 ${elementsFound}/${requiredElements.length} 個必要元素`);
    
    // 測試總結
    console.log('==================================================');
    console.log(`📊 測試總結: ${passedTests}/${totalTests} 通過`);
    
    if (passedTests === totalTests) {
        console.log('🎉 所有測試通過！核心功能正常。');
    } else {
        console.log('⚠️ 有測試失敗，請檢查相關功能。');
    }
    
    return {
        passed: passedTests,
        total: totalTests,
        success: passedTests === totalTests
    };
}

// 自動運行測試（如果直接執行）
if (typeof window !== 'undefined') {
    console.log('內聯測試腳本已載入。運行 runInlineTests() 開始測試。');
}
