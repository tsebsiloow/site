// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let players = {}; // {playerId: {x, y, hp, bullets: []}}

wss.on('connection', ws => {
  const id = Date.now() + Math.random(); // ユニークID
  players[id] = { x: Math.random()*700+50, y:300, hp:100, bullets:[] };

  ws.send(JSON.stringify({ type:'init', id, players }));

  ws.on('message', message => {
    const data = JSON.parse(message);

    if(data.type === 'update'){
      // サーバーでプレイヤー状態を更新
      if(players[id]){
        players[id] = { ...players[id], ...data.state };
      }

      // 全クライアントに同期
      wss.clients.forEach(client => {
        if(client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type:'sync', players }));
        }
      });
    }
  });

  ws.on('close', () => { delete players[id]; });
});

console.log("WebSocketサーバーがポート8080で起動中");
