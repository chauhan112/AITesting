// app.js

const notificationContainer = document.getElementById("notification-container");

// Configuration for different notification types
const notificationTypes = {
    info: {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        baseColor: "blue",
    },
    success: {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        baseColor: "green",
    },
    warning: {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
        baseColor: "yellow",
    },
    error: {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        baseColor: "red",
    },
};

// Main function to show a notification
function showNotification(type = "info", message, duration = 5000) {
    const config = notificationTypes[type];
    if (!config) return; // Exit if type is invalid

    // Create the notification element
    const notification = document.createElement("div");
    const id = `notif_${Date.now()}`;
    notification.id = id;

    // Define Tailwind classes for styling and animation
    const baseClasses =
        "w-full max-w-sm p-4 rounded-lg shadow-lg flex items-start space-x-4";
    const colorClasses = `bg-${config.baseColor}-100 text-${config.baseColor}-800`;
    const transitionClasses =
        "transform transition-all duration-300 ease-in-out";
    const initialClasses = "opacity-0 translate-x-full"; // Start off-screen
    const finalClasses = "opacity-100 translate-x-0"; // Slide in

    notification.className = `${baseClasses} ${colorClasses} ${transitionClasses} ${initialClasses}`;

    // Set the inner HTML with icon, message, and close button
    notification.innerHTML = `
        <div class="flex-shrink-0 text-${config.baseColor}-500">
            ${config.icon}
        </div>
        <div class="flex-1">
            <p class="font-semibold">${capitalizeFirstLetter(type)}</p>
            <p class="text-sm">${message}</p>
        </div>
        <div class="flex-shrink-0">
            <button onclick="closeNotification('${id}')" class="text-${
        config.baseColor
    }-500 hover:text-${config.baseColor}-700 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    `;

    // Append to container
    notificationContainer.appendChild(notification);

    // --- Animation ---
    // We use a tiny timeout to allow the browser to render the initial state (off-screen)
    // before transitioning to the final state (on-screen). This triggers the CSS transition.
    setTimeout(() => {
        notification.classList.remove(...initialClasses.split(" "));
        notification.classList.add(...finalClasses.split(" "));
    }, 10);

    // --- Auto-close timer ---
    const timer = setTimeout(() => {
        closeNotification(id);
    }, duration);

    // Store the timer ID on the element so we can clear it if closed manually
    notification.dataset.timer = timer;
}

// Function to close a notification
function closeNotification(id) {
    const notification = document.getElementById(id);
    if (!notification) return;

    // Clear the auto-close timer if it exists
    if (notification.dataset.timer) {
        clearTimeout(notification.dataset.timer);
    }

    // --- Animate Out ---
    const transitionClasses =
        "transform transition-all duration-300 ease-in-out";
    const finalClasses = "opacity-0 translate-x-full"; // Slide out

    notification.className = `${notification.className
        .split(" ")
        .filter(
            (c) => !c.startsWith("opacity-") && !c.startsWith("translate-x-")
        )
        .join(" ")} ${transitionClasses} ${finalClasses}`;

    // Remove the element from the DOM after the animation completes
    notification.addEventListener("transitionend", () => {
        notification.remove();
    });
}

// Helper function to capitalize the first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
