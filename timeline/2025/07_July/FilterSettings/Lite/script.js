// --- Data Structures ---
// type Param = ObjectA | List[ObjectA]
// type ObjectA = string | ObjectB
// type ObjectB = { type: "search"|"sort"|"group", value: ObjectSearch | ObjectSort | ObjectGroup }
// type ObjectSearch = string | { type: "reg"|"case"|"word", value: string | list[string], field: string }
// type ObjectSort = { field: string, reverse: boolean }
// type ObjectGroup = list[string]

let filterParams = []; // Array to hold the current filter parameters

// --- DOM Elements ---
const filterParamsContainer = document.getElementById(
    "filter-params-container"
);
const addParamBtn = document.getElementById("add-param-btn");
const displayStructureBtn = document.getElementById("display-structure-btn");
const displayModal = document.getElementById("display-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const structureOutput = document.getElementById("structure-output");
const copyClipboardBtn = document.getElementById("copy-clipboard-btn");

// --- Event Listeners ---
addParamBtn.addEventListener("click", addParameterSection);
displayStructureBtn.addEventListener("click", displayFilterStructure);
closeModalBtn.addEventListener("click", () =>
    displayModal.classList.add("hidden")
);
copyClipboardBtn.addEventListener("click", copyStructureToClipboard);

// --- Functions ---

function addParameterSection() {
    const newParamSection = document.createElement("div");
    newParamSection.className =
        "bg-white p-6 rounded-lg shadow-md border border-gray-200";
    newParamSection.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-green-700">Filter Parameter</h3>
            <button class="remove-param-btn text-red-500 hover:text-red-700 focus:outline-none">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label for="param-type" class="block text-sm font-medium text-gray-700 mb-1">Parameter Type</label>
                <select class="param-type w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm">
                    <option value="search">Search</option>
                    <option value="sort">Sort</option>
                    <option value="group">Group</option>
                </select>
            </div>
            <div id="param-details">
                <!-- Parameter specific fields will be loaded here -->
            </div>
        </div>
    `;
    filterParamsContainer.appendChild(newParamSection);

    const selectElement = newParamSection.querySelector(".param-type");
    selectElement.addEventListener("change", handleParamTypeChange);
    // Trigger initial loading of details for the first option
    handleParamTypeChange(selectElement);

    // Add event listener for the remove button
    newParamSection
        .querySelector(".remove-param-btn")
        .addEventListener("click", () => {
            filterParamsContainer.removeChild(newParamSection);
            updateFilterParamsArray(); // Update internal representation
        });
}

function handleParamTypeChange(event) {
    const selectElement = event.target || event; // 'this' is used when called directly
    const paramDetailsDiv = selectElement.closest('div[id="param-details"]');
    const selectedType = selectElement.value;

    let detailsHtml = "";
    if (selectedType === "search") {
        detailsHtml = `
            <label for="search-type" class="block text-sm font-medium text-gray-700 mb-1">Search Detail Type</label>
            <select class="search-detail-type w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm mb-2">
                <option value="simple">Simple Text</option>
                <option value="advanced">Advanced Search</option>
            </select>
            <div class="search-advanced-options hidden">
                <label for="search-field" class="block text-sm font-medium text-gray-700 mb-1">Field</label>
                <input type="text" class="search-field w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm mb-2" placeholder="e.g., 'title'">
                <label for="search-value" class="block text-sm font-medium text-gray-700 mb-1">Search Value</label>
                <input type="text" class="search-value w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm mb-2" placeholder="e.g., 'regex pattern' or comma-separated values">
                <label for="search-condition" class="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select class="search-condition w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm mb-2">
                    <option value="reg">Regular Expression</option>
                    <option value="case">Case-Sensitive</option>
                    <option value="word">Whole Word</option>
                </select>
            </div>
            <div class="search-simple-options">
                 <label for="search-value-simple" class="block text-sm font-medium text-gray-700 mb-1">Search Term</label>
                 <input type="text" class="search-value-simple w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm" placeholder="e.g., 'keyword'">
            </div>
        `;
    } else if (selectedType === "sort") {
        detailsHtml = `
            <label for="sort-field" class="block text-sm font-medium text-gray-700 mb-1">Field</label>
            <input type="text" class="sort-field w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm mb-2" placeholder="e.g., 'name'">
            <div class="flex items-center mb-2">
                <input type="checkbox" id="sort-reverse" class="sort-reverse mr-2 rounded-md text-green-600 focus:ring-green-500">
                <label for="sort-reverse" class="text-sm font-medium text-gray-700">Reverse Order</label>
            </div>
        `;
    } else if (selectedType === "group") {
        detailsHtml = `
            <label for="group-fields" class="block text-sm font-medium text-gray-700 mb-1">Group By Fields (comma-separated)</label>
            <input type="text" class="group-fields w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm" placeholder="e.g., 'category,status'">
        `;
    }
    paramDetailsDiv.innerHTML = detailsHtml;

    // Add event listener for search detail type change
    if (selectedType === "search") {
        const searchDetailSelect = paramDetailsDiv.querySelector(
            ".search-detail-type"
        );
        searchDetailSelect.addEventListener("change", (e) => {
            const advancedOptions = paramDetailsDiv.querySelector(
                ".search-advanced-options"
            );
            const simpleOptions = paramDetailsDiv.querySelector(
                ".search-simple-options"
            );
            if (e.target.value === "advanced") {
                simpleOptions.classList.add("hidden");
                advancedOptions.classList.remove("hidden");
            } else {
                advancedOptions.classList.add("hidden");
                simpleOptions.classList.remove("hidden");
            }
        });
        // Trigger initial display for search type
        searchDetailSelect.dispatchEvent(new Event("change"));
    }

    updateFilterParamsArray(); // Update when type changes
}

function updateFilterParamsArray() {
    filterParams = []; // Clear previous data
    const paramSections = filterParamsContainer.querySelectorAll(
        'div[id="param-details"]'
    );

    paramSections.forEach((section) => {
        const parentDiv = section.closest("div.bg-white");
        const paramTypeSelect = parentDiv.querySelector(".param-type");
        const type = paramTypeSelect.value;

        let paramObject = {};

        if (type === "search") {
            const searchDetailTypeSelect = section.querySelector(
                ".search-detail-type"
            );
            const searchType = searchDetailTypeSelect.value;

            if (searchType === "simple") {
                const searchValueSimple = section.querySelector(
                    ".search-value-simple"
                ).value;
                if (searchValueSimple) {
                    paramObject = searchValueSimple;
                }
            } else {
                // advanced
                const searchField =
                    section.querySelector(".search-field").value;
                const searchValues =
                    section.querySelector(".search-value").value;
                const searchCondition =
                    section.querySelector(".search-condition").value;

                if (searchField && searchValues) {
                    let value = searchValues;
                    if (
                        searchCondition === "reg" &&
                        searchValues.includes(",")
                    ) {
                        value = searchValues
                            .split(",")
                            .map((v) => v.trim())
                            .filter((v) => v);
                    }
                    paramObject = {
                        type: searchCondition,
                        value: value,
                        field: searchField,
                    };
                }
            }
        } else if (type === "sort") {
            const sortField = section.querySelector(".sort-field").value;
            const sortReverse = section.querySelector(".sort-reverse").checked;

            if (sortField) {
                paramObject = {
                    field: sortField,
                    reverse: sortReverse,
                };
            }
        } else if (type === "group") {
            const groupFieldsInput = section.querySelector(".group-fields");
            const groupFields = groupFieldsInput.value
                .split(",")
                .map((f) => f.trim())
                .filter((f) => f);

            if (groupFields.length > 0) {
                paramObject = groupFields;
            }
        }

        if (Object.keys(paramObject).length > 0) {
            filterParams.push({ type: type, value: paramObject });
        }
    });
    console.log("Current filterParams:", filterParams); // For debugging
}

function displayFilterStructure() {
    updateFilterParamsArray(); // Ensure we have the latest data

    const formattedJson = JSON.stringify(filterParams, null, 2);
    structureOutput.textContent = formattedJson;
    displayModal.classList.remove("hidden");
}

function copyStructureToClipboard() {
    const textToCopy = structureOutput.textContent;
    navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
            // Optionally provide feedback to the user
            copyClipboardBtn.textContent = "Copied!";
            copyClipboardBtn.disabled = true;
            setTimeout(() => {
                copyClipboardBtn.textContent = "Copy to Clipboard";
                copyClipboardBtn.disabled = false;
            }, 2000);
        })
        .catch((err) => {
            console.error("Failed to copy: ", err);
            // Optionally display an error message
        });
}

// --- Initial Setup ---
// Add a default parameter when the page loads
addParameterSection();
