document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const itemInput = document.getElementById("itemInput");
    const addItemBtn = document.getElementById("addItemBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const searchInput = document.getElementById("searchInput");
    const sortNameAscBtn = document.getElementById("sortNameAscBtn");
    const sortNameDescBtn = document.getElementById("sortNameDescBtn");
    const itemsPerPageSelect = document.getElementById("itemsPerPageSelect"); // New
    const itemList = document.getElementById("itemList");
    const paginationContainer = document.getElementById("paginationContainer"); // New

    // Data Storage
    let items = []; // Array to store our list items
    let editingItemId = null; // To track which item is currently being edited
    let currentSearchTerm = ""; // To store the current search input
    let currentSortDirection = null; // 'asc' or 'desc' for name sorting

    // Pagination State
    let currentPage = 1;
    let itemsPerPage = parseInt(itemsPerPageSelect.value); // Get initial value from select

    // --- Helper Functions ---

    // Generate a unique ID (simple timestamp for this example)
    function generateId() {
        return Date.now().toString();
    }

    // Save items to Local Storage (optional, for persistence)
    function saveItems() {
        localStorage.setItem("crudItems", JSON.stringify(items));
    }

    // Load items from Local Storage (optional)
    function loadItems() {
        const storedItems = localStorage.getItem("crudItems");
        if (storedItems) {
            items = JSON.parse(storedItems);
        } else {
            // Add some initial dummy data if no items are found
            items = [
                { id: generateId(), name: "Learn Vanilla JS" },
                { id: generateId(), name: "Master Tailwind CSS" },
                { id: generateId(), name: "Build a Portfolio" },
                { id: generateId(), name: "Develop a REST API" },
                { id: generateId(), name: "Explore new frameworks" },
                { id: generateId(), name: "Refactor old code" },
                { id: generateId(), name: "Write documentation" },
                { id: generateId(), name: "Attend tech meetups" },
                { id: generateId(), name: "Optimize database queries" },
                { id: generateId(), name: "Deploy to production" },
                { id: generateId(), name: "Create a personal website" },
                { id: generateId(), name: "Learn a new programming language" },
                { id: generateId(), name: "Contribute to open source" },
                { id: generateId(), name: "Fix critical bugs" },
                { id: generateId(), name: "Improve UI/UX design" },
            ];
        }
        renderItems();
    }

    // --- Rendering Functions ---

    function renderItems() {
        itemList.innerHTML = ""; // Clear existing list

        // 1. Filter items based on search term
        let filteredItems = [...items]; // Create a copy to filter/sort
        if (currentSearchTerm) {
            const lowerCaseSearchTerm = currentSearchTerm.toLowerCase();
            filteredItems = filteredItems.filter((item) =>
                item.name.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        // 2. Sort filtered items
        if (currentSortDirection === "asc") {
            filteredItems.sort((a, b) => a.name.localeCompare(b.name));
        } else if (currentSortDirection === "desc") {
            filteredItems.sort((a, b) => b.name.localeCompare(a.name));
        }

        // 3. Calculate pagination properties
        const totalItemsDisplayed = filteredItems.length;
        const totalPages = Math.ceil(totalItemsDisplayed / itemsPerPage);

        // Adjust currentPage if it's out of bounds after filtering/sorting
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0) {
            currentPage = 1; // If no items, reset to page 1
        }
        // Ensure currentPage is at least 1
        currentPage = Math.max(1, currentPage);

        // 4. Get items for the current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

        // 5. Render the list items
        if (
            itemsToDisplay.length === 0 &&
            items.length > 0 &&
            currentSearchTerm
        ) {
            const li = document.createElement("li");
            li.className =
                "bg-yellow-100 text-yellow-800 p-3 rounded-lg text-center";
            li.textContent = "No matching items found for your search.";
            itemList.appendChild(li);
        } else if (itemsToDisplay.length === 0 && items.length === 0) {
            const li = document.createElement("li");
            li.className =
                "bg-blue-100 text-blue-800 p-3 rounded-lg text-center";
            li.textContent = "Your list is empty. Add some items!";
            itemList.appendChild(li);
        } else {
            itemsToDisplay.forEach((item) => {
                const li = document.createElement("li");
                li.className =
                    "flex items-center justify-between bg-white p-3 rounded-lg shadow-sm";
                li.setAttribute("data-id", item.id); // Store ID on the element

                li.innerHTML = `
                    <span class="text-gray-800 text-lg">${item.name}</span>
                    <div class="flex space-x-2">
                        <button class="edit-btn bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-200 text-sm" data-id="${item.id}">Edit</button>
                        <button class="delete-btn bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200 text-sm" data-id="${item.id}">Delete</button>
                    </div>
                `;
                itemList.appendChild(li);
            });
        }

        // 6. Render pagination controls
        renderPagination(totalPages);

        saveItems(); // Save items after each render
    }

    function renderPagination(totalPages) {
        paginationContainer.innerHTML = ""; // Clear existing pagination

        if (totalPages <= 1) {
            return; // No need for pagination if only one or zero pages
        }

        // Previous Button
        const prevButton = document.createElement("button");
        prevButton.textContent = "Previous";
        prevButton.className = `px-4 py-2 rounded-lg transition duration-200 text-sm ${
            currentPage === 1
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
        }`;
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderItems();
            }
        });
        paginationContainer.appendChild(prevButton);

        // Page Number Buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement("button");
            pageButton.textContent = i;
            pageButton.className = `px-4 py-2 rounded-lg transition duration-200 text-sm ${
                i === currentPage
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`;
            pageButton.addEventListener("click", () => {
                currentPage = i;
                renderItems();
            });
            paginationContainer.appendChild(pageButton);
        }

        // Next Button
        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.className = `px-4 py-2 rounded-lg transition duration-200 text-sm ${
            currentPage === totalPages
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
        }`;
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderItems();
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    // --- CRUD Operations ---

    // Add/Update Item
    function addOrUpdateItem() {
        const itemName = itemInput.value.trim();
        if (!itemName) {
            alert("Please enter an item name.");
            return;
        }

        if (editingItemId) {
            // Update existing item
            const itemToUpdate = items.find(
                (item) => item.id === editingItemId
            );
            if (itemToUpdate) {
                itemToUpdate.name = itemName;
            }
            editingItemId = null; // Reset editing state
            addItemBtn.textContent = "Add Item";
            addItemBtn.classList.remove("bg-green-600", "hover:bg-green-700");
            addItemBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
            cancelEditBtn.classList.add("hidden");
        } else {
            // Add new item
            const newItem = { id: generateId(), name: itemName };
            items.push(newItem);
            // After adding, go to the last page if adding implies a new page
            const totalItemsAfterAdd = items.length;
            const newTotalPages = Math.ceil(totalItemsAfterAdd / itemsPerPage);
            currentPage = newTotalPages; // Go to the last page to see the newly added item
        }

        itemInput.value = ""; // Clear input
        renderItems(); // Re-render the list
    }

    // Delete Item
    function deleteItem(id) {
        if (confirm("Are you sure you want to delete this item?")) {
            items = items.filter((item) => item.id !== id);
            // After deleting, ensure currentPage is still valid
            renderItems(); // Re-render the list (which will adjust currentPage if needed)
        }
    }

    // Edit Item (pre-populate form)
    function editItem(id) {
        const itemToEdit = items.find((item) => item.id === id);
        if (itemToEdit) {
            itemInput.value = itemToEdit.name;
            editingItemId = id; // Set editing state
            addItemBtn.textContent = "Save Changes";
            addItemBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
            addItemBtn.classList.add("bg-green-600", "hover:bg-green-700");
            cancelEditBtn.classList.remove("hidden");
            itemInput.focus(); // Focus on the input field
        }
    }

    // Cancel Edit
    function cancelEdit() {
        editingItemId = null;
        itemInput.value = "";
        addItemBtn.textContent = "Add Item";
        addItemBtn.classList.remove("bg-green-600", "hover:bg-green-700");
        addItemBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
        cancelEditBtn.classList.add("hidden");
    }

    // --- Event Listeners ---

    addItemBtn.addEventListener("click", addOrUpdateItem);
    cancelEditBtn.addEventListener("click", cancelEdit);

    // Allow adding/saving with Enter key
    itemInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            addOrUpdateItem();
        }
    });

    // Event delegation for Edit and Delete buttons on the item list
    itemList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const id = e.target.getAttribute("data-id");
            deleteItem(id);
        } else if (e.target.classList.contains("edit-btn")) {
            const id = e.target.getAttribute("data-id");
            editItem(id);
        }
    });

    // Search functionality
    searchInput.addEventListener("input", (e) => {
        currentSearchTerm = e.target.value;
        currentPage = 1; // Reset to first page on new search
        renderItems(); // Re-render to apply filter
    });

    // Sort functionality
    sortNameAscBtn.addEventListener("click", () => {
        currentSortDirection = "asc";
        currentPage = 1; // Reset to first page on new sort
        renderItems();
    });

    sortNameDescBtn.addEventListener("click", () => {
        currentSortDirection = "desc";
        currentPage = 1; // Reset to first page on new sort
        renderItems();
    });

    // Items per page functionality (new)
    itemsPerPageSelect.addEventListener("change", (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1; // Reset to first page when changing items per page
        renderItems();
    });

    // --- Initial Load ---
    loadItems();
});
