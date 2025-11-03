// アプリケーション初期化とイベント処理
const App = {
    // 初期化
    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        UI.loadTheme();
    },
    
    // イベントリスナー設定
    setupEventListeners() {
        // 検索
        const searchBtn = document.getElementById('searchBtn');
        const searchQuery = document.getElementById('searchQuery');
        
        searchBtn.addEventListener('click', () => this.search());
        searchQuery.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });
        
        // 検索履歴
        searchQuery.addEventListener('focus', () => UI.showSearchHistory());
        searchQuery.addEventListener('blur', () => {
            setTimeout(() => UI.hideSearchHistory(), 200);
        });
        
        // 検索履歴のクリック
        const searchHistory = document.getElementById('searchHistory');
        searchHistory.addEventListener('click', (e) => {
            const historyItem = e.target.closest('.history-item');
            const deleteBtn = e.target.closest('.history-item-delete');
            
            if (deleteBtn) {
                e.stopPropagation();
                const index = parseInt(deleteBtn.dataset.index);
                Storage.removeFromHistory(index);
                UI.showSearchHistory();
            } else if (historyItem) {
                const query = historyItem.dataset.query;
                searchQuery.value = query;
                UI.hideSearchHistory();
                this.search();
            }
        });
        
        // APIキー選択
        const apiKeySelect = document.getElementById('apiKeySelect');
        const customKeyInput = document.getElementById('customKeyInput');
        
        apiKeySelect.addEventListener('change', () => {
            if (apiKeySelect.value === 'custom') {
                customKeyInput.style.display = 'flex';
            } else {
                customKeyInput.style.display = 'none';
            }
        });
        
        // プレイヤーコントロール
        document.getElementById('btnStream').addEventListener('click', () => Player.setMode('stream'));
        document.getElementById('btnEmbed').addEventListener('click', () => Player.setMode('embed'));
        document.getElementById('btnNoCookie').addEventListener('click', () => Player.setMode('nocookie'));
        document.getElementById('btnLoop').addEventListener('click', () => Player.toggleLoop());
        
        // 再生速度
        document.querySelectorAll('.speed-btn[data-speed]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const speed = parseFloat(btn.dataset.speed);
                Player.setSpeed(speed);
                
                // アクティブ状態更新
                document.querySelectorAll('.speed-btn[data-speed]').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
            });
        });
        
        // その他のコントロール
        document.getElementById('btnPip').addEventListener('click', () => Player.togglePiP());
        document.getElementById('btnFullscreen').addEventListener('click', () => Player.toggleFullscreen());
        document.getElementById('btnStats').addEventListener('click', () => Player.toggleStats());
        
        // ダウンロード
        document.getElementById('btnDownloadVideo').addEventListener('click', () => Player.download('video'));
        document.getElementById('btnDownloadAudio').addEventListener('click', () => Player.download('audio'));
        
        // デバッグ
        document.getElementById('btnDebugToggle').addEventListener('click', () => UI.toggleDebugLog());
        
        // テーマ切り替え
        document.getElementById('themeToggle').addEventListener('click', () => UI.toggleTheme());
    },
    
    // キーボードショートカット
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const player = document.getElementById('player');
            if (!player || player.tagName !== 'VIDEO') return;
            
            // 入力フィールドにフォーカスがある場合はスキップ
            if (e.target.tagName === 'INPUT') return;
            
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    if (player.paused) {
                        player.play();
                    } else {
                        player.pause();
                    }
                    break;
                    
                case 'ArrowLeft':
                    player.currentTime = Math.max(0, player.currentTime - 5);
                    break;
                    
                case 'ArrowRight':
                    player.currentTime = Math.min(player.duration, player.currentTime + 5);
                    break;
                    
                case 'KeyM':
                    player.muted = !player.muted;
                    break;
                    
                case 'KeyF':
                    Player.toggleFullscreen();
                    break;
            }
        });
    },
    
    // 検索実行
    async search() {
        const query = document.getElementById('searchQuery').value.trim();
        const apiKeySelect = document.getElementById('apiKeySelect');
        const customApiKey = document.getElementById('apiKey');
        
        let apiKey = '';
        if (apiKeySelect.value === 'custom') {
            apiKey = customApiKey.value.trim();
        } else {
            apiKey = apiKeySelect.value;
        }
        
        const error = document.getElementById('error');
        const info = document.getElementById('info');
        const results = document.getElementById('results');
        
        error.style.display = 'none';
        info.style.display = 'none';
        results.innerHTML = '';
        
        if (!query) {
            UI.showError('検索キーワードまたはURLを入力してください');
            return;
        }
        
        // 検索履歴に追加
        Storage.addToHistory(query);
        
        // URLからビデオIDを抽出
        const videoId = API.extractVideoId(query);
        if (videoId) {
            Player.play(videoId, 'YouTube動画');
            return;
        }
        
        // 検索実行
        UI.showLoading(true);
        UI.showInfo('検索中...');
        
        // YouTube Data API を試行
        if (apiKey) {
            try {
                const items = await API.searchYouTube(query, apiKey);
                
                if (items.length > 0) {
                    UI.displayYouTubeResults(items);
                    UI.showLoading(false);
                    UI.showInfo('✅ YouTube Data API で検索しました');
                    return;
                }
            } catch (err) {
                console.error('YouTube Data API error:', err);
                // Invidiousにフォールバック
            }
        }
        
        // Invidious API を試行
        try {
            const items = await API.searchInvidious(query);
            UI.displayInvidiousResults(items);
            UI.showLoading(false);
            UI.showInfo('✅ Invidious で検索しました');
        } catch (err) {
            console.error('Invidious API error:', err);
            // 人気動画を表示
            UI.displayPopularVideos();
            UI.showLoading(false);
            UI.showInfo('⚠️ 検索APIが利用できないため、人気動画を表示しています');
        }
    }
};

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
