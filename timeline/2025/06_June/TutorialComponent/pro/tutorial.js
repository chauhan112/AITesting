// tutorial.js

class Tutorial {
    constructor(steps = []) {
        this.steps = steps;
        this.currentStepIndex = 0;
        this.isShown = false;

        // Find the DOM elements for the tutorial
        this.container = document.getElementById("tutorial-container");
        this.tooltip = document.getElementById("tutorial-tooltip");
        this.titleElement = document.getElementById("tooltip-title");
        this.descriptionElement = document.getElementById(
            "tooltip-description"
        );

        this.prevButton = document.getElementById("tutorial-prev");
        this.nextButton = document.getElementById("tutorial-next");
        this.skipButton = document.getElementById("tutorial-skip");

        // Bind event listeners
        this.nextButton.addEventListener("click", () => this.nextStep());
        this.prevButton.addEventListener("click", () => this.prevStep());
        this.skipButton.addEventListener("click", () => this.end());

        // Allow closing with the Escape key
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isShown) {
                this.end();
            }
        });
    }

    start() {
        // Don't start if it has been seen before (using localStorage)
        if (
            localStorage.getItem("tutorialSeen") === "true" ||
            this.steps.length === 0
        ) {
            return;
        }

        this.isShown = true;
        this.container.classList.remove("hidden");
        this.showStep(this.currentStepIndex);
    }

    end() {
        this.isShown = false;
        // Clean up the last highlighted element
        if (this.currentStep) {
            this.currentStep.targetElement.classList.remove(
                "tutorial-highlight-target"
            );
        }

        this.container.classList.add("hidden");
        localStorage.setItem("tutorialSeen", "true");
    }

    nextStep() {
        if (this.currentStepIndex < this.steps.length - 1) {
            this.currentStepIndex++;
            this.showStep(this.currentStepIndex);
        } else {
            this.end();
        }
    }

    prevStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.showStep(this.currentStepIndex);
        }
    }

    showStep(index) {
        // Clean up previous step's highlight
        if (this.currentStep) {
            this.currentStep.targetElement.classList.remove(
                "tutorial-highlight-target"
            );
        }

        const step = this.steps[index];
        const targetElement = document.getElementById(step.elementId);

        if (!targetElement) {
            console.error(
                `Tutorial step ${index}: Element with ID "${step.elementId}" not found.`
            );
            this.end();
            return;
        }

        this.currentStep = { ...step, targetElement };

        // Update tooltip content
        this.titleElement.textContent = step.title;
        this.descriptionElement.textContent = step.description;

        // Highlight the new target
        targetElement.classList.add("tutorial-highlight-target");

        // Scroll the element into view smoothly
        targetElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });

        // Wait for scroll to finish before positioning tooltip
        setTimeout(() => {
            this.positionTooltip();
        }, 300); // 300ms is a safe delay for smooth scrolling

        // Update button states
        this.updateButtons();
    }

    positionTooltip() {
        const targetRect =
            this.currentStep.targetElement.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const position = this.currentStep.position || "bottom"; // Default to bottom

        let top, left;

        switch (position) {
            case "top":
                top = targetRect.top - tooltipRect.height - 15;
                left =
                    targetRect.left +
                    targetRect.width / 2 -
                    tooltipRect.width / 2;
                break;
            case "bottom":
                top = targetRect.bottom + 15;
                left =
                    targetRect.left +
                    targetRect.width / 2 -
                    tooltipRect.width / 2;
                break;
            case "left":
                top =
                    targetRect.top +
                    targetRect.height / 2 -
                    tooltipRect.height / 2;
                left = targetRect.left - tooltipRect.width - 15;
                break;
            case "right":
                top =
                    targetRect.top +
                    targetRect.height / 2 -
                    tooltipRect.height / 2;
                left = targetRect.right + 15;
                break;
        }

        // Prevent tooltip from going off-screen
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top < 10) top = 10;
        if (top + tooltipRect.height > window.innerHeight) {
            top = window.innerHeight - tooltipRect.height - 10;
        }

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
    }

    updateButtons() {
        // Handle Prev button
        this.prevButton.disabled = this.currentStepIndex === 0;
        this.prevButton.classList.toggle(
            "opacity-50",
            this.currentStepIndex === 0
        );

        // Handle Next button
        if (this.currentStepIndex === this.steps.length - 1) {
            this.nextButton.textContent = "Finish";
        } else {
            this.nextButton.textContent = "Next";
        }
    }
}
