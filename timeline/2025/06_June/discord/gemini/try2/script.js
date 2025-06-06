document.addEventListener("DOMContentLoaded", () => {
    const serverIcons = document.querySelectorAll(".server-icon");
    const channelList = document.getElementById("channel-list");
    const serverNameHeader = document.getElementById("server-name-header");
    const channelNameHeader = document.getElementById("channel-name-header");
    const messageList = document.getElementById("message-list");
    const messageInput = document.getElementById("message-input");

    // --- Mock Data ---
    const serverData = {
        "708352770234777682": {
            // Future Programmers
            name: "Future Programmers",
            categories: [
                {
                    name: "TEXT CHANNELS",
                    channels: [
                        {
                            id: "fp-general",
                            name: "general",
                            type: "text",
                            unread: true,
                        },
                        {
                            id: "fp-announcements",
                            name: "announcements",
                            type: "text",
                        },
                        { id: "fp-help", name: "help-desk", type: "text" },
                    ],
                },
                {
                    name: "VOICE CHANNELS",
                    channels: [
                        { id: "fp-lounge", name: "Lounge", type: "voice" },
                        {
                            id: "fp-coding-sessions",
                            name: "Coding Sessions",
                            type: "voice",
                        },
                    ],
                },
            ],
        },
        "123456789012345678": {
            // Gaming Hub
            name: "Gaming Hub",
            categories: [
                {
                    name: "MAIN",
                    channels: [
                        {
                            id: "gh-general",
                            name: "general-chat",
                            type: "text",
                            unread: true,
                        },
                        { id: "gh-valorant", name: "valorant", type: "text" },
                    ],
                },
                {
                    name: "VOICE CHATS",
                    channels: [
                        { id: "gh-squad1", name: "Squad 1", type: "voice" },
                        { id: "gh-afk", name: "AFK", type: "voice" },
                    ],
                },
            ],
        },
        "098765432109876543": {
            // Art Club
            name: "Art Club",
            categories: [
                {
                    name: "GALLERY",
                    channels: [
                        { id: "ac-showcase", name: "showcase", type: "text" },
                        {
                            id: "ac-feedback",
                            name: "feedback-wanted",
                            type: "text",
                            unread: true,
                        },
                    ],
                },
                {
                    name: "STUDIO",
                    channels: [
                        {
                            id: "ac-drawing",
                            name: "Drawing Room",
                            type: "voice",
                        },
                    ],
                },
            ],
        },
        dm: {
            // Direct Messages (special case)
            name: "Direct Messages",
            categories: [
                {
                    name: "FRIENDS",
                    channels: [
                        {
                            id: "dm-user1",
                            name: "FriendOne",
                            type: "dm",
                            avatar: "https://via.placeholder.com/32/FF0000/FFFFFF?Text=F1",
                        },
                        {
                            id: "dm-user2",
                            name: "CoolDude23",
                            type: "dm",
                            avatar: "https://via.placeholder.com/32/00FF00/000000?Text=CD",
                        },
                    ],
                },
            ],
        },
    };

    const messageData = {
        "fp-general": [
            {
                user: "Alice",
                avatar: "https://via.placeholder.com/40/FFA500/000000?Text=A",
                time: "10:30 AM",
                text: "Hello everyone! Excited for the new project.",
            },
            {
                user: "Bob",
                avatar: "https://via.placeholder.com/40/008000/FFFFFF?Text=B",
                time: "10:32 AM",
                text: "Me too! What are we building?",
            },
            {
                user: "MyUsername",
                avatar: "https://via.placeholder.com/40/7289DA/FFFFFF?Text=U",
                time: "10:35 AM",
                text: "It's a Discord clone! 😉",
            },
        ],
        "fp-announcements": [
            {
                user: "Admin",
                avatar: "https://via.placeholder.com/40/FF0000/FFFFFF?Text=AD",
                time: "Yesterday",
                text: "Server maintenance scheduled for tomorrow at 2 AM.",
            },
        ],
        "gh-general-chat": [
            {
                user: "GamerX",
                avatar: "https://via.placeholder.com/40/800080/FFFFFF?Text=GX",
                time: "1:15 PM",
                text: "Anyone up for Valorant?",
            },
            {
                user: "ProPlayer",
                avatar: "https://via.placeholder.com/40/0000FF/FFFFFF?Text=PP",
                time: "1:16 PM",
                text: "Yeah, send invite!",
            },
        ],
        "dm-user1": [
            {
                user: "FriendOne",
                avatar: "https://via.placeholder.com/40/FF0000/FFFFFF?Text=F1",
                time: "9:00 AM",
                text: "Hey, how are you?",
            },
            {
                user: "MyUsername",
                avatar: "https://via.placeholder.com/40/7289DA/FFFFFF?Text=U",
                time: "9:01 AM",
                text: "Doing good! You?",
            },
        ],
        // Add more messages for other channels
    };

    let currentServerId = "708352770234777682"; // Default to first server
    let currentChannelId = "fp-general";

    function renderChannels(serverId) {
        const server = serverData[serverId];
        if (!server) {
            channelList.innerHTML =
                '<p class="p-2 text-discord-gray-300">No channels found.</p>';
            return;
        }

        serverNameHeader.textContent = server.name;
        channelList.innerHTML = ""; // Clear old channels

        server.categories.forEach((category) => {
            const categoryDiv = document.createElement("div");
            categoryDiv.className = "mb-2";

            if (category.name) {
                // DMs might not have category names
                const categoryHeader = document.createElement("div");
                categoryHeader.className =
                    "px-1 mb-0.5 text-xs font-semibold uppercase text-discord-gray-300 tracking-wide flex items-center justify-between";
                categoryHeader.innerHTML = `<span>${category.name}</span> <i class="fas fa-plus text-xs cursor-pointer hover:text-discord-gray-100"></i>`;
                categoryDiv.appendChild(categoryHeader);
            }

            category.channels.forEach((channel) => {
                const channelElement = document.createElement("div");
                channelElement.className = `channel-item flex items-center space-x-2 px-2 py-1 rounded cursor-pointer hover:bg-discord-gray-500/60 ${
                    channel.id === currentChannelId
                        ? "bg-discord-gray-400/70 text-white"
                        : "text-discord-gray-200"
                }`;
                channelElement.dataset.channelId = channel.id;
                channelElement.dataset.channelName = channel.name;
                channelElement.dataset.channelType = channel.type;

                let iconClass = "fas fa-hashtag";
                if (channel.type === "voice") iconClass = "fas fa-volume-up";
                else if (channel.type === "dm") iconClass = ""; // Avatar will be used

                let avatarHtml = "";
                if (channel.type === "dm" && channel.avatar) {
                    avatarHtml = `<img src="${channel.avatar}" alt="${channel.name}" class="w-6 h-6 rounded-full mr-1">`;
                } else if (channel.type !== "dm") {
                    avatarHtml = `<i class="${iconClass} text-discord-gray-300 w-4 text-center"></i>`;
                }

                channelElement.innerHTML = `
                    ${avatarHtml}
                    <span class="truncate flex-1 ${
                        channel.unread ? "font-medium text-white" : ""
                    }">${channel.name}</span>
                    ${
                        channel.type !== "dm"
                            ? `
                        <div class="channel-actions opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                            <i class="fas fa-user-plus text-xs hover:text-discord-gray-100"></i>
                            <i class="fas fa-cog text-xs ml-1 hover:text-discord-gray-100"></i>
                        </div>
                    `
                            : ""
                    }
                `;
                channelElement.addEventListener("click", () =>
                    selectChannel(channel.id, channel.name, serverId)
                );
                categoryDiv.appendChild(channelElement);
                // Add group class for hover effect on actions
                channelElement.classList.add("group");
            });
            channelList.appendChild(categoryDiv);
        });
    }

    function renderMessages(channelId) {
        const messages = messageData[channelId] || [];
        messageList.innerHTML = ""; // Clear old messages

        if (messages.length === 0) {
            const noMessagesElement = document.createElement("div");
            noMessagesElement.className =
                "text-center text-discord-gray-300 p-4";
            noMessagesElement.textContent =
                "No messages here yet. Be the first!";
            messageList.appendChild(noMessagesElement);
            return;
        }

        messages.forEach((msg) => {
            const messageElement = document.createElement("div");
            messageElement.className =
                "flex items-start space-x-3 py-1 hover:bg-discord-gray-500/20 px-2 -mx-2 rounded group"; // Added group for hover actions

            messageElement.innerHTML = `
                <img src="${msg.avatar}" alt="${msg.user}" class="w-10 h-10 rounded-full mt-1">
                <div class="flex-1">
                    <div class="flex items-baseline space-x-2">
                        <span class="font-semibold text-sm text-white">${msg.user}</span>
                        <span class="text-xs text-discord-gray-300">${msg.time}</span>
                    </div>
                    <p class="text-discord-gray-100 text-sm leading-relaxed">${msg.text}</p>
                </div>
                <div class="message-actions opacity-0 group-hover:opacity-100 transition-opacity duration-100 bg-discord-gray-600 shadow-md rounded border border-discord-gray-700 p-1 -mt-2">
                    <i class="fas fa-smile p-1 hover:text-discord-blurple cursor-pointer"></i>
                    <i class="fas fa-reply p-1 hover:text-discord-blurple cursor-pointer"></i>
                    <i class="fas fa-ellipsis-h p-1 hover:text-discord-blurple cursor-pointer"></i>
                </div>
            `;
            messageList.appendChild(messageElement);
        });
        messageList.scrollTop = messageList.scrollHeight; // Scroll to bottom
    }

    function selectServer(serverId, serverName) {
        currentServerId = serverId;
        serverIcons.forEach((icon) =>
            icon.classList.remove(
                "active-server",
                "rounded-2xl",
                "bg-discord-blurple"
            )
        );

        const activeIcon = document.getElementById(
            serverId === "dm" ? "dm-button" : `server-${serverId}`
        );
        if (activeIcon) {
            activeIcon.classList.add(
                "active-server",
                "rounded-2xl",
                "bg-discord-blurple"
            );
        } else if (serverId === "dm") {
            document
                .getElementById("dm-button")
                .classList.add("active-server", "rounded-2xl");
        }

        renderChannels(serverId);
        // Select the first channel of the new server by default
        const server = serverData[serverId];
        if (
            server &&
            server.categories.length > 0 &&
            server.categories[0].channels.length > 0
        ) {
            const firstChannel = server.categories[0].channels[0];
            selectChannel(firstChannel.id, firstChannel.name, serverId);
        } else {
            selectChannel(null, "No Channels", serverId); // Handle servers with no channels
        }
    }

    function selectChannel(channelId, channelName, serverId) {
        currentChannelId = channelId;
        channelNameHeader.textContent = channelName;
        messageInput.placeholder = `Message #${channelName}`;

        // Update active state for channels
        document.querySelectorAll(".channel-item").forEach((item) => {
            item.classList.remove("bg-discord-gray-400/70", "text-white");
            if (item.dataset.channelId === channelId) {
                item.classList.add("bg-discord-gray-400/70", "text-white");
                // Remove unread styling if any
                const nameSpan = item.querySelector("span.truncate");
                if (nameSpan) {
                    nameSpan.classList.remove("font-medium", "text-white");
                    nameSpan.classList.add("text-white"); // Ensure it's white if selected
                }
            }
        });
        if (channelId) {
            renderMessages(channelId);
        } else {
            messageList.innerHTML =
                '<p class="text-center text-discord-gray-300 p-4">Select a channel to start chatting.</p>';
        }
    }

    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && messageInput.value.trim() !== "") {
            const newMessage = {
                user: "MyUsername",
                avatar: "https://via.placeholder.com/40/7289DA/FFFFFF?Text=U", // Your avatar
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                text: messageInput.value.trim(),
            };

            if (!messageData[currentChannelId]) {
                messageData[currentChannelId] = [];
            }
            messageData[currentChannelId].push(newMessage);
            renderMessages(currentChannelId);
            messageInput.value = "";
        }
    });

    // Event listeners for server icons
    serverIcons.forEach((icon) => {
        if (icon.id === "dm-button") {
            icon.addEventListener("click", () =>
                selectServer("dm", "Direct Messages")
            );
        } else if (icon.dataset.serverId) {
            icon.addEventListener("click", () =>
                selectServer(icon.dataset.serverId, icon.dataset.serverName)
            );
        }
    });

    // --- Initial Load ---
    selectServer(currentServerId, serverData[currentServerId].name); // Load default server and its first channel

    const defaultServerIcon = document.getElementById(
        `server-${currentServerId}`
    );
    if (defaultServerIcon) {
        defaultServerIcon.classList.add(
            "active-server",
            "rounded-2xl",
            "bg-discord-blurple"
        );
    }
});
