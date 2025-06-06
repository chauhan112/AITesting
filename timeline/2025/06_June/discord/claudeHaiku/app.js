document.addEventListener("DOMContentLoaded", () => {
    const messagesContainer = document.getElementById("messagesContainer");
    const messageInput = document.getElementById("messageInput");
    const sendMessageBtn = document.getElementById("sendMessageBtn");
    const channelItems = document.querySelectorAll(".channel-item");
    const currentChannelName = document.getElementById("currentChannelName");

    // Sample messages
    const messages = {
        general: [
            { user: "John", text: "Hello everyone!" },
            { user: "Alice", text: "Welcome to the Outlier community!" },
        ],
        random: [{ user: "Bob", text: "Did you see the latest AI news?" }],
    };

    // Function to render messages
    function renderMessages(channel) {
        messagesContainer.innerHTML = "";
        messages[channel].forEach((msg) => {
            const messageElement = document.createElement("div");
            messageElement.classList.add(
                "message",
                "flex",
                "items-start",
                "space-x-2"
            );
            messageElement.innerHTML = `
                <div class="user-avatar bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
                    ${msg.user[0]}
                </div>
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="font-bold">${msg.user}</span>
                        <span class="text-xs text-gray-400">${new Date().toLocaleTimeString()}</span>
                    </div>
                    <p class="text-white">${msg.text}</p>
                </div>
            `;
            messagesContainer.appendChild(messageElement);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Switch channels
    channelItems.forEach((item) => {
        item.addEventListener("click", () => {
            const channel = item.dataset.channel;
            currentChannelName.textContent = channel;
            renderMessages(channel);
        });
    });

    // Send message
    sendMessageBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText) {
            const currentChannel = currentChannelName.textContent;
            messages[currentChannel].push({
                user: "You",
                text: messageText,
            });
            renderMessages(currentChannel);
            messageInput.value = "";
        }
    }

    // Initial render
    renderMessages("general");
});
