// ===== 仮想ファイルシステム構造 =====
const fileSystem = {
  "/": ["home", "var", "etc"],
  "/home": ["user"],
  "/home/user": ["Documents", "Pictures", "notes.txt"],
  "/home/user/Documents": ["project.txt", "todo.md"],
  "/home/user/Pictures": ["screenshot.png", "wallpaper.jpg"],
  "/var": ["log"],
  "/var/log": ["syslog", "kernel.log"],
  "/etc": ["config.sys", "hosts"],
};

let currentPath = "/home/user";

// ===== ディレクトリリスト表示 (ls) =====
function listDir(path, detailed = false) {
  const files = fileSystem[path] || [];
  if (detailed) {
    return files
      .map(f => `-rw-r--r--  1 user  user  1024  ${new Date().toLocaleDateString()}  ${f}`)
      .join("\n");
  }
  return files.join("  ");
}

// ===== カレントパス変更 (cd) =====
function changeDir(dir) {
  if (dir === "..") {
    if (currentPath === "/") return "/";
    currentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
  } else {
    const newPath = currentPath === "/" ? `/${dir}` : `${currentPath}/${dir}`;
    if (fileSystem[newPath]) {
      currentPath = newPath;
    } else {
      return `ディレクトリが存在しません: ${dir}`;
    }
  }
  return "";
}

function getCurrentPath() {
  return currentPath;
}

// ===== ファイル内容取得 (cat) =====
function readFile(path) {
  if (!path) return "使用法: cat <ファイル名>";

  const fullPath = path.startsWith("/") ? path : `${currentPath}/${path}`;
  const parts = fullPath.split("/");
  const fileName = parts.pop();
  const dirPath = parts.join("/") || "/";

  if (!fileSystem[dirPath] || !fileSystem[dirPath].includes(fileName)) {
    return `ファイルが見つかりません: ${path}`;
  }

  const examples = {
    "notes.txt": "これは仮想Linux環境のメモファイルです。\nいろいろなコマンドを試してみてください！",
    "project.txt": "Project Alpha — 開発中\n進捗: 72%\n次のタスク: バグ修正とUI改善。",
    "todo.md": "- 修正: dashboard export\n- 追加: AI音声通知\n- テスト: nettop安定化",
    "syslog": "[INFO] システム起動完了\n[INFO] 仮想マシン準備OK\n[WARN] メモリ使用率上昇 (73%)",
    "kernel.log": "[BOOT] Kernel version 5.15.0\n[INFO] CPU0 initialized\n[INFO] I/O subsystem loaded",
    "hosts": "127.0.0.1 localhost\n192.168.1.10 server.local",
    "config.sys": "# 仮想マシン設定\nvm_autostart=true\nvm_sound=enabled\n",
  };

  return examples[fileName] || `${fileName}: 空のファイルです。`;
}

// ===== ファイル作成 (touch) =====
function createFile(name) {
  if (!name) return "使用法: touch <ファイル名>";
  const files = fileSystem[currentPath] || [];
  if (files.includes(name)) return `${name}: すでに存在します。`;
  files.push(name);
  fileSystem[currentPath] = files;
  return `${name} を作成しました。`;
}

// ===== ディレクトリ作成 (mkdir) =====
function makeDir(name) {
  if (!name) return "使用法: mkdir <ディレクトリ名>";
  const newPath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
  if (fileSystem[newPath]) return "既に存在します。";
  (fileSystem[currentPath] || []).push(name);
  fileSystem[newPath] = [];
  return `${name} ディレクトリを作成しました。`;
}

// ===== ファイル削除 (rm) =====
function removeFile(name) {
  if (!name) return "使用法: rm <ファイル名>";
  const files = fileSystem[currentPath];
  if (!files || !files.includes(name)) return `${name}: 見つかりません。`;
  const index = files.indexOf(name);
  files.splice(index, 1);
  return `${name} を削除しました。`;
}

// ===== ルート構造を文字列表示 (tree) =====
function tree(path = "/", prefix = "") {
  const files = fileSystem[path] || [];
  let result = `${prefix}${path}\n`;
  files.forEach(f => {
    const subPath = path === "/" ? `/${f}` : `${path}/${f}`;
    if (fileSystem[subPath]) {
      result += tree(subPath, prefix + "  ");
    } else {
      result += `${prefix}  ${f}\n`;
    }
  });
  return result;
}

// ===== コマンド実行統合 =====
function handleFSCommand(cmd, args) {
  switch (cmd) {
    case "ls":
      return listDir(getCurrentPath(), args.includes("-l"));
    case "cd":
      return changeDir(args[0] || "/");
    case "cat":
      return readFile(args[0]);
    case "touch":
      return createFile(args[0]);
    case "mkdir":
      return makeDir(args[0]);
    case "rm":
      return removeFile(args[0]);
    case "tree":
      return tree();
    case "pwd":
      return getCurrentPath();
    default:
      return null;
  }
}
