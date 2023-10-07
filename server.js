const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const port = 3000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Указываем корневую директорию для статических файлов
app.use(express.static(__dirname)); // Используем __dirname для текущей директории сервера

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});

server.listen(port, function() {
  console.log(`Server is listening on ${port}!`);
});
