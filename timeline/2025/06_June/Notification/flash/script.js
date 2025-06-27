// Get the notification container
const notificationContainer = document.getElementById("notification-container");

// Configuration for different notification types
const notificationTypes = {
    info: {
        icon: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>`,
        bgColor: "bg-blue-500",
        title: "Info",
    },
    success: {
        icon: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`,
        bgColor: "bg-green-500",
        title: "Success",
    },
    error: {
        icon: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>`,
        bgColor: "bg-red-500",
        title: "Error",
    },
    warning: {
        icon: `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0L14.4 10.4A1 1 0 0113.525 12H6.474a1 1 0 01-.875-1.557L8.257 3.099zM10 15a1 1 0 100-2 1 1 0 000 2zm0 0h.01" clip-rule="evenodd"></path></svg>`,
        bgColor: "bg-yellow-500",
        title: "Warning",
    },
};

/**
 * Creates and displays a notification popup.
 * @param {string} type - The type of notification ('info', 'success', 'error', 'warning').
 * @param {string} message - The message to display in the notification.
 * @param {number} [duration=3000] - How long the notification stays visible in milliseconds.
 */
function showNotification(type, message, duration = 3000) {
    const config = notificationTypes[type];
    if (!config) {
        console.warn(`Unknown notification type: ${type}`);
        return;
    }

    // Create the notification element
    const notificationElement = document.createElement("div");
    notificationElement.classList.add(
        "notification-item", // Custom class for JS targeting
        "w-80",
        "p-4",
        "rounded-lg",
        "shadow-lg",
        "text-white",
        "flex",
        "items-start",
        "space-x-3",
        "pointer-events-auto", // Make it clickable
        config.bgColor, // Background color based on type
        "transition-all", // Enable CSS transitions
        "duration-500",
        "ease-in-out",
        "transform",
        "translate-x-full", // Start off-screen to the right
        "opacity-0" // Start fully transparent
    );

    notificationElement.innerHTML = `
        <div class="flex-shrink-0 mt-0.5">
            ${config.icon}
        </div>
        <div class="flex-grow">
            <h3 class="font-bold text-lg">${config.title}</h3>
            <p class="text-sm">${message}</p>
        </div>
        <button class="close-btn flex-shrink-0 text-white opacity-75 hover:opacity-100 transition-opacity">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
        </button>
    `;

    // Append to container
    notificationContainer.appendChild(notificationElement);

    // Trigger the slide-in and fade-in animation
    // Use requestAnimationFrame for smoother animation by ensuring the browser
    // has rendered the initial state before applying the final state.
    requestAnimationFrame(() => {
        notificationElement.classList.remove("translate-x-full", "opacity-0");
        notificationElement.classList.add("translate-x-0", "opacity-100");
    });

    // Function to remove the notification with animation
    const removeNotification = () => {
        notificationElement.classList.remove("translate-x-0", "opacity-100");
        notificationElement.classList.add("translate-x-full", "opacity-0");

        // Wait for the transition to finish before removing from DOM
        notificationElement.addEventListener(
            "transitionend",
            () => {
                notificationElement.remove();
            },
            { once: true }
        ); // Use { once: true } to remove the event listener after it fires
    };

    // Auto-dismiss after duration
    if (duration > 0) {
        setTimeout(removeNotification, duration);
    }

    // Manual dismissal via close button
    const closeButton = notificationElement.querySelector(".close-btn");
    closeButton.addEventListener("click", removeNotification);
}

// --- Event Listeners for Demo Buttons ---
document.getElementById("showInfo").addEventListener("click", () => {
    showNotification("info", "This is an informational message.");
});

document.getElementById("showSuccess").addEventListener("click", () => {
    showNotification("success", "Your operation was completed successfully!");
});

document.getElementById("showError").addEventListener("click", () => {
    showNotification(
        "error",
        "An error occurred while processing your request."
    );
});

document.getElementById("showWarning").addEventListener("click", () => {
    showNotification(
        "warning",
        "Please review the highlighted fields before proceeding."
    );
});

// Example of a longer lasting notification
// document.getElementById('showInfo').addEventListener('click', () => {
//     showNotification('info', 'This is an informational message that will stay for 5 seconds.', 5000);
// });
