// components/DataAnalyzerView.js
export function renderDataAnalyzerView() {
    const view = document.createElement("div");
    view.innerHTML = `
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Data Analyzer Tool</h2>
        <p class="text-gray-600">This is where your data analysis tool would live.</p>
        <div class="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
            <label for="data-input" class="block text-sm font-medium text-gray-700">Enter Data:</label>
            <input type="text" id="data-input" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Some data here...">
            <button class="mt-2 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                Process Data
            </button>
        </div>
    `;
    return view;
}
