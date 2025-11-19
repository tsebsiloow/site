<?php
// ==== 設定 ====
// 記録ファイル（同じフォルダに自動生成される）
$logFile = __DIR__ . '/ip_log.json';

// ==== IPの取得（プロキシ対策付き） ====
function getUserIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) return $_SERVER['HTTP_CLIENT_IP'];
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    return $_SERVER['REMOTE_ADDR'];
}
$ip = getUserIP();

// ==== 記録ファイル読み込み ====
if (!file_exists($logFile)) {
    file_put_contents($logFile, json_encode([]));
}
$log = json_decode(file_get_contents($logFile), true);

// ==== 新しいIPなら保存してカウント +1 ====
if (!in_array($ip, $log)) {
    $log[] = $ip;
    file_put_contents($logFile, json_encode($log, JSON_PRETTY_PRINT));
}

// ==== カウント ====
$count = count($log);

// ==== 表示 ====
?>
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>IP別ユニーク訪問者カウント</title>
    <style>
        body { font-family: system-ui, sans-serif; padding: 30px; }
        .num { font-size: 48px; font-weight: bold; color: #333; }
        .ip { color: #555; }
    </style>
</head>
<body>
    <h1>ユニーク訪問者数（IP別）</h1>
    <div class="num"><?= $count ?></div>

    <p class="ip">あなたのIP: <?= htmlspecialchars($ip) ?></p>
</body>
</html>
