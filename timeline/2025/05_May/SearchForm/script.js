document.addEventListener("DOMContentLoaded", () => {
    // 1. Get DOM Elements
    const searchInput = document.getElementById("searchInput");
    const caseSensitiveCheckbox = document.getElementById("caseSensitive");
    const regexSearchCheckbox = document.getElementById("regexSearch");
    const searchBtn = document.getElementById("searchBtn");
    const resultsDiv = document.getElementById("results");

    // 2. Dummy Data (Array of strings to search within)
    const data = [
        "Apple",
        "Banana",
        "Cherry",
        "Date",
        "Elderberry",
        "Fig",
        "Grape",
        "apple pie",
        "Red Apple",
        "Green Grapes",
        "blueberry",
        "Orange",
        "pineapple",
    ];

    // Helper function to escape special regex characters if not using regex mode
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the matched substring
    }

    // 3. Search Function
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        const isCaseSensitive = caseSensitiveCheckbox.checked;
        const useRegex = regexSearchCheckbox.checked;

        resultsDiv.innerHTML = ""; // Clear previous results

        if (!searchTerm) {
            // If search term is empty, display all data by default,
            // or an "empty search" message. Here, we'll show all data.
            if (!useRegex) {
                // If regex is active, an empty regex matches everything, so let it run
                resultsDiv.innerHTML =
                    '<p class="text-gray-500 mb-2">Displaying all items (empty search term).</p>';
                data.forEach((item) => {
                    const p = document.createElement("p");
                    p.className =
                        "p-2 bg-white border-b border-gray-100 last:border-b-0 text-gray-800";
                    p.textContent = item;
                    resultsDiv.appendChild(p);
                });
                return;
            }
        }

        let flags = "";
        if (!isCaseSensitive) {
            flags += "i"; // 'i' for case-insensitive
        }

        let pattern;
        try {
            if (useRegex) {
                // If regex is enabled, use the search term directly as the pattern
                pattern = new RegExp(searchTerm, flags);
            } else {
                // If regex is NOT enabled, escape the search term to treat it literally
                pattern = new RegExp(escapeRegExp(searchTerm), flags);
            }
        } catch (e) {
            // Catch invalid regex patterns
            resultsDiv.innerHTML = `<p class="text-red-500 font-semibold">Error: Invalid Regex Pattern - ${e.message}</p>`;
            return;
        }

        const filteredData = data.filter((item) => pattern.test(item));

        if (filteredData.length === 0) {
            resultsDiv.innerHTML =
                '<p class="text-gray-500 text-center">No results found.</p>';
        } else {
            filteredData.forEach((item) => {
                const p = document.createElement("p");
                p.className =
                    "p-2 bg-white border-b border-gray-100 last:border-b-0 text-gray-800";
                p.textContent = item;
                resultsDiv.appendChild(p);
            });
        }
    }

    // 4. Event Listeners
    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            performSearch();
        }
    });
    caseSensitiveCheckbox.addEventListener("change", performSearch);
    regexSearchCheckbox.addEventListener("change", performSearch);

    // Initial load: Perform a search (e.g., with empty term to show all)
    performSearch();
});
