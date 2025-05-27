// Global array to keep track of open modals
const modalStack = [];
let modalCounter = 0; // To give unique levels/IDs to modals

/**
 * Creates the HTML content for a modal based on its level.
 * @param {number} level - The level of the modal (e.g., 1 for first, 2 for second, etc.)
 * @returns {string} The HTML string for the modal's inner content.
 */
function createModalContent(level) {
    return `
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Modal ${level}</h2>
        <p class="text-gray-700 mb-6">
            This is modal number ${level}. 
            You can open another modal on top of this one, or close it to reveal the previous one.
        </p>
        <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 modal-open-another-btn">
                Open Another Modal
            </button>
            <button class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 modal-close-btn">
                Close Modal ${level}
            </button>
        </div>
    `;
}

/**
 * Creates the full modal DOM element.
 * @param {number} id - A unique ID for the modal instance.
 * @param {number} level - The sequential level of the modal.
 * @returns {HTMLElement} The created modal DOM element.
 */
function createModalElement(id, level) {
    const modalDiv = document.createElement("div");
    modalDiv.id = `modal-${id}`;
    modalDiv.classList.add(
        "modal-overlay", // Custom class for shared modal styles
        "fixed",
        "inset-0",
        "bg-black/60",
        "flex",
        "items-center",
        "justify-center",
        "opacity-0",
        "transition-opacity",
        "duration-300", // For fade in/out
        "hidden-true" // Initially hidden, will be removed for animation
    );
    // Set dynamic z-index using a CSS variable for proper stacking
    modalDiv.style.setProperty("--modal-z-index", 50 + level * 10);

    modalDiv.innerHTML = `
        <div class="modal-content bg-white p-6 rounded-lg shadow-xl relative w-11/12 max-w-md
                    transform scale-95 transition-transform duration-300 ease-out">
            ${createModalContent(level)}
            <!-- Optional close button in corner -->
            <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-semibold leading-none modal-close-btn">
                ×
            </button>
        </div>
    `;
    return modalDiv;
}

/**
 * Opens a new modal, hiding the previously active one if it exists.
 */
function openModal() {
    modalCounter++; // Increment modal level
    const currentModalLevel = modalCounter;
    const currentModalId = Date.now(); // Simple unique ID for the current modal instance

    // If there's an existing modal, hide it before opening the new one
    if (modalStack.length > 0) {
        const prevModal = modalStack[modalStack.length - 1];
        prevModal.element.classList.remove(
            "opacity-100",
            "pointer-events-auto"
        );
        prevModal.element.classList.add("opacity-0", "pointer-events-none");
        prevModal.element.classList.add("hidden-true"); // Truly hide from layout/a11y
        prevModal.element
            .querySelector(".modal-content")
            .classList.remove("scale-100");
        prevModal.element
            .querySelector(".modal-content")
            .classList.add("scale-95");
        // Optionally lower its z-index even further
        prevModal.element.style.setProperty(
            "--modal-z-index",
            50 + prevModal.level * 10 - 1
        );
    }

    const newModalElement = createModalElement(
        currentModalId,
        currentModalLevel
    );
    document.body.appendChild(newModalElement);

    // Use requestAnimationFrame for smoother transition start
    requestAnimationFrame(() => {
        newModalElement.classList.remove("opacity-0", "hidden-true");
        newModalElement.classList.add("opacity-100", "pointer-events-auto");
        newModalElement
            .querySelector(".modal-content")
            .classList.remove("scale-95");
        newModalElement
            .querySelector(".modal-content")
            .classList.add("scale-100");
    });

    // Store the modal instance in the stack
    const modalInstance = {
        id: currentModalId,
        level: currentModalLevel,
        element: newModalElement,
    };
    modalStack.push(modalInstance);

    // Add event listeners for the new modal's buttons and overlay
    newModalElement.querySelectorAll(".modal-close-btn").forEach((btn) => {
        btn.addEventListener("click", closeModal);
    });
    newModalElement
        .querySelector(".modal-open-another-btn")
        .addEventListener("click", openModal);

    // Close modal if overlay is clicked (but not content)
    newModalElement.addEventListener("click", (e) => {
        if (e.target === newModalElement) {
            closeModal();
        }
    });

    // Optional: Focus the close button for accessibility
    newModalElement.querySelector(".modal-close-btn").focus();
}

/**
 * Closes the topmost modal and reveals the previous one if it exists.
 */
function closeModal() {
    if (modalStack.length === 0) {
        return; // No modals to close
    }

    const currentModal = modalStack[modalStack.length - 1]; // Get top modal without popping yet
    const modalElement = currentModal.element;

    // Add transition end listener BEFORE triggering transition
    // This ensures the element is removed only after the fade-out is complete
    const handleTransitionEnd = () => {
        modalElement.remove(); // Remove element from DOM
        modalStack.pop(); // Remove from stack

        // Show the previous modal if it exists
        if (modalStack.length > 0) {
            const prevModal = modalStack[modalStack.length - 1];
            prevModal.element.classList.remove(
                "opacity-0",
                "pointer-events-none",
                "hidden-true"
            );
            prevModal.element.classList.add(
                "opacity-100",
                "pointer-events-auto"
            );
            prevModal.element
                .querySelector(".modal-content")
                .classList.remove("scale-95");
            prevModal.element
                .querySelector(".modal-content")
                .classList.add("scale-100");
            // Restore its original z-index
            prevModal.element.style.setProperty(
                "--modal-z-index",
                50 + prevModal.level * 10
            );
            prevModal.element.querySelector(".modal-close-btn").focus(); // Refocus for accessibility
        } else {
            // If no more modals, reset counter to start from 1 again next time
            modalCounter = 0;
            // Optional: Focus back on the initial button
            document.getElementById("open-first-modal-btn").focus();
        }
        modalElement.removeEventListener("transitionend", handleTransitionEnd); // Clean up listener
    };

    modalElement.addEventListener("transitionend", handleTransitionEnd, {
        once: true,
    });

    // Start fade-out animation
    modalElement.classList.remove("opacity-100", "pointer-events-auto");
    modalElement.classList.add("opacity-0"); // Will add pointer-events-none on transitionend
    modalElement.querySelector(".modal-content").classList.remove("scale-100");
    modalElement.querySelector(".modal-content").classList.add("scale-95");
    // Optionally lower its z-index slightly immediately
    modalElement.style.setProperty("--modal-z-index", 40);
}

// Global ESC key listener to close the top-most modal
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeModal();
    }
});

// Event listener for the initial button to open the first modal
document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("open-first-modal-btn")
        .addEventListener("click", openModal);
});
