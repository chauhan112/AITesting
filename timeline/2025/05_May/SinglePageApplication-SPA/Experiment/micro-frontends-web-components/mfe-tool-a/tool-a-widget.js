// mfe-tool-a/tool-a-widget.js
class ToolAWidget extends HTMLElement {
    constructor() {
        super();
        // Use Shadow DOM for encapsulation (styles and markup won't leak out or in)
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        // This method is called when the element is inserted into the DOM
        const toolName = this.getAttribute("name") || "Tool A";
        const bgColor = this.getAttribute("background-color") || "#e0f2fe"; // sky-100

        this.shadowRoot.innerHTML = `
            <style>
                :host { /* Styles for the custom element itself */
                    display: block; /* Custom elements are inline by default */
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 15px;
                    background-color: ${bgColor};
                    font-family: Arial, sans-serif;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                h3 {
                    color: #0c4a6e; /* sky-800 */
                    margin-top: 0;
                }
                p {
                    color: #075985; /* sky-700 */
                }
                button {
                    background-color: #38bdf8; /* sky-400 */
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                button:hover {
                    background-color: #0ea5e9; /* sky-500 */
                }
            </style>
            <div class="tool-a-content">
                <h3>${toolName}</h3>
                <p>This is the content for Tool A. It's a self-contained web component!</p>
                <p>Data received: <span id="data-display">None</span></p>
                <button id="tool-a-button">Click me in Tool A</button>
            </div>
        `;

        this.shadowRoot
            .getElementById("tool-a-button")
            .addEventListener("click", () => {
                alert(`Button inside ${toolName} (Web Component) was clicked!`);
                this.shadowRoot.getElementById(
                    "data-display"
                ).textContent = `Clicked at ${new Date().toLocaleTimeString()}`;
            });
    }

    // Optional: Observe attribute changes
    static get observedAttributes() {
        return ["name", "background-color"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // console.log(`Attribute ${name} changed from ${oldValue} to ${newValue}`);
        // You could re-render or update parts of the component if an attribute changes
        if (
            this.shadowRoot &&
            (name === "name" || name === "background-color")
        ) {
            // For simplicity, we'll re-render. For complex components, update selectively.
            this.connectedCallback();
        }
    }
}

// Define the custom element so the browser knows about <tool-a-widget>
customElements.define("tool-a-widget", ToolAWidget);
