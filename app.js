(function() {
    const sendBtn = document.querySelector('#send');
    const sendImageBtn = document.querySelector('#sendImage'); // Новая кнопка для отправки изображений
    const messages = document.querySelector('#messages');
    const messageBox = document.querySelector('#messageBox');
    const userNameInput = document.querySelector('#userName');
    const imageInput = document.querySelector('#imageInput'); // Новое поле для выбора изображения

    let ws;
    let userName = 'Anonymous';

    function showMessage(message, author) {
        messages.innerHTML += `<div><strong>${author}:</strong> ${message}</div>`;
        messages.scrollTop = messages.scrollHeight;
        messageBox.value = '';
    }

    async function init() {
        try {
            if (ws) {
                ws.onerror = ws.onopen = ws.onclose = null;
                ws.close();
            }

            ws = new WebSocket('ws://localhost:3000');
            ws.onopen = () => {
                console.log('Connection opened!');
                ws.send(JSON.stringify({ type: 'name', data: userName }));
            }
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'message') {
                    showMessage(data.data, data.author);
                } else if (data.type === 'image') { // Обработка полученных изображений
                    showMessage(`<img src="${data.data}" alt="Image from ${data.author}" />`, data.author);
                }
            };
            ws.onclose = function() {
                ws = null;
            }
        } catch (error) {
            console.error('WebSocket initialization error:', error);
        }
    }

    sendBtn.onclick = function() {
        if (!ws) {
            showMessage("No WebSocket connection :(", userName);
            return;
        }

        const message = messageBox.value;
        if (!message) return;

        ws.send(JSON.stringify({ type: 'message', data: message, author: userName }));
        showMessage(message, userName);
    }

    // Обработчик для отправки изображений
    sendImageBtn.onclick = function() {
        if (!ws) {
            showMessage("No WebSocket connection :(", userName);
            return;
        }

        const file = imageInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target.result;
            ws.send(JSON.stringify({ type: 'image', data: imageData, author: userName }));
            showMessage(`<img src="${imageData}" alt="Image from ${userName}" />`, userName);
        };
        reader.readAsDataURL(file);
    }

    userNameInput.addEventListener('input', function() {
        userName = this.value || 'Anonymous';
    });

    init();
})();

