let vmRunning = false;
let history = [];
let historyIndex = -1;
let currentUser = "";

const terminal = document.getElementById("terminal");
const vmState = document.getElementById("vmState");
const input = document.getElementById("commandInput");
const prompt = document.getElementById("prompt");
const usernameInput = document.getElementById("usernameInput");

// ===== ログイン機能 =====
function login() {
  const user = usernameInput.value.trim() || "user";
  currentUser = user;
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("vmInterface").style.display = "block";
  document.getElementById("currentUser").textContent = user;
  prompt.textContent = `${user}@ubuntu:${getCurrentPath()}$`;
}

// ===== ターミナル出力 =====
function appendTerminal(text) {
  terminal.textContent += "\n" + text;
  terminal.scrollTop = terminal.scrollHeight;
}

function setCommandEnabled(enabled) {
  input.disabled = !enabled;
}

// ===== 仮想マシン操作 =====
function startVM() {
  if (vmRunning) return appendTerminal("仮想マシンは既に起動しています。");
  vmRunning = true;
  vmState.textContent = "稼働中";
  vmState.style.color = "lime";
  setCommandEnabled(true);
  appendTerminal("仮想マシンを起動しました。");
}

function stopVM() {
  if (!vmRunning) return appendTerminal("仮想マシンは既に停止しています。");
  vmRunning = false;
  vmState.textContent = "停止中";
  vmState.style.color = "red";
  setCommandEnabled(false);
  appendTerminal("仮想マシンを停止しました。");
}

// ===== コマンド実行エンジン =====
function runCommand(command) {
  if (!vmRunning) {
    appendTerminal("仮想マシンが起動していません。`startvm`で起動してください。");
    return;
  }

  appendTerminal(`${currentUser}@ubuntu:${getCurrentPath()}$ ${command}`);
  if (!command.trim()) return;

  history.push(command);
  historyIndex = history.length;

  const parts = command.split(" ");
  const cmd = parts[0];
  const args = parts.slice(1);

  switch (cmd.toLowerCase()) {

    // ================================
    // 基本システム操作
    // ================================
    case "startvm":
      startVM();
      break;

    case "stopvm":
      stopVM();
      break;

    case "clear":
      terminal.textContent = "";
      break;

    // ================================
    // 仮想ログ・システムモニタ
    // ================================
    case "tail":
      if (args[0] !== "-f") {
        appendTerminal("使用法: tail -f <ファイル名>");
        break;
      }
      const file = args[1] || "/var/log/syslog";
      appendTerminal(`==> ${file} を監視中...（Ctrl+C で停止）`);

      if (window.tailInterval) clearInterval(window.tailInterval);
      window.tailInterval = setInterval(() => {
        const msgs = [
          "systemd[1]: Completed Daily Cleanup.",
          "kernel: CPU0: Core temperature normal.",
          "nginx: new connection from 192.168.1." + Math.floor(Math.random() * 255),
          "sshd: Accepted password for user from 10.0.0." + Math.floor(Math.random() * 255),
          "cron: Job 'backup' finished successfully.",
        ];
        appendTerminal(`${new Date().toLocaleTimeString()} ${msgs[Math.floor(Math.random() * msgs.length)]}`);
      }, 1500);
      break;

    case "live-log":
      if (args[0] === "start") {
        if (window.liveLogActive) return appendTerminal("ライブログはすでに実行中です。");
        appendTerminal("📡 ライブログモードを開始しました。");
        window.liveLogActive = true;
        window.liveLogInterval = setInterval(() => {
          const events = [
            "[INFO] nginx: 新しい接続を処理中...",
            "[INFO] sshd: ログイン試行 user=root",
            "[WARN] mysql: クエリ応答遅延 (120ms)",
            "[INFO] cron: バックアップ完了。",
            "[ERROR] kernel: I/O デバイスエラーが発生しました。",
          ];
          appendTerminal(`${new Date().toLocaleTimeString()} ${events[Math.floor(Math.random() * events.length)]}`);
        }, 1200);
      } else if (args[0] === "stop") {
        clearInterval(window.liveLogInterval);
        window.liveLogActive = false;
        appendTerminal("🛑 ライブログモードを停止しました。");
      } else {
        appendTerminal("使用法: live-log start | stop");
      }
      break;

    case "journalctl":
      if (args[0] === "-f") {
        appendTerminal("=== systemd ジャーナル (リアルタイム追跡) ===");
        if (window.journalFollow) clearInterval(window.journalFollow);
        window.journalFollow = setInterval(() => {
          const entries = [
            "systemd[1]: Starting ssh.service...",
            "systemd[1]: Starting nginx.service...",
            "systemd[1]: Reached target Multi-User System.",
            "kernel: USB device recognized.",
            "systemd[1]: Finished Daily Timer Trigger.",
          ];
          appendTerminal(`${new Date().toLocaleTimeString()} ${entries[Math.floor(Math.random() * entries.length)]}`);
        }, 1500);
      } else {
        appendTerminal("=== systemd ジャーナルログ ===");
        appendTerminal("[INFO] 起動ログを表示中...");
      }
      break;

    // ================================
    // ネットワーク監視
    // ================================
    case "nettop":
      if (args[0] === "stop") {
        clearInterval(window.nettopInterval);
        window.nettopActive = false;
        appendTerminal("🛑 ネットワーク監視を停止しました。");
        break;
      }
      appendTerminal("📡 ネットワーク接続を監視中...");
      window.nettopActive = true;
      window.nettopInterval = setInterval(() => {
        const connections = [
          { proto: "tcp", local: "192.168.1.10:443", remote: `93.184.216.${Math.floor(Math.random() * 255)}:80`, recv: (Math.random() * 100).toFixed(1), send: (Math.random() * 100).toFixed(1) },
          { proto: "udp", local: "192.168.1.10:53", remote: "8.8.8.8:53", recv: (Math.random() * 30).toFixed(1), send: (Math.random() * 30).toFixed(1) },
        ];
        let output = "Proto  Local Address           Remote Address          Recv(KB/s)  Send(KB/s)\n";
        output += "───────────────────────────────────────────────────────────────────────────────\n";
        connections.forEach(c => {
          output += `${c.proto.padEnd(6)} ${c.local.padEnd(24)} ${c.remote.padEnd(24)} ${c.recv.padStart(8)}     ${c.send.padStart(8)}\n`;
        });
        appendTerminal(output);
      }, 2000);
      break;

    // ================================
    // speedgraph (グラフ)
    // ================================
    case "speedgraph":
      const mode = args[0] || "once";
      const oldCanvas = document.getElementById("speedCanvas");
      if (oldCanvas) oldCanvas.remove();

      const canvas = document.createElement("canvas");
      canvas.id = "speedCanvas";
      canvas.width = 800;
      canvas.height = 200;
      canvas.style.display = "block";
      canvas.style.marginTop = "10px";
      canvas.style.background = "#111";
      canvas.style.border = "1px solid #444";
      terminal.appendChild(canvas);

      const ctx = canvas.getContext("2d");
      function drawGraph(data, label) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.strokeStyle = "#00ff90";
        ctx.lineWidth = 2;
        data.forEach((val, i) => {
          const x = (i / data.length) * canvas.width;
          const y = canvas.height - (val / 120) * canvas.height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.fillStyle = "#00ff90";
        ctx.fillText(label, 10, 15);
      }

      if (mode === "once") {
        const data = Array.from({ length: 50 }, () => Math.random() * 100);
        drawGraph(data, "SpeedGraph (static)");
        appendTerminal("📊 仮想速度グラフを描画しました。");
        break;
      }
      if (mode === "live") {
        appendTerminal("📡 リアルタイム帯域速度グラフを開始しました。");
        window.speedGraphActive = true;
        const liveData = Array(50).fill(0);
        window.speedGraphInterval = setInterval(() => {
          liveData.push(Math.random() * 100);
          liveData.shift();
          drawGraph(liveData, "SpeedGraph (live)");
        }, 500);
        break;
      }
      if (mode === "stop") {
        clearInterval(window.speedGraphInterval);
        window.speedGraphActive = false;
        appendTerminal("🛑 リアルタイム帯域速度グラフを停止しました。");
        break;
      }
      appendTerminal("使用法: speedgraph once | live | stop");
      break;

    // ================================
    // 通知システム
    // ================================
    case "notify":
      const type = args[0] || "info";
      const message = args.slice(1).join(" ") || "通知メッセージ";
      showNotification(type.toUpperCase(), message);
      appendTerminal(`🔔 通知送信: [${type}] ${message}`);
      break;

    // ================================
    // ダッシュボード
    // ================================
    case "dashboard":
      const modeDash = args[0] || "start";
      if (modeDash === "stop") {
        clearInterval(window.dashboardInterval);
        window.dashboardActive = false;
        const dash = document.getElementById("dashboard");
        if (dash) dash.remove();
        appendTerminal("🛑 ダッシュボードを停止しました。");
        break;
      }

      appendTerminal("📈 サーバーダッシュボードを起動しました。");
      const dashboard = document.createElement("div");
      dashboard.id = "dashboard";
      dashboard.style.padding = "10px";
      dashboard.style.background = "#111";
      dashboard.style.border = "1px solid #555";
      dashboard.style.borderRadius = "8px";
      dashboard.innerHTML = `
        <h3 style="color:#00ff90;">🖥 仮想サーバーダッシュボード</h3>
        <div>CPU使用率: <span id="cpuValue">0%</span></div>
        <div>メモリ使用率: <span id="memValue">0%</span></div>
        <div>CPU温度: <span id="tempValue">0°C</span></div>
        <div>ネットワーク: ↓ <span id="downValue">0</span> Mbps ↑ <span id="upValue">0</span> Mbps</div>
        <canvas id="cpuCanvas" width="800" height="150" style="background:#000;margin-top:10px;border:1px solid #333;"></canvas>
      `;
      terminal.appendChild(dashboard);

      const cpuCtx = document.getElementById("cpuCanvas").getContext("2d");
      const cpuData = Array(60).fill(0);

      window.dashboardInterval = setInterval(() => {
        const cpu = (Math.random() * 100).toFixed(1);
        const mem = (Math.random() * 100).toFixed(1);
        const temp = (Math.random() * 40 + 40).toFixed(1);
        const down = (Math.random() * 90 + 10).toFixed(1);
        const up = (Math.random() * 40 + 5).toFixed(1);
        document.getElementById("cpuValue").textContent = `${cpu}%`;
        document.getElementById("memValue").textContent = `${mem}%`;
        document.getElementById("tempValue").textContent = `${temp}°C`;
        document.getElementById("downValue").textContent = down;
        document.getElementById("upValue").textContent = up;

        if (parseFloat(temp) > 75 && Math.random() < 0.3) {
          showNotification("WARNING", `CPU温度が高すぎます (${temp}°C)`);
          playSound("warning");
        }

        cpuData.push(parseFloat(cpu));
        cpuData.shift();
        cpuCtx.clearRect(0, 0, 800, 150);
        cpuCtx.beginPath();
        cpuCtx.strokeStyle = "#00ff90";
        cpuCtx.lineWidth = 2;
        cpuData.forEach((v, i) => {
          const x = (i / cpuData.length) * 800;
          const y = 150 - (v / 100) * 150;
          if (i === 0) cpuCtx.moveTo(x, y);
          else cpuCtx.lineTo(x, y);
        });
        cpuCtx.stroke();
        cpuCtx.fillStyle = "#00ff90";
        cpuCtx.fillText(`CPU: ${cpu}%`, 10, 15);
      }, 1000);
      window.dashboardActive = true;
      break;

    // ================================
    // export (画像出力)
    // ================================
    case "export":
      const target = args[0];
      function saveCanvas(canvasId, filename) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return false;
        const link = document.createElement("a");
        link.download = filename;
        link.href = canvas.toDataURL("image/png");
        link.click();
        appendTerminal(`📸 '${filename}' を保存しました。`);
        return true;
      }
      if (target === "dashboard") saveCanvas("cpuCanvas", "dashboard_snapshot.png");
      else if (target === "graph") saveCanvas("speedCanvas", "speedgraph_snapshot.png");
      else if (target === "all") {
        saveCanvas("cpuCanvas", "dashboard_snapshot.png");
        saveCanvas("speedCanvas", "speedgraph_snapshot.png");
      } else appendTerminal("使用法: export dashboard | graph | all");
      break;

    default:
      appendTerminal(`コマンドが見つかりません: ${cmd}`);
  }
}

// ===== サウンド＆通知システム =====
const sounds = {
  info: new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg"),
  warning: new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg"),
  error: new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg"),
};

function showNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") new Notification(title, { body });
    });
  }
  playSound(title.toLowerCase());
}

function playSound(type) {
  try {
    if (sounds[type]) sounds[type].play();
  } catch (e) {
    console.warn("音声再生失敗:", e);
  }
}

// ===== 自動イベント通知 =====
setInterval(() => {
  if (!vmRunning) return;
  const chance = Math.random();
  if (chance < 0.03) {
    const eventType = ["info", "warning", "error"][Math.floor(Math.random() * 3)];
    const messages = {
      info: "バックアップ完了",
      warning: "CPU温度上昇中 (75°C)",
      error: "ネットワーク不安定",
    };
    showNotification(eventType.toUpperCase(), messages[eventType]);
    appendTerminal(`🔔 [${eventType}] ${messages[eventType]}`);
  }
}, 5000);
