// mfe-tool-b/tool-b-display.js
class ToolBDisplay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._counter = 0; // Internal state
    }

    connectedCallback() {
        const title = this.getAttribute("title") || "Tool B Display";

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    border: 2px dashed #15803d; /* green-700 */
                    padding: 15px;
                    font-family: 'Courier New', Courier, monospace;
                    background-color: #f0fdf4; /* green-50 */
                    border-radius: 6px;
                }
                h4 {
                    color: #166534; /* green-800 */
                    margin-top: 0;
                    border-bottom: 1px solid #15803d;
                    padding-bottom: 5px;
                }
                .counter-value {
                    font-weight: bold;
                    color: #16a34a; /* green-600 */
                }
                button {
                    margin-top: 10px;
                    background-color: #22c55e; /* green-500 */
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #16a34a; /* green-600 */
                }
            </style>
            <div class="tool-b-content">
                <h4>${title}</h4>
                <p>This is another isolated web component, Tool B.</p>
                <p>Counter: <span class="counter-value">${this._counter}</span></p>
                <button id="increment-button">Increment</button>
            </div>
        `;

        this._updateCounterDisplay = () => {
            this.shadowRoot.querySelector(".counter-value").textContent =
                this._counter;
        };

        this.shadowRoot
            .getElementById("increment-button")
            .addEventListener("click", () => {
                this._counter++;
                this._updateCounterDisplay();
                // You can also dispatch an event if the shell needs to know
                this.dispatchEvent(
                    new CustomEvent("counterIncremented", {
                        bubbles: true, // Allows event to bubble up through the DOM
                        composed: true, // Allows event to cross Shadow DOM boundaries
                        detail: { count: this._counter },
                    })
                );
            });
    }
}

customElements.define("tool-b-display", ToolBDisplay);
