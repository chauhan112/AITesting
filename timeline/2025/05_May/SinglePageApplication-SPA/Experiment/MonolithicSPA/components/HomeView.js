// components/HomeView.js
export function renderHomeView() {
    const view = document.createElement("div");
    view.innerHTML = `
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Welcome Home!</h2>
        <p class="text-gray-600">This is the main landing page of your single page application.</p>
        <p class="mt-2 text-gray-600">Navigate using the links above to explore different tools.</p>
        <button id="home-button" class="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Click Me!
        </button>
    `;

    // Example of component-specific logic
    view.querySelector("#home-button").addEventListener("click", () => {
        alert("Home button clicked!");
    });

    return view;
}
