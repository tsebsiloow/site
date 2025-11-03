// プレイヤー制御
const Player = {
    // 動画を再生
    play(videoId, title) {
        STATE.currentVideoId = videoId;
        STATE.currentVideoTitle = title;
        STATE.availableStreams = [];
        STATE.debugMessages = [];
        STATE.currentQuality = null;
        
        UI.addDebug(`🎬 動画ID: ${videoId}`);
        UI.addDebug(`📝 タイトル: ${title}`);
        
        // プレイヤーセクションを表示
        const playerSection = document.getElementById('playerSection');
        playerSection.style.display = 'block';
        
        // タイトル表示
        const currentVideo = document.getElementById('currentVideo');
        currentVideo.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${title}</span>
                <button onclick="Player.share()" style="padding: 8px 15px; font-size: 14px; background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);">
                    🔗 共有
                </button>
            </div>
        `;
        
        // 埋め込みプレイヤーを作成
        this.createEmbedPlayer(videoId);
        
        // ストリーム情報を取得
        this.fetchStreams(videoId);
        
        // スクロール
        playerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    
    // 埋め込みプレイヤー作成
    createEmbedPlayer(videoId) {
        const playerContainer = document.getElementById('playerContainer');
        playerContainer.innerHTML = `
            <iframe id="player" width="100%" height="100%" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
            <div class="stats-overlay" id="statsOverlay"></div>
        `;
        
        const streamUrl = document.getElementById('streamUrl');
        streamUrl.textContent = `埋め込み再生中 | https://www.youtube.com/watch?v=${videoId}`;
        
        UI.addDebug('✅ 埋め込みプレーヤー作成完了');
    },
    
    // ストリーム情報取得
    async fetchStreams(videoId) {
        const btnStream = document.getElementById('btnStream');
        btnStream.disabled = true;
        btnStream.textContent = '🎬 取得中...';
        
        UI.addDebug('🔍 ストリーム情報の取得を開始...');
        
        try {
            const streams = await API.fetchStreamUrls(videoId);
            
            if (streams.length > 0) {
                STATE.availableStreams = streams;
                btnStream.disabled = false;
                btnStream.textContent = '🎬 ストリーム再生';
                UI.addDebug(`✅ ${streams.length}個のストリームを取得成功！`);
                UI.showInfo('ストリーム再生が利用可能です');
                
                // 自動的にストリーム再生に切り替え
                this.setMode('stream');
            } else {
                btnStream.disabled = true;
                btnStream.textContent = '🎬 利用不可';
                UI.addDebug('❌ ストリーム取得失敗');
            }
        } catch (error) {
            UI.addDebug(`❌ エラー: ${error.message}`);
            btnStream.disabled = true;
            btnStream.textContent = '🎬 エラー';
        }
    },
    
    // 再生モード設定
    setMode(mode) {
        if (!STATE.currentVideoId) return;
        
        STATE.currentPlayMode = mode;
        const playerContainer = document.getElementById('playerContainer');
        const streamUrl = document.getElementById('streamUrl');
        const qualityControls = document.getElementById('qualityControls');
        
        streamUrl.textContent = '';
        qualityControls.style.display = 'none';
        
        if (mode === 'stream') {
            if (STATE.availableStreams.length === 0) {
                UI.showError('ストリーム情報が取得できていません');
                return;
            }
            
            playerContainer.innerHTML = `
                <video id="player" controls autoplay style="width:100%;height:100%;"></video>
                <div class="stats-overlay" id="statsOverlay"></div>
            `;
            
            qualityControls.style.display = 'grid';
            this.createQualityButtons();
            this.playBestQuality();
            
            setTimeout(() => this.applyLoop(), 100);
            return;
        }
        
        // 埋め込みモード
        let embedUrl = '';
        
        if (mode === 'embed') {
            embedUrl = `https://www.youtube.com/embed/${STATE.currentVideoId}?autoplay=1`;
            if (STATE.isLoopEnabled) {
                embedUrl += `&loop=1&playlist=${STATE.currentVideoId}`;
            }
            streamUrl.textContent = `埋め込み再生 | https://www.youtube.com/watch?v=${STATE.currentVideoId}`;
        } else if (mode === 'nocookie') {
            embedUrl = `https://www.youtube-nocookie.com/embed/${STATE.currentVideoId}?autoplay=1`;
            if (STATE.isLoopEnabled) {
                embedUrl += `&loop=1&playlist=${STATE.currentVideoId}`;
            }
            streamUrl.textContent = 'No Cookie埋め込み';
        }
        
        playerContainer.innerHTML = `
            <iframe id="player" width="100%" height="100%" 
                src="${embedUrl}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
            <div class="stats-overlay" id="statsOverlay"></div>
        `;
    },
    
    // 画質ボタン作成
    createQualityButtons() {
        const qualityControls = document.getElementById('qualityControls');
        qualityControls.innerHTML = '';
        
        // 音声付きストリームを優先
        const audioStreams = STATE.availableStreams.filter(s => s.hasAudio && !s.isAudioOnly);
        const sortableStreams = audioStreams.length > 0 ? audioStreams : STATE.availableStreams.filter(s => !s.isAudioOnly);
        
        // 画質でグループ化
        const qualityMap = new Map();
        sortableStreams.forEach(stream => {
            const quality = String(stream.quality);
            if (!qualityMap.has(quality)) {
                qualityMap.set(quality, stream);
            }
        });
        
        // 画質でソート（高画質順）
        const sortedQualities = Array.from(qualityMap.entries()).sort((a, b) => {
            const getQualityValue = (q) => {
                const match = q.match(/(\d+)/);
                return match ? parseInt(match[1]) : 0;
            };
            return getQualityValue(b[0]) - getQualityValue(a[0]);
        });
        
        // ボタン作成
        sortedQualities.forEach(([quality, stream], index) => {
            const button = document.createElement('button');
            button.textContent = `${quality} ${stream.hasAudio ? '🔊' : '🔇'}`;
            button.onclick = () => this.changeQuality(index);
            qualityControls.appendChild(button);
        });
    },
    
    // 最高画質で再生
    playBestQuality() {
        this.changeQuality(0);
    },
    
    // 画質変更
    changeQuality(index) {
        const audioStreams = STATE.availableStreams.filter(s => s.hasAudio && !s.isAudioOnly);
        const sortableStreams = audioStreams.length > 0 ? audioStreams : STATE.availableStreams.filter(s => !s.isAudioOnly);
        
        const qualityMap = new Map();
        sortableStreams.forEach(stream => {
            const quality = String(stream.quality);
            if (!qualityMap.has(quality)) {
                qualityMap.set(quality, stream);
            }
        });
        
        const sortedQualities = Array.from(qualityMap.entries()).sort((a, b) => {
            const getQualityValue = (q) => {
                const match = q.match(/(\d+)/);
                return match ? parseInt(match[1]) : 0;
            };
            return getQualityValue(b[0]) - getQualityValue(a[0]);
        });
        
        if (index >= sortedQualities.length) return;
        
        const [quality, selectedStream] = sortedQualities[index];
        STATE.currentQuality = quality;
        
        // ボタンのアクティブ状態更新
        const qualityControls = document.getElementById('qualityControls');
        const buttons = qualityControls.querySelectorAll('button');
        buttons.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
        
        this.playStream(selectedStream);
    },
    
    // ストリーム再生
    playStream(stream) {
        const player = document.getElementById('player');
        const streamUrl = document.getElementById('streamUrl');
        
        if (!stream || !stream.url) {
            UI.showError('ストリームの読み込みに失敗しました');
            return;
        }
        
        player.src = stream.url;
        player.play().catch(() => {
            UI.showError('ストリームの再生に失敗しました');
        });
        
        streamUrl.textContent = `画質: ${stream.quality} | ${stream.type} ${stream.hasAudio ? '🔊' : '🔇'}`;
    },
    
    // リピート切り替え
    toggleLoop() {
        STATE.isLoopEnabled = !STATE.isLoopEnabled;
        const btnLoop = document.getElementById('btnLoop');
        
        if (STATE.isLoopEnabled) {
            btnLoop.textContent = '🔁 リピート: ON';
            btnLoop.style.background = 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
        } else {
            btnLoop.textContent = '🔁 リピート: OFF';
            btnLoop.style.background = 'linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%)';
        }
        
        this.applyLoop();
        UI.showInfo(`リピート再生を${STATE.isLoopEnabled ? 'ON' : 'OFF'}にしました`);
    },
    
    // リピート適用
    applyLoop() {
        const player = document.getElementById('player');
        
        if (STATE.currentPlayMode === 'stream') {
            if (player && player.tagName === 'VIDEO') {
                player.loop = STATE.isLoopEnabled;
            }
        } else {
            if (player && player.tagName === 'IFRAME' && STATE.currentVideoId) {
                const currentSrc = player.src;
                let newSrc = currentSrc.replace(/[&?]loop=\d+/, '').replace(/[&?]playlist=[^&]+/, '');
                
                if (STATE.isLoopEnabled) {
                    const separator = newSrc.includes('?') ? '&' : '?';
                    newSrc += `${separator}loop=1&playlist=${STATE.currentVideoId}`;
                }
                
                player.src = newSrc;
            }
        }
    },
    
    // 再生速度変更
    setSpeed(speed) {
        const player = document.getElementById('player');
        
        if (player && player.tagName === 'VIDEO') {
            player.playbackRate = speed;
            UI.showInfo(`再生速度を${speed}xに変更しました`);
        } else {
            UI.showError('再生速度の変更はストリーム再生でのみ利用可能です');
        }
    },
    
    // PiP切り替え
    async togglePiP() {
        const player = document.getElementById('player');
        
        if (player && player.tagName === 'VIDEO') {
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else {
                    await player.requestPictureInPicture();
                    UI.showInfo('ピクチャーインピクチャーを開始しました');
                }
            } catch (err) {
                UI.showError('ピクチャーインピクチャーに失敗しました');
            }
        } else {
            UI.showError('PiPはストリーム再生でのみ利用可能です');
        }
    },
    
    // 全画面切り替え
    toggleFullscreen() {
        const container = document.getElementById('playerContainer');
        
        try {
            if (!document.fullscreenElement) {
                container.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        } catch (err) {
            UI.showError('全画面表示に失敗しました');
        }
    },
    
    // 統計表示切り替え
    toggleStats() {
        const statsOverlay = document.getElementById('statsOverlay');
        const player = document.getElementById('player');
        
        if (statsOverlay.style.display === 'block') {
            statsOverlay.style.display = 'none';
            if (STATE.statsInterval) {
                clearInterval(STATE.statsInterval);
                STATE.statsInterval = null;
            }
        } else {
            if (player && player.tagName === 'VIDEO') {
                statsOverlay.style.display = 'block';
                this.updateStats();
                STATE.statsInterval = setInterval(() => this.updateStats(), 1000);
            } else {
                UI.showError('統計表示はストリーム再生でのみ利用可能です');
            }
        }
    },
    
    // 統計更新
    updateStats() {
        const player = document.getElementById('player');
        const statsOverlay = document.getElementById('statsOverlay');
        
        if (player && player.tagName === 'VIDEO') {
            const currentTime = this.formatTime(player.currentTime);
            const duration = this.formatTime(player.duration);
            const buffered = player.buffered.length > 0 ?
                ((player.buffered.end(player.buffered.length - 1) / player.duration) * 100).toFixed(1) : '0';
            
            statsOverlay.innerHTML = `
                <div>再生時間: ${currentTime} / ${duration}</div>
                <div>速度: ${player.playbackRate}x</div>
                <div>バッファ: ${buffered}%</div>
                <div>音量: ${Math.round(player.volume * 100)}%</div>
                <div>画質: ${STATE.currentQuality || 'auto'}</div>
            `;
        }
    },
    
    // 時間フォーマット
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    // 共有
    share() {
        if (!STATE.currentVideoId) return;
        
        const shareUrl = `https://www.youtube.com/watch?v=${STATE.currentVideoId}`;
        const shareText = `${STATE.currentVideoTitle}\n${shareUrl}`;
        
        if (navigator.share) {
            navigator.share({
                title: STATE.currentVideoTitle,
                text: shareText,
                url: shareUrl
            }).catch(() => {
                this.copyToClipboard(shareUrl);
            });
        } else {
            this.copyToClipboard(shareUrl);
        }
    },
    
    // クリップボードにコピー
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            UI.showInfo('URLをクリップボードにコピーしました');
        }).catch(() => {
            UI.showError('コピーに失敗しました');
        });
    },
    
    // ダウンロード
    async download(type) {
        if (!STATE.currentVideoId) {
            UI.showError('動画が選択されていません');
            return;
        }
        
        const progressDiv = document.getElementById('downloadProgress');
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        const btnVideo = document.getElementById('btnDownloadVideo');
        const btnAudio = document.getElementById('btnDownloadAudio');
        
        btnVideo.disabled = true;
        btnAudio.disabled = true;
        progressDiv.style.display = 'block';
        progressText.textContent = type === 'audio' ? '🎵 MP3ダウンロード準備中...' : '📥 動画ダウンロード準備中...';
        progressFill.style.width = '0%';
        
        try {
            let streamToUse = null;
            
            if (type === 'audio') {
                streamToUse = STATE.availableStreams.find(s => s.isAudioOnly) ||
                              STATE.availableStreams.find(s => s.hasAudio);
                
                if (!streamToUse && STATE.availableStreams.length === 0) {
                    progressText.textContent = '🔍 音声ストリームを検索中...';
                    progressFill.style.width = '20%';
                    const streams = await API.fetchStreamUrls(STATE.currentVideoId);
                    
                    if (streams.length > 0) {
                        STATE.availableStreams = streams;
                        streamToUse = streams.find(s => s.isAudioOnly) || streams.find(s => s.hasAudio);
                    }
                }
            } else {
                streamToUse = STATE.availableStreams.find(s => s.hasAudio && !s.isAudioOnly);
                
                if (!streamToUse && STATE.availableStreams.length === 0) {
                    progressText.textContent = '🔍 動画ストリームを検索中...';
                    progressFill.style.width = '20%';
                    const streams = await API.fetchStreamUrls(STATE.currentVideoId);
                    
                    if (streams.length > 0) {
                        STATE.availableStreams = streams;
                        streamToUse = streams.find(s => s.hasAudio && !s.isAudioOnly) || streams[0];
                    }
                }
            }
            
            if (streamToUse) {
                progressFill.style.width = '40%';
                progressText.textContent = type === 'audio' ? '🎵 MP3ダウンロード開始...' : '📥 動画ダウンロード開始...';
                progressFill.style.width = '60%';
                
                const sanitizedTitle = STATE.currentVideoTitle.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);
                const fileName = type === 'audio'
                    ? `${sanitizedTitle}_${STATE.currentVideoId}.mp3`
                    : `${sanitizedTitle}_${STATE.currentVideoId}.mp4`;
                
                const a = document.createElement('a');
                a.href = streamToUse.url;
                a.download = fileName;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                progressFill.style.width = '100%';
                progressText.textContent = type === 'audio'
                    ? '✅ MP3ダウンロードを開始しました！'
                    : '✅ 動画ダウンロードを開始しました！';
                
                UI.showInfo(type === 'audio' ? 'MP3のダウンロードを開始しました' : '動画のダウンロードを開始しました');
                
                setTimeout(() => {
                    progressDiv.style.display = 'none';
                }, 3000);
            } else {
                throw new Error('ダウンロードURLの取得に失敗しました');
            }
        } catch (err) {
            progressText.textContent = '❌ ダウンロードに失敗しました';
            progressFill.style.width = '0%';
            UI.showError('ダウンロードに失敗しました');
            
            setTimeout(() => {
                progressDiv.style.display = 'none';
            }, 3000);
        } finally {
            btnVideo.disabled = false;
            btnAudio.disabled = false;
        }
    }
};
