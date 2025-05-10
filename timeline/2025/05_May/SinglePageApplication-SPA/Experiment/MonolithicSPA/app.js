// app.js
import { handleRouteChange } from "./router.js";

// Listen for hash changes to handle routing
window.addEventListener("hashchange", handleRouteChange);

// Initial load: Handle the route based on the current URL hash
window.addEventListener("DOMContentLoaded", () => {
    handleRouteChange(); // Render initial view based on current hash or default
});
