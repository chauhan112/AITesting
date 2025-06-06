document.addEventListener("DOMContentLoaded", () => {
    const messagesContainer = document.getElementById("messages-container");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    const channelLinks = document.querySelectorAll(".channel-link");
    const channelNameDisplay = document.getElementById("channel-name-display");
    const channelTopicDisplay = document.getElementById(
        "channel-topic-display"
    );
    const messageInputPlaceholder = document.querySelector("#message-input");

    let currentChannelName = "general"; // Default channel

    // --- Utility Functions ---
    function getCurrentTime() {
        return new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function createMessageElement(
        username,
        avatarText,
        messageText,
        time,
        userColor = "text-blue-400"
    ) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add(
            "flex",
            "items-start",
            "hover:bg-gray-650",
            "px-2",
            "py-0.5",
            "rounded"
        ); // Slight hover effect

        const avatar = document.createElement("img");
        avatar.src = `https://via.placeholder.com/40/7289DA/FFFFFF?Text=${avatarText}`;
        avatar.alt = `${username} Avatar`;
        avatar.classList.add("w-10", "h-10", "rounded-full", "mr-3", "mt-1");

        const contentDiv = document.createElement("div");

        const headerDiv = document.createElement("div");
        headerDiv.classList.add("flex", "items-baseline");

        const nameSpan = document.createElement("span");
        nameSpan.classList.add("font-semibold", userColor, "mr-2");
        nameSpan.textContent = username;

        const timeSpan = document.createElement("span");
        timeSpan.classList.add("text-xs", "text-gray-400");
        timeSpan.textContent = time;

        headerDiv.appendChild(nameSpan);
        headerDiv.appendChild(timeSpan);

        const messageP = document.createElement("p");
        messageP.classList.add("text-gray-200");
        // Basic link and mention highlighting (very rudimentary)
        messageP.innerHTML = messageText
            .replace(
                /(@\w+)/g,
                '<span class="text-blue-400 font-semibold bg-blue-900 bg-opacity-50 px-1 rounded">$1</span>'
            )
            .replace(
                /(#\w+)/g,
                '<span class="text-blue-400 font-semibold cursor-pointer hover:underline">$1</span>'
            )
            .replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" class="text-blue-400 hover:underline">$1</a>'
            );

        contentDiv.appendChild(headerDiv);
        contentDiv.appendChild(messageP);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);

        return messageDiv;
    }

    function addMessageToChat(username, avatarText, messageText, userColor) {
        if (messageText.trim() === "") return;

        const time = getCurrentTime();
        const messageElement = createMessageElement(
            username,
            avatarText,
            messageText,
            time,
            userColor
        );
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
    }

    // --- Event Listeners ---
    function handleSendMessage() {
        const messageText = messageInput.value;
        addMessageToChat("User123", "U", messageText); // Hardcoded user for now
        messageInput.value = ""; // Clear input
        messageInput.focus();
    }

    sendButton.addEventListener("click", handleSendMessage);
    messageInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // Prevent new line on Enter
            handleSendMessage();
        }
    });

    channelLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const newChannelName = link.dataset.channelName;
            const newChannelTopic = link.dataset.channelTopic;

            if (newChannelName === currentChannelName) return; // Do nothing if same channel

            currentChannelName = newChannelName;
            channelNameDisplay.textContent = currentChannelName;
            channelTopicDisplay.textContent = newChannelTopic;
            messageInputPlaceholder.placeholder = `Message #${currentChannelName}`;

            // Clear existing messages
            messagesContainer.innerHTML = "";

            // Add a welcome message for the new channel
            addMessageToChat(
                "ChannelBot",
                "CB",
                `Welcome to #${currentChannelName}! ${newChannelTopic || ""}`,
                "text-green-400"
            );

            // Visually indicate active channel (optional)
            channelLinks.forEach((l) =>
                l.classList.remove("bg-gray-750", "text-white")
            );
            link.classList.add("bg-gray-750", "text-white");
        });
    });

    // --- Initial Setup ---
    function initializeChat() {
        // Simulate some initial messages for the default channel
        addMessageToChat(
            "ModBot",
            "MB",
            "Hello everyone! Remember to be respectful. @User123 check out #announcements for recent updates. You can also visit https://example.com",
            "text-yellow-400"
        );
        addMessageToChat(
            "JaneDoe",
            "JD",
            "Hey! Anyone up for some games later?",
            "text-pink-400"
        );

        // Set the first channel as active visually
        if (channelLinks.length > 0) {
            const firstChannel = document.querySelector(
                `.channel-link[data-channel-name="${currentChannelName}"]`
            );
            if (firstChannel) {
                firstChannel.classList.add("bg-gray-750", "text-white");
            }
        }
        messageInputPlaceholder.placeholder = `Message #${currentChannelName}`;
    }

    initializeChat();
});
