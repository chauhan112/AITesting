document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const appContent = document.getElementById("app-content");
    const sidebar = document.getElementById("sidebar");
    const menuToggleBtn = document.getElementById("menu-toggle-btn");
    const menuToggleIcon = document.getElementById("menu-toggle-icon"); // This is the span container
    const sidebarCloseBtnMobile = document.getElementById(
        "sidebar-close-btn-mobile"
    );
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    const navLinks = document.querySelectorAll("#sidebar-nav .nav-link");
    const currentYearSpan = document.getElementById("current-year");

    // --- State ---
    let isDesktopSidebarOpen = true;
    let isMobileSidebarVisible = false;

    // --- Page Content (Templates) ---
    const pageContents = {
        home: `<h1 class="text-3xl font-bold mb-4 text-gray-800">Welcome Home!</h1><p class="text-gray-600">This is the home page. The sidebar is collapsible on all screen sizes!</p>`,
        about: `<h1 class="text-3xl font-bold mb-4 text-gray-800">About Us</h1><p class="text-gray-600">We love building with Vanilla JS and Tailwind CSS.</p>`,
        services: `<h1 class="text-3xl font-bold mb-4 text-gray-800">Our Services</h1><ul class="list-disc list-inside text-gray-600"><li>Web Development</li><li>UI/UX Design</li><li>Consulting</li></ul>`,
        contact: `<h1 class="text-3xl font-bold mb-4 text-gray-800">Contact Us</h1><p class="text-gray-600">Reach out to us via the internet.</p>`,
        notFound: `<h1 class="text-3xl font-bold mb-4 text-red-600">404 - Not Found</h1><p class="text-gray-600">Sorry, the page you are looking for does not exist.</p>`,
    };

    // --- Router ---
    function router() {
        const path = window.location.hash.substring(1) || "/";
        // console.log("Navigating to:", window.location.hash); // Debugging log
        let pageKey = "notFound";
        if (path === "/") pageKey = "home";
        else if (path === "/about") pageKey = "about";
        else if (path === "/services") pageKey = "services";
        else if (path === "/contact") pageKey = "contact";

        appContent.innerHTML = pageContents[pageKey] || pageContents.notFound;
        updateActiveLink(path);

        if (isMobileSidebarVisible) {
            hideMobileSidebar();
        }
    }

    // --- Helper to set Lucide icon in the toggle button ---
    function setMenuToggleLucideIcon(iconName) {
        if (!lucide || !lucide.createIcon) {
            console.error("Lucide library not available yet.");
            // Fallback or simply wait if lucide is not yet loaded
            // For this setup, lucide.createIcons() should have run.
            // lucide.createIcon is available after the script loads.
            menuToggleIcon.innerHTML = iconName === "x" ? "×" : "☰"; // Simple text fallback
            return;
        }
        menuToggleIcon.innerHTML = ""; // Clear previous icon
        const iconElement = lucide.createIcon(iconName);
        // Lucide icons default to 24x24 (w-6 h-6 from Tailwind is 1.5rem)
        // and stroke-width 2. No extra classes needed for size if w-6 h-6 is desired.
        menuToggleIcon.appendChild(iconElement);
    }

    // --- Sidebar Management ---
    function applyDesktopSidebarState() {
        if (isDesktopSidebarOpen) {
            body.classList.remove("sidebar-desktop-closed");
            body.classList.add("sidebar-desktop-open");
            setMenuToggleLucideIcon("x"); // Lucide 'x' icon
        } else {
            body.classList.remove("sidebar-desktop-open");
            body.classList.add("sidebar-desktop-closed");
            setMenuToggleLucideIcon("menu"); // Lucide 'menu' icon
        }
    }

    function showMobileSidebar() {
        sidebar.classList.remove("-translate-x-full");
        sidebar.classList.add("translate-x-0");
        sidebarOverlay.classList.remove("hidden");
        setMenuToggleLucideIcon("x");
        isMobileSidebarVisible = true;
        menuToggleBtn.setAttribute("aria-expanded", "true");
    }

    function hideMobileSidebar() {
        sidebar.classList.add("-translate-x-full");
        sidebar.classList.remove("translate-x-0");
        sidebarOverlay.classList.add("hidden");
        setMenuToggleLucideIcon("menu");
        isMobileSidebarVisible = false;
        menuToggleBtn.setAttribute("aria-expanded", "false");
    }

    menuToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isMobileView = window.innerWidth < 768;

        if (isMobileView) {
            if (isMobileSidebarVisible) {
                hideMobileSidebar();
            } else {
                showMobileSidebar();
            }
        } else {
            isDesktopSidebarOpen = !isDesktopSidebarOpen;
            applyDesktopSidebarState();
        }
    });

    sidebarCloseBtnMobile.addEventListener("click", hideMobileSidebar);
    sidebarOverlay.addEventListener("click", hideMobileSidebar);

    appContent.addEventListener("click", () => {
        if (window.innerWidth < 768 && isMobileSidebarVisible) {
            hideMobileSidebar();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            window.innerWidth < 768 &&
            isMobileSidebarVisible
        ) {
            hideMobileSidebar();
        }
    });

    // --- Active Link Styling ---
    function updateActiveLink(currentPath) {
        navLinks.forEach((link) => {
            const linkPath = link.hash;
            const normalizedCurrentPath = currentPath.startsWith("#")
                ? currentPath
                : `#${currentPath}`;

            if (
                linkPath === normalizedCurrentPath ||
                (currentPath === "/" && linkPath === "#/")
            ) {
                link.classList.add(
                    "bg-gray-900",
                    "text-white",
                    "font-semibold",
                    "active-link"
                );
                link.classList.remove("hover:bg-gray-700"); // Keep hover:text-white from general style
            } else {
                link.classList.remove(
                    "bg-gray-900",
                    "text-white",
                    "font-semibold",
                    "active-link"
                );
                link.classList.add("hover:bg-gray-700");
            }
        });
    }

    // --- Responsive Handling & Initial Setup ---
    function handleScreenChanges() {
        const isMobileView = window.innerWidth < 768;

        if (isMobileView) {
            body.classList.remove(
                "sidebar-desktop-open",
                "sidebar-desktop-closed"
            );
            appContent.style.marginLeft = "";
            sidebar.classList.add(
                "fixed",
                "top-16",
                "left-0",
                "h-[calc(100vh-4rem)]",
                "w-64",
                "-translate-x-full"
            );
            sidebar.classList.remove("md:relative", "md:translate-x-0");

            if (isMobileSidebarVisible) {
                showMobileSidebar();
            } else {
                hideMobileSidebar();
            }
        } else {
            sidebar.classList.remove(
                "fixed",
                "top-16",
                "left-0",
                "h-[calc(100vh-4rem)]",
                "w-64",
                "-translate-x-full",
                "translate-x-0"
            );
            sidebar.classList.add("md:relative", "md:translate-x-0");
            sidebarOverlay.classList.add("hidden");
            isMobileSidebarVisible = false;
            menuToggleBtn.setAttribute("aria-expanded", "true");
            applyDesktopSidebarState();
        }
    }

    // --- Initialize ---
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    window.addEventListener("hashchange", router);
    window.addEventListener("load", () => {
        router();
        // Lucide icons in sidebar and mobile close button are initialized by lucide.createIcons()
        // called from HTML after DOMContentLoaded.
        // The menu toggle icon needs to be set after we know the initial state.
        handleScreenChanges(); // Set initial sidebar state which also sets toggle icon
    });

    let resizeDebounceTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeDebounceTimer);
        resizeDebounceTimer = setTimeout(handleScreenChanges, 100);
    });
});
