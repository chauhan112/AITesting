// src/tutorial.js

class TutorialManager {
    constructor(steps, options = {}) {
        if (!Array.isArray(steps) || steps.length === 0) {
            console.error(
                "TutorialManager: Steps array is required and must not be empty."
            );
            return;
        }

        this.steps = steps;
        this.currentStepIndex = 0;
        this.options = {
            startText: options.startText || "Start Tutorial",
            skipText: options.skipText || "Skip Tour",
            nextText: options.nextText || "Next",
            prevText: options.prevText || "Previous",
            overlayColor: options.overlayColor || "bg-black/60",
            highlightBorder: options.highlightBorder || "border-blue-500",
            tooltipBg: options.tooltipBg || "bg-white",
            tooltipTextColor: options.tooltipTextColor || "text-gray-800",
            buttonBg: options.buttonBg || "bg-blue-500",
            buttonHoverBg: options.buttonHoverBg || "hover:bg-blue-600",
            buttonTextColor: options.buttonTextColor || "text-white",
            zIndex: options.zIndex || 9999, // Base z-index for the tutorial elements
        };

        this.elements = {}; // Store references to created DOM elements
        this._initDomElements();
        this._addEventListeners();
    }

    /**
     * Creates and appends the necessary DOM elements for the tutorial.
     * These elements are appended to the body, making the component self-contained.
     */
    _initDomElements() {
        // Overlay
        this.elements.overlay = document.createElement("div");
        this.elements.overlay.className = `tutorial-overlay fixed inset-0 w-full h-full ${this.options.overlayColor} flex items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none`;
        this.elements.overlay.style.zIndex = this.options.zIndex;
        document.body.appendChild(this.elements.overlay);

        // Highlight element
        this.elements.highlight = document.createElement("div");
        this.elements.highlight.className = `tutorial-highlight absolute border-4 ${this.options.highlightBorder} rounded-lg shadow-xl transition-all duration-300 ease-in-out opacity-0 pointer-events-none`;
        this.elements.highlight.style.zIndex = this.options.zIndex + 1; // Z-index higher than overlay
        document.body.appendChild(this.elements.highlight);

        // Tooltip
        this.elements.tooltip = document.createElement("div");
        this.elements.tooltip.className = `tutorial-tooltip absolute ${this.options.tooltipBg} ${this.options.tooltipTextColor} p-6 rounded-lg shadow-xl max-w-sm transition-all duration-300 ease-in-out opacity-0 pointer-events-none`;
        this.elements.tooltip.style.zIndex = this.options.zIndex + 2; // Z-index higher than highlight

        this.elements.tooltip.innerHTML = `
            <h3 class="text-xl font-bold mb-2 tutorial-title"></h3>
            <p class="text-sm mb-4 tutorial-description"></p>
            <div class="flex items-center justify-between text-xs">
                <span class="tutorial-step-counter font-semibold"></span>
                <div class="space-x-2">
                    <button class="tutorial-prev-btn px-4 py-2 rounded-md ${this.options.buttonBg} ${this.options.buttonHoverBg} ${this.options.buttonTextColor} text-sm font-semibold opacity-0 pointer-events-none transition-opacity duration-300">
                        ${this.options.prevText}
                    </button>
                    <button class="tutorial-next-btn px-4 py-2 rounded-md ${this.options.buttonBg} ${this.options.buttonHoverBg} ${this.options.buttonTextColor} text-sm font-semibold">
                        ${this.options.nextText}
                    </button>
                    <button class="tutorial-skip-btn px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold">
                        ${this.options.skipText}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(this.elements.tooltip);

        // Get references to internal tooltip elements
        this.elements.tooltipTitle =
            this.elements.tooltip.querySelector(".tutorial-title");
        this.elements.tooltipDescription = this.elements.tooltip.querySelector(
            ".tutorial-description"
        );
        this.elements.tooltipCounter = this.elements.tooltip.querySelector(
            ".tutorial-step-counter"
        );
        this.elements.prevBtn =
            this.elements.tooltip.querySelector(".tutorial-prev-btn");
        this.elements.nextBtn =
            this.elements.tooltip.querySelector(".tutorial-next-btn");
        this.elements.skipBtn =
            this.elements.tooltip.querySelector(".tutorial-skip-btn");
    }

    /**
     * Adds event listeners to the tutorial navigation buttons.
     */
    _addEventListeners() {
        this.elements.nextBtn.addEventListener("click", () => this.nextStep());
        this.elements.prevBtn.addEventListener("click", () => this.prevStep());
        this.elements.skipBtn.addEventListener("click", () =>
            this.endTutorial()
        );

        // Handle window resize to reposition elements
        window.addEventListener("resize", () => {
            if (this.elements.overlay.classList.contains("opacity-100")) {
                this.showStep(this.currentStepIndex); // Re-show current step to re-calculate positions
            }
        });
    }

    /**
     * Starts the tutorial.
     */
    startTutorial() {
        this.currentStepIndex = 0;
        this.elements.overlay.classList.remove(
            "opacity-0",
            "pointer-events-none"
        );
        this.elements.overlay.classList.add("opacity-100");
        document.body.classList.add("overflow-hidden"); // Prevent body scrolling during tutorial
        this.showStep(this.currentStepIndex);
    }

    /**
     * Displays a specific tutorial step.
     * @param {number} index - The index of the step to display.
     */
    showStep(index) {
        if (index < 0 || index >= this.steps.length) {
            this.endTutorial();
            return;
        }

        this.currentStepIndex = index;
        const step = this.steps[this.currentStepIndex];
        const targetElement = document.getElementById(step.id);

        if (!targetElement) {
            console.warn(
                `TutorialManager: Element with ID "${step.id}" not found for step ${index}. Skipping step.`
            );
            // Try to move to the next step if current target is missing
            if (this.currentStepIndex < this.steps.length - 1) {
                this.nextStep();
            } else {
                this.endTutorial();
            }
            return;
        }

        // Scroll target element into view
        targetElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });

        // Update tooltip content
        this.elements.tooltipTitle.textContent = step.title;
        this.elements.tooltipDescription.textContent = step.description;
        this.elements.tooltipCounter.textContent = `Step ${
            this.currentStepIndex + 1
        } of ${this.steps.length}`;

        // Update button visibility
        if (this.currentStepIndex === 0) {
            this.elements.prevBtn.classList.add(
                "opacity-0",
                "pointer-events-none"
            );
        } else {
            this.elements.prevBtn.classList.remove(
                "opacity-0",
                "pointer-events-none"
            );
        }

        if (this.currentStepIndex === this.steps.length - 1) {
            this.elements.nextBtn.textContent = "Finish"; // Last step button text
            this.elements.nextBtn.classList.remove(
                this.options.buttonBg,
                this.options.buttonHoverBg
            );
            this.elements.nextBtn.classList.add(
                "bg-green-500",
                "hover:bg-green-600"
            );
        } else {
            this.elements.nextBtn.textContent = this.options.nextText;
            this.elements.nextBtn.classList.remove(
                "bg-green-500",
                "hover:bg-green-600"
            );
            this.elements.nextBtn.classList.add(
                this.options.buttonBg,
                this.options.buttonHoverBg
            );
        }

        // Position highlight and tooltip
        this._positionElements(targetElement, step.position);

        // Ensure highlight and tooltip are visible
        this.elements.highlight.classList.remove(
            "opacity-0",
            "pointer-events-none"
        );
        this.elements.tooltip.classList.remove(
            "opacity-0",
            "pointer-events-none"
        );
    }

    /**
     * Positions the highlight box and the tooltip relative to the target element.
     * @param {HTMLElement} targetEl - The element to highlight.
     * @param {string} preferredPosition - Preferred position ('top', 'bottom', 'left', 'right').
     */
    _positionElements(targetEl, preferredPosition = "bottom") {
        const targetRect = targetEl.getBoundingClientRect();
        const highlightEl = this.elements.highlight;
        const tooltipEl = this.elements.tooltip;

        // Position the highlight
        highlightEl.style.width = `${targetRect.width + 16}px`; // Add some padding
        highlightEl.style.height = `${targetRect.height + 16}px`; // Add some padding
        highlightEl.style.top = `${targetRect.top + window.scrollY - 8}px`; // Adjust for padding and scroll
        highlightEl.style.left = `${targetRect.left + window.scrollX - 8}px`; // Adjust for padding and scroll

        // Position the tooltip
        tooltipEl.style.removeProperty("top");
        tooltipEl.style.removeProperty("bottom");
        tooltipEl.style.removeProperty("left");
        tooltipEl.style.removeProperty("right");

        // Calculate tooltip position
        let tooltipLeft, tooltipTop;
        const tooltipMargin = 15; // Space between highlight and tooltip
        const tooltipWidth = tooltipEl.offsetWidth;
        const tooltipHeight = tooltipEl.offsetHeight;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let actualPosition = preferredPosition;

        // Attempt to position based on preferredPosition
        switch (preferredPosition) {
            case "top":
                tooltipLeft =
                    targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
                tooltipTop = targetRect.top - tooltipHeight - tooltipMargin;
                // If it goes off-screen top, try bottom
                if (
                    tooltipTop < 0 &&
                    targetRect.bottom + tooltipHeight + tooltipMargin <
                        viewportHeight
                ) {
                    actualPosition = "bottom";
                }
                break;
            case "bottom":
                tooltipLeft =
                    targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
                tooltipTop = targetRect.bottom + tooltipMargin;
                // If it goes off-screen bottom, try top
                if (
                    tooltipTop + tooltipHeight > viewportHeight &&
                    targetRect.top - tooltipHeight - tooltipMargin > 0
                ) {
                    actualPosition = "top";
                }
                break;
            case "left":
                tooltipLeft = targetRect.left - tooltipWidth - tooltipMargin;
                tooltipTop =
                    targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
                // If it goes off-screen left, try right
                if (
                    tooltipLeft < 0 &&
                    targetRect.right + tooltipWidth + tooltipMargin <
                        viewportWidth
                ) {
                    actualPosition = "right";
                }
                break;
            case "right":
                tooltipLeft = targetRect.right + tooltipMargin;
                tooltipTop =
                    targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
                // If it goes off-screen right, try left
                if (
                    tooltipLeft + tooltipWidth > viewportWidth &&
                    targetRect.left - tooltipWidth - tooltipMargin > 0
                ) {
                    actualPosition = "left";
                }
                break;
            default: // Default to bottom if preferred is invalid or unhandled
                actualPosition = "bottom";
                break;
        }

        // Re-calculate based on actualPosition if it changed
        switch (actualPosition) {
            case "top":
                tooltipLeft =
                    targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
                tooltipTop = targetRect.top - tooltipHeight - tooltipMargin;
                break;
            case "bottom":
                tooltipLeft =
                    targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
                tooltipTop = targetRect.bottom + tooltipMargin;
                break;
            case "left":
                tooltipLeft = targetRect.left - tooltipWidth - tooltipMargin;
                tooltipTop =
                    targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
                break;
            case "right":
                tooltipLeft = targetRect.right + tooltipMargin;
                tooltipTop =
                    targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
                break;
        }

        // Ensure tooltip stays within horizontal viewport boundaries
        if (tooltipLeft + tooltipWidth > viewportWidth - 20) {
            // 20px padding from right
            tooltipLeft = viewportWidth - tooltipWidth - 20;
        }
        if (tooltipLeft < 20) {
            // 20px padding from left
            tooltipLeft = 20;
        }

        tooltipEl.style.left = `${tooltipLeft + window.scrollX}px`;
        tooltipEl.style.top = `${tooltipTop + window.scrollY}px`;

        // If the tooltip is still outside the vertical bounds after trying both top/bottom,
        // center it vertically in the viewport to at least make it visible.
        if (tooltipTop < 0 || tooltipTop + tooltipHeight > viewportHeight) {
            tooltipEl.style.top = `${
                window.scrollY + viewportHeight / 2 - tooltipHeight / 2
            }px`;
        }
    }

    /**
     * Moves to the next tutorial step.
     */
    nextStep() {
        if (this.currentStepIndex < this.steps.length - 1) {
            this.showStep(this.currentStepIndex + 1);
        } else {
            this.endTutorial(); // End if it's the last step
        }
    }

    /**
     * Moves to the previous tutorial step.
     */
    prevStep() {
        if (this.currentStepIndex > 0) {
            this.showStep(this.currentStepIndex - 1);
        }
    }

    /**
     * Ends the tutorial and cleans up.
     */
    endTutorial() {
        this.elements.overlay.classList.remove("opacity-100");
        this.elements.overlay.classList.add("opacity-0", "pointer-events-none");
        this.elements.highlight.classList.add(
            "opacity-0",
            "pointer-events-none"
        );
        this.elements.tooltip.classList.add("opacity-0", "pointer-events-none");
        document.body.classList.remove("overflow-hidden");

        // Reset elements to initial state if needed, or remove them
        // For simplicity, we just hide them and keep them in DOM
    }

    /**
     * Destroys the tutorial instance and removes its DOM elements.
     * Useful if you want to completely remove it from the page.
     */
    destroy() {
        this.endTutorial();
        this.elements.overlay.remove();
        this.elements.highlight.remove();
        this.elements.tooltip.remove();
        window.removeEventListener("resize", () => {
            if (this.elements.overlay.classList.contains("opacity-100")) {
                this.showStep(this.currentStepIndex);
            }
        });
    }
}

// Optionally, expose it globally or via a module export if using build tools
// window.TutorialManager = TutorialManager;
