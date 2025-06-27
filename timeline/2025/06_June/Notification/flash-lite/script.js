document.addEventListener("DOMContentLoaded", () => {
    const notificationContainer = document.getElementById(
        "notification-container"
    );

    /**
     * Creates and displays a notification.
     * @param {string} message - The message to display.
     * @param {string} type - The type of notification ('info', 'success', 'warning', 'error').
     * @param {number} duration - The duration in milliseconds for the notification to stay visible (0 for indefinite).
     */
    function showNotification(message, type = "info", duration = 3000) {
        // 1. Create the notification element
        const notification = document.createElement("div");

        // Define Tailwind classes based on type
        let baseClasses =
            "relative px-4 py-3 rounded shadow-md transition-opacity duration-500 ease-in-out opacity-0 pointer-events-auto max-w-sm w-full";
        let typeClasses = "";

        switch (type) {
            case "info":
                typeClasses =
                    "bg-blue-100 border border-blue-400 text-blue-700";
                break;
            case "success":
                typeClasses =
                    "bg-green-100 border border-green-400 text-green-700";
                break;
            case "warning":
                typeClasses =
                    "bg-yellow-100 border border-yellow-400 text-yellow-700";
                break;
            case "error":
                typeClasses = "bg-red-100 border border-red-400 text-red-700";
                break;
            default:
                typeClasses =
                    "bg-gray-100 border border-gray-400 text-gray-700";
        }

        notification.className = `${baseClasses} ${typeClasses}`;

        // 2. Add the message content
        notification.innerHTML = `
            <strong class="font-bold">${
                type.charAt(0).toUpperCase() + type.slice(1)
            }!</strong>
            <span class="block sm:inline">${message}</span>
            <button class="absolute top-0 right-0 mt-2 mr-3 text-xl font-bold leading-none focus:outline-none" aria-label="Close">
                ×
            </button>
        `;

        // Add close button functionality
        const closeButton = notification.querySelector("button");
        closeButton.addEventListener("click", () => {
            hideNotification(notification);
        });

        // 3. Append to the container
        notificationContainer.appendChild(notification);

        // 4. Trigger fade-in animation (using setTimeout to ensure element is in DOM)
        setTimeout(() => {
            notification.classList.remove("opacity-0");
        }, 10); // Small delay to allow the element to be added to the DOM

        // 5. Automatically hide after duration (if duration is specified)
        if (duration > 0) {
            setTimeout(() => {
                hideNotification(notification);
            }, duration);
        }
    }

    /**
     * Hides and removes a notification.
     * @param {HTMLElement} notification - The notification element to hide.
     */
    function hideNotification(notification) {
        notification.classList.add("opacity-0"); // Start fade-out
        notification.style.pointerEvents = "none"; // Prevent clicks during fade-out

        // Remove the element after the transition is complete
        notification.addEventListener(
            "transitionend",
            () => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            },
            { once: true }
        ); // Use { once: true } to automatically remove the listener
    }

    // --- Event Listeners for Demo Buttons ---
    document.getElementById("show-info-btn").addEventListener("click", () => {
        showNotification("This is an informational message.", "info");
    });

    document
        .getElementById("show-success-btn")
        .addEventListener("click", () => {
            showNotification("Operation completed successfully!", "success");
        });

    document
        .getElementById("show-warning-btn")
        .addEventListener("click", () => {
            showNotification(
                "Be careful, something might be wrong.",
                "warning"
            );
        });

    document.getElementById("show-error-btn").addEventListener("click", () => {
        showNotification("An error occurred. Please try again.", "error", 0); // Keep error visible until closed
    });
});
