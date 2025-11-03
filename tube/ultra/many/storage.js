// ローカルストレージ管理
const Storage = {
    KEYS: {
        HISTORY: 'wool_tube_history',
        THEME: 'wool_tube_theme'
    },
    
    // 検索履歴の読み込み
    loadHistory() {
        try {
            const saved = localStorage.getItem(this.KEYS.HISTORY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('履歴の読み込みに失敗:', e);
            return [];
        }
    },
    
    // 検索履歴の保存
    saveHistory(history) {
        try {
            localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
            return true;
        } catch (e) {
            console.error('履歴の保存に失敗:', e);
            return false;
        }
    },
    
    // 検索履歴に追加
    addToHistory(query, maxItems = CONFIG.MAX_HISTORY) {
        let history = this.loadHistory();
        
        // 重複を削除
        history = history.filter(item => item !== query);
        
        // 先頭に追加
        history.unshift(query);
        
        // 最大数を超えたら削除
        if (history.length > maxItems) {
            history = history.slice(0, maxItems);
        }
        
        this.saveHistory(history);
        return history;
    },
    
    // 履歴項目の削除
    removeFromHistory(index) {
        const history = this.loadHistory();
        history.splice(index, 1);
        this.saveHistory(history);
        return history;
    },
    
    // テーマの保存
    saveTheme(theme) {
        try {
            localStorage.setItem(this.KEYS.THEME, theme);
            return true;
        } catch (e) {
            console.error('テーマの保存に失敗:', e);
            return false;
        }
    },
    
    // テーマの読み込み
    loadTheme() {
        try {
            return localStorage.getItem(this.KEYS.THEME) || 'dark';
        } catch (e) {
            console.error('テーマの読み込みに失敗:', e);
            return 'dark';
        }
    }
};
