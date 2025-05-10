// components/SettingsView.js
export function renderSettingsView() {
    const view = document.createElement("div");
    view.innerHTML = `
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Application Settings</h2>
        <p class="text-gray-600">Configure your application preferences here.</p>
        <div class="mt-4 space-y-4">
            <div>
                <label for="theme-select" class="block text-sm font-medium text-gray-700">Theme:</label>
                <select id="theme-select" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    <option>Light Mode</option>
                    <option>Dark Mode (Not implemented)</option>
                </select>
            </div>
            <div>
                <label class="inline-flex items-center">
                    <input type="checkbox" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" checked>
                    <span class="ml-2 text-gray-700">Enable Notifications</span>
                </label>
            </div>
        </div>
    `;
    return view;
}
