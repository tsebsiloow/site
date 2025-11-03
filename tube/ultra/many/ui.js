// UI制御
const UI = {
    // エラー表示
    showError(message) {
        const error = document.getElementById('error');
        error.textContent = message;
        error.style.display = 'block';
        setTimeout(() => {
            error.style.display = 'none';
        }, 5000);
    },
    
    // 情報表示
    showInfo(message) {
        const info = document.getElementById('info');
        info.textContent = message;
        info.style.display = 'block';
        setTimeout(() => {
            info.style.display = 'none';
        }, 3000);
    },
    
    // ローディング表示
    showLoading(show = true) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'block' : 'none';
    },
    
    // デバッグメッセージ追加
    addDebug(msg) {
        STATE.debugMessages.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
        const debugLog = document.getElementById('debugLog');
        if (debugLog && debugLog.style.display === 'block') {
            debugLog.innerHTML = STATE.debugMessages.slice(-15).join('<br>');
        }
        console.log(msg);
    },
    
    // デバッグログ切り替え
    toggleDebugLog() {
        const debugLog = document.getElementById('debugLog');
        if (debugLog.style.display === 'none' || debugLog.style.display === '') {
            debugLog.style.display = 'block';
            debugLog.innerHTML = STATE.debugMessages.slice(-15).join('<br>');
            this.addDebug('🐛 デバッグログ表示ON');
        } else {
            debugLog.style.display = 'none';
            console.log('🐛 デバッグログ表示OFF');
        }
    },
    
    // 検索履歴表示
    showSearchHistory() {
        const historyDiv = document.getElementById('searchHistory');
        const history = Storage.loadHistory();
        
        if (history.length === 0) {
            historyDiv.style.display = 'none';
            return;
        }
        
        historyDiv.innerHTML = history.map((item, index) => `
            <div class="history-item" data-query="${this.escapeHtml(item)}">
                <span class="history-item-text">🕒 ${this.escapeHtml(item)}</span>
                <span class="history-item-delete" data-index="${index}">×</span>
            </div>
        `).join('');
        
        historyDiv.style.display = 'block';
    },
    
    // 検索履歴非表示
    hideSearchHistory() {
        document.getElementById('searchHistory').style.display = 'none';
    },
    
    // HTML エスケープ
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // 検索結果表示（YouTube Data API）
    displayYouTubeResults(items) {
        const results = document.getElementById('results');
        results.innerHTML = '';
        
        items.forEach(item => {
            const videoId = item.id.videoId;
            const card = this.createVideoCard(
                videoId,
                item.snippet.title,
                item.snippet.channelTitle,
                item.snippet.thumbnails.medium.url
            );
            results.appendChild(card);
        });
    },
    
    // 検索結果表示（Invidious）
    displayInvidiousResults(items) {
        const results = document.getElementById('results');
        results.innerHTML = '';
        
        items.slice(0, CONFIG.MAX_SEARCH_RESULTS).forEach(item => {
            if (!item.videoId) return;
            
            const card = this.createVideoCard(
                item.videoId,
                item.title || 'Untitled Video',
                item.author || 'Unknown Channel',
                `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`
            );
            results.appendChild(card);
        });
    },
    
    // 人気動画表示
    displayPopularVideos() {
        const results = document.getElementById('results');
        results.innerHTML = '';
        
        CONFIG.POPULAR_VIDEOS.forEach(video => {
            const card = this.createVideoCard(
                video.id,
                video.title,
                video.channel,
                `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`
            );
            results.appendChild(card);
        });
    },
    
    // 動画カード作成
    createVideoCard(videoId, title, channel, thumbnail) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.onclick = () => Player.play(videoId, title);
        
        card.innerHTML = `
            <img src="${thumbnail}" alt="${this.escapeHtml(title)}">
            <div class="video-info">
                <div class="video-title">${this.escapeHtml(title)}</div>
                <div class="video-channel">${this.escapeHtml(channel)}</div>
            </div>
        `;
        
        return card;
    },
    
    // テーマ切り替え
    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        body.classList.toggle('light-mode');
        
        if (body.classList.contains('light-mode')) {
            themeToggle.textContent = '☀️';
            Storage.saveTheme('light');
        } else {
            themeToggle.textContent = '🌙';
            Storage.saveTheme('dark');
        }
    },
    
    // テーマ読み込み
    loadTheme() {
        const theme = Storage.loadTheme();
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        
        if (theme === 'light') {
            body.classList.add('light-mode');
            themeToggle.textContent = '☀️';
        } else {
            body.classList.remove('light-mode');
            themeToggle.textContent = '🌙';
        }
    }
};
