import {
    getTreeData,
    setTreeData,
    setSelectedNodeId,
    getNodeIdCounter,
    setNodeIdCounter,
    calculateMaxId,
} from "./state.js";
import { calculatePositions } from "./layout.js";
import { initRenderer, renderTree, renderExplorer } from "./renderer.js";
import { initPanZoom } from "./panZoom.js";
import { initUI, updateEditPanel } from "./ui.js";
import { initEventHandlers, uiRequiresRender } from "./eventHandlers.js"; // Import the new callback

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const svgCanvas = document.getElementById("treeCanvas");
    const treeContainer = document.getElementById("treeContainer"); // For pan/zoom
    const explorerDiv = document.getElementById("explorer");
    const nodeEditPanel = document.getElementById("nodeEditPanel");
    const selectedNodeInfo = document.getElementById("selectedNodeInfo");
    const nodeTextInput = document.getElementById("nodeText");
    const nodeColorInput = document.getElementById("nodeColor");
    const applyColorToChildrenBtn = document.getElementById(
        "applyColorToChildren"
    );
    const nodeFontSizeInput = document.getElementById("nodeFontSize");
    const nodeNoteInput = document.getElementById("nodeNote");
    const addChildNodeBtn = document.getElementById("addChildNode");
    const deleteNodeBtn = document.getElementById("deleteNode");
    const addRootNodeBtn = document.getElementById("addRootNode");
    const saveTreeBtn = document.getElementById("saveTree");
    const loadTreeBtn = document.getElementById("loadTree");
    const clearTreeBtn = document.getElementById("clearTree");
    const layoutDirectionSelect = document.getElementById("layoutDirection");
    const tooltipElement = document.getElementById("tooltip");

    // The main render cycle function
    function fullRenderCycle() {
        calculatePositions(); // Calculate all node x, y positions
        renderTree(getTreeData());
        renderExplorer(getTreeData());
        updateEditPanel();
    }

    // Initialization
    initRenderer(svgCanvas, treeContainer, explorerDiv, (nodeId) => {
        // Pass select node callback to renderer for explorer
        setSelectedNodeId(nodeId);
        fullRenderCycle();
    });
    initPanZoom(svgCanvas, treeContainer);
    initUI({
        nodeEditPanel,
        selectedNodeInfo,
        nodeTextInput,
        nodeColorInput,
        applyColorToChildrenBtn,
        nodeFontSizeInput,
        nodeNoteInput,
        tooltipElement,
    });
    // Pass the fullRenderCycle to eventHandlers so it can trigger updates
    initEventHandlers(
        {
            svgCanvas,
            addRootNodeBtn,
            addChildNodeBtn,
            deleteNodeBtn,
            saveTreeBtn,
            loadTreeBtn,
            clearTreeBtn,
            layoutDirectionSelect,
            // UI elements (not strictly needed by eventHandlers directly, but good for consistency or future use)
            nodeEditPanel,
            selectedNodeInfo,
            nodeTextInput,
            nodeColorInput,
            applyColorToChildrenBtn,
            nodeFontSizeInput,
            nodeNoteInput,
        },
        fullRenderCycle
    );

    // Load initial data or default
    const savedTreeData = localStorage.getItem("treeMakerAppTree");
    const savedCounter = localStorage.getItem("treeMakerAppNodeIdCounter");
    if (savedTreeData) {
        setTreeData(JSON.parse(savedTreeData));
        setNodeIdCounter(
            savedCounter
                ? parseInt(savedCounter)
                : calculateMaxId(getTreeData()) + 1
        );
    } else {
        // addNode("Root"); // Example initial node
        // if (getTreeData().length > 0) setSelectedNodeId(getTreeData()[0].id);
    }

    fullRenderCycle(); // Initial render
});
