// tutorial.js

class PageTutorial {
    constructor(containerElement, steps) {
        this.container = containerElement;
        this.steps = steps;
        this.currentStepIndex = 0;
        this.overlayElement = null;
        this.stepContentElement = null;
        this.highlightElement = null;
        this.isTutorialActive = false;

        // Bind methods to ensure 'this' context is correct
        // this.start = this.start.bind(this);
        // this.nextStep = this.nextStep.bind(this);
        // this.prevStep = this.prevStep.bind(this);
        // this.endTutorial = this.endTutorial.bind(this);
        // this.updateStep = this.updateStep.bind(this);
        // this.renderStep = this.renderStep.bind(this);
        // this.removeHighlight = this.removeHighlight.bind(this);
        // this.addHighlight = this.addHighlight.bind(this);
        // this.positionTutorialContent = this.positionTutorialContent.bind(this);
        // this.handleResize = this.handleResize.bind(this);
    }

    /**
     * Initializes and starts the tutorial.
     */
    start() {
        if (this.isTutorialActive) return;
        this.isTutorialActive = true;
        this.currentStepIndex = 0;

        this.createOverlay();
        this.renderStep();

        // Add event listeners for navigation buttons within the content
        this.container.addEventListener("click", (event) => {
            if (event.target.matches(".tutorial-next-btn")) {
                this.nextStep();
            } else if (event.target.matches(".tutorial-prev-btn")) {
                this.prevStep();
            } else if (event.target.matches(".tutorial-end-btn")) {
                this.endTutorial();
            }
        });

        // Handle window resizing to reposition the tutorial content
        window.addEventListener("resize", this.handleResize);
    }

    /**
     * Creates the main overlay element and the content area.
     */
    createOverlay() {
        this.overlayElement = document.createElement("div");
        this.overlayElement.className = "tutorial-overlay";
        this.container.appendChild(this.overlayElement);

        this.stepContentElement = document.createElement("div");
        this.stepContentElement.className = "tutorial-step-content";
        this.container.appendChild(this.stepContentElement);
    }

    /**
     * Renders the current tutorial step.
     */
    renderStep() {
        if (
            !this.overlayElement ||
            !this.stepContentElement ||
            this.currentStepIndex >= this.steps.length
        ) {
            this.endTutorial();
            return;
        }

        const currentStep = this.steps[this.currentStepIndex];
        const targetElement = document.getElementById(currentStep.targetId);

        if (!targetElement) {
            console.warn(
                `Target element with ID "${
                    currentStep.targetId
                }" not found for step ${this.currentStepIndex + 1}. Skipping.`
            );
            this.currentStepIndex++; // Move to the next step if target is missing
            this.renderStep(); // Try rendering the next step
            return;
        }

        this.removeHighlight(); // Remove previous highlight
        this.addHighlight(targetElement); // Add highlight to current target

        // Update the content of the tutorial step
        this.stepContentElement.innerHTML = `
            <h3 class="text-lg font-bold mb-2">${
                currentStep.title || `Step ${this.currentStepIndex + 1}`
            }</h3>
            <p class="text-sm mb-4">${currentStep.text}</p>
            <div class="flex justify-between items-center">
                <span class="text-gray-600 text-xs">${
                    this.currentStepIndex + 1
                } / ${this.steps.length}</span>
                <div>
                    ${
                        this.currentStepIndex > 0
                            ? '<button class="tutorial-prev-btn text-sm text-gray-500 mr-2 hover:underline focus:outline-none">Prev</button>'
                            : ""
                    }
                    ${
                        this.currentStepIndex < this.steps.length - 1
                            ? '<button class="tutorial-next-btn text-sm text-blue-500 hover:underline focus:outline-none">Next</button>'
                            : '<button class="tutorial-end-btn text-sm text-red-500 hover:underline focus:outline-none">End Tour</button>'
                    }
                </div>
            </div>
        `;

        // Position the tutorial content
        this.positionTutorialContent(currentStep.position, targetElement);

        // Make sure the overlay is visible again if it was hidden due to missing elements
        this.overlayElement.style.pointerEvents = "auto"; // Allow interaction with tutorial buttons
        document.body.classList.add("overflow-hidden"); // Prevent scrolling during tutorial
    }

    /**
     * Adds a highlight outline to the target element.
     * @param {HTMLElement} element - The element to highlight.
     */
    addHighlight(element) {
        if (element) {
            // Clone the element to avoid direct modification of original styles and allow Z-index
            // Or, more simply, add a class and use CSS to achieve the outline effect.
            // We'll use a class approach for simplicity and better performance.
            element.classList.add("tutorial-step-highlight");
            this.highlightElement = element; // Keep track of the element that has the highlight class
        }
    }

    /**
     * Removes the highlight outline from the previously targeted element.
     */
    removeHighlight() {
        if (this.highlightElement) {
            this.highlightElement.classList.remove("tutorial-step-highlight");
            this.highlightElement = null;
        }
    }

    /**
     * Positions the tutorial content box relative to the target element.
     * @param {string} position - The desired position (e.g., 'top-center', 'bottom-right').
     * @param {HTMLElement} targetElement - The element being highlighted.
     */
    positionTutorialContent(position, targetElement) {
        // Clear existing position classes
        this.stepContentElement.className = "tutorial-step-content";
        // Add the new position class
        this.stepContentElement.classList.add(position);

        // Adjust position dynamically to try and keep it within viewport
        const rect = targetElement.getBoundingClientRect();
        const contentRect = this.stepContentElement.getBoundingClientRect();
        const viewportWidth =
            window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight =
            window.innerHeight || document.documentElement.clientHeight;

        let calculatedTop = 0;
        let calculatedLeft = 0;

        // Use CSS classes for primary positioning, then JS for adjustments
        // The CSS classes handle the basic placement. Now we might adjust if it goes off-screen.

        // Basic positioning is handled by CSS classes like .top-center, .bottom-center etc.
        // We'll focus on ensuring it doesn't go off-screen.
        // For simplicity, we'll primarily rely on the CSS classes. More complex collision detection
        // would require more involved JS logic to calculate and apply inline styles or new classes.

        // Example of a simple adjustment (if content overflows to the right)
        if (position.includes("right") || position.includes("center")) {
            const currentLeft =
                parseFloat(this.stepContentElement.style.left) || 0;
            const newLeft = currentLeft + rect.width + 10; // 10px buffer
            if (newLeft + contentRect.width > viewportWidth) {
                // Try to place it to the left of the target if possible
                this.stepContentElement.classList.remove(position); // Remove original position class
                const altPosition = position
                    .replace("right", "left")
                    .replace("center", "left");
                this.stepContentElement.classList.add(altPosition); // Apply alternative position
            }
        }
        // Similarly, you could check for overflow at the bottom or top.
        // This is a basic implementation. A robust solution might involve a library or more complex logic.
    }

    /**
     * Moves to the next tutorial step.
     */
    nextStep() {
        this.currentStepIndex++;
        this.renderStep();
    }

    /**
     * Moves to the previous tutorial step.
     */
    prevStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.renderStep();
        }
    }

    /**
     * Ends the tutorial and cleans up the UI.
     */
    endTutorial() {
        this.isTutorialActive = false;
        this.removeHighlight();
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
        }
        if (this.stepContentElement) {
            this.stepContentElement.remove();
            this.stepContentElement = null;
        }
        window.removeEventListener("resize", this.handleResize);
        document.body.classList.remove("overflow-hidden"); // Restore scrolling
        console.log("Tutorial ended.");
    }

    /**
     * Handles window resize events to reposition tutorial content.
     */
    handleResize() {
        if (this.isTutorialActive && this.steps.length > 0) {
            const currentStep = this.steps[this.currentStepIndex];
            const targetElement = document.getElementById(currentStep.targetId);
            if (targetElement) {
                this.positionTutorialContent(
                    currentStep.position,
                    targetElement
                );
            }
        }
    }
}
