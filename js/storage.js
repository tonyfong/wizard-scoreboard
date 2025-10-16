// 數據存儲管理
class Storage {
    constructor() {
        console.log('初始化存儲系統...');
        this.STORAGE_KEY = 'german_bridge_game';
        
        // 測試localStorage是否可用
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            console.log('localStorage 可用');
        } catch (error) {
            console.error('localStorage 不可用:', error);
        }
    }

    // 保存遊戲數據
    saveGame(gameData) {
        try {
            console.log('保存遊戲數據:', gameData);
            const dataString = JSON.stringify(gameData);
            localStorage.setItem(this.STORAGE_KEY, dataString);
            console.log('遊戲數據保存成功');
            return true;
        } catch (error) {
            console.error('保存遊戲數據失敗:', error);
            return false;
        }
    }

    // 載入遊戲數據
    loadGame() {
        try {
            console.log('嘗試載入遊戲數據...');
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) {
                console.log('沒有找到保存的遊戲數據');
                return null;
            }
            const gameData = JSON.parse(data);
            console.log('載入的遊戲數據:', gameData);
            return gameData;
        } catch (error) {
            console.error('載入遊戲數據失敗:', error);
            return null;
        }
    }

    // 清除遊戲數據
    clearGame() {
        try {
            console.log('清除遊戲數據...');
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('遊戲數據清除成功');
            return true;
        } catch (error) {
            console.error('清除遊戲數據失敗:', error);
            return false;
        }
    }
}

// 初始化存儲
console.log('創建存儲實例...');
const storage = new Storage(); 