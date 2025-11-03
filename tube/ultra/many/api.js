// API通信関連
const API = {
    // YouTube Data API で検索
    async searchYouTube(query, apiKey) {
        if (!apiKey) {
            throw new Error('APIキーが必要です');
        }
        
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${CONFIG.MAX_SEARCH_RESULTS}&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
        
        try {
            const response = await fetch(url, {
                signal: AbortSignal.timeout(CONFIG.SEARCH_TIMEOUT)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message || 'API error');
            }
            
            return data.items || [];
        } catch (error) {
            console.error('YouTube API error:', error);
            throw error;
        }
    },
    
    // Invidious API で検索
    async searchInvidious(query) {
        for (const server of CONFIG.INVIDIOUS_SERVERS) {
            try {
                const url = `${server}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
                
                const response = await fetch(url, {
                    signal: AbortSignal.timeout(CONFIG.STREAM_TIMEOUT)
                });
                
                if (!response.ok) continue;
                
                const data = await response.json();
                
                if (data && Array.isArray(data) && data.length > 0) {
                    return data.slice(0, CONFIG.MAX_SEARCH_RESULTS);
                }
            } catch (error) {
                console.error(`Invidious server ${server} error:`, error);
                continue;
            }
        }
        
        throw new Error('全てのInvidiousサーバーで検索に失敗しました');
    },
    
    // ストリームURL取得
    async fetchStreamUrls(videoId) {
        for (const server of CONFIG.INVIDIOUS_SERVERS) {
            try {
                const url = `${server}/api/v1/videos/${videoId}`;
                
                const response = await fetch(url, {
                    signal: AbortSignal.timeout(CONFIG.STREAM_TIMEOUT)
                });
                
                if (!response.ok) continue;
                
                const data = await response.json();
                const streams = this.parseInvidiousStreams(data);
                
                if (streams.length > 0) {
                    return streams;
                }
            } catch (error) {
                console.error(`Stream fetch error from ${server}:`, error);
                continue;
            }
        }
        
        return [];
    },
    
    // Invidiousストリームのパース
    parseInvidiousStreams(data) {
        const streams = [];
        
        // 通常のフォーマット（音声付き）
        if (data.formatStreams && Array.isArray(data.formatStreams)) {
            data.formatStreams.forEach(s => {
                if (s.url) {
                    streams.push({
                        url: s.url,
                        quality: s.qualityLabel || s.quality || 'auto',
                        type: 'Invidious',
                        hasAudio: true,
                        isAudioOnly: false
                    });
                }
            });
        }
        
        // アダプティブフォーマット
        if (data.adaptiveFormats && Array.isArray(data.adaptiveFormats)) {
            data.adaptiveFormats.forEach(s => {
                if (s.url) {
                    const isAudio = s.type && s.type.includes('audio');
                    
                    streams.push({
                        url: s.url,
                        quality: isAudio ? 'audio' : (s.qualityLabel || 'auto'),
                        type: 'Invidious',
                        hasAudio: isAudio,
                        isAudioOnly: isAudio
                    });
                }
            });
        }
        
        return streams;
    },
    
    // URLからビデオIDを抽出
    extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
            /youtube\.com\/embed\/([^&\s]+)/,
            /youtube\.com\/v\/([^&\s]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }
};
