// router.js
import { renderHomeView } from "./components/HomeView.js";
import { renderDataAnalyzerView } from "./components/DataAnalyzerView.js";
import { renderSettingsView } from "./components/SettingsView.js";

const routes = {
    "/": renderHomeView,
    "/data-analyzer": renderDataAnalyzerView,
    "/settings": renderSettingsView,
};

const contentArea = document.getElementById("content-area");
const navLinks = document.querySelectorAll(".nav-link");

function renderContent(path) {
    // Clear previous content
    contentArea.innerHTML = "";

    // Find the component function for the current path
    const renderFunction = routes[path] || routes["/"]; // Default to home if path not found

    // Render the component and append it to the content area
    const componentElement = renderFunction();
    contentArea.appendChild(componentElement);

    // Update active link
    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${path}`) {
            link.classList.add("active");
        }
    });
}

export function handleRouteChange() {
    const path = window.location.hash.slice(1) || "/"; // Get path from hash, default to '/'
    renderContent(path);
}
