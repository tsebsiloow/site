// 定数とグローバル設定
const CONFIG = {
    MAX_HISTORY: 5,
    SEARCH_TIMEOUT: 15000,
    STREAM_TIMEOUT: 8000,
    MAX_SEARCH_RESULTS: 12,
    
    // Invidious サーバー
    INVIDIOUS_SERVERS: [
        'https://inv.perditum.com',
        'https://yewtu.be',
        'https://invidious.nerdvpn.de',
        'https://vid.puffyan.us'
    ],
    
    // 人気動画（API失敗時のフォールバック）
    POPULAR_VIDEOS: [
        { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', channel: 'Rick Astley' },
        { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', channel: 'Luis Fonsi' },
        { id: 'JGwWNGJdvx8', title: 'Ed Sheeran - Shape of You', channel: 'Ed Sheeran' },
        { id: 'OPf0YbXqDm0', title: 'Mark Ronson - Uptown Funk ft. Bruno Mars', channel: 'Mark Ronson' },
        { id: 'CevxZvSJLk8', title: 'Katy Perry - Roar', channel: 'Katy Perry' }
    ]
};

// アプリケーション状態
const STATE = {
    currentVideoId: null,
    currentVideoTitle: '',
    availableStreams: [],
    currentPlayMode: 'embed',
    currentQuality: null,
    isLoopEnabled: false,
    debugMessages: [],
    statsInterval: null
};
