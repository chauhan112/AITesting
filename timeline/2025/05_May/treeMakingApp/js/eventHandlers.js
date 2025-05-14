import {
    getSelectedNodeId,
    setSelectedNodeId,
    findNodeById,
    addNode,
    deleteNode,
    updateNodeProperties,
    setCurrentLayout,
    getTreeData,
    setTreeData,
    getNodeIdCounter,
    setNodeIdCounter,
    calculateMaxId,
} from "./state.js";
import { renderTree, renderExplorer } from "./renderer.js";
import { calculatePositions } from "./layout.js";
import { updateEditPanel, showTooltip, hideTooltip } from "./ui.js";
import { screenToSVGCoords } from "./panZoom.js"; // Import the coordinate conversion utility

let svgCanvasElement, treeCanvasRect; // Store canvas and its bounding rect

// This function will be called from main.js to trigger a full re-render cycle
let fullRenderCycleCallback = () => {};

export function initEventHandlers(elements, renderCycle) {
    fullRenderCycleCallback = renderCycle;
    svgCanvasElement = elements.svgCanvas; // Keep a reference
    treeCanvasRect = svgCanvasElement.getBoundingClientRect(); // Get initial rect

    // Update rect on resize/scroll if needed, or re-fetch in handlers
    window.addEventListener("resize", () => {
        if (svgCanvasElement)
            treeCanvasRect = svgCanvasElement.getBoundingClientRect();
    });

    elements.svgCanvas.addEventListener("click", handleCanvasClick);
    elements.svgCanvas.addEventListener("mouseover", handleCanvasMouseOver);
    elements.svgCanvas.addEventListener("mouseout", handleCanvasMouseOut);
    // Note: Pan/Zoom listeners are in panZoom.js

    elements.addRootNodeBtn.addEventListener("click", handleAddRootNode);
    elements.addChildNodeBtn.addEventListener("click", handleAddChildNode);
    elements.deleteNodeBtn.addEventListener("click", handleDeleteNode);

    elements.saveTreeBtn.addEventListener("click", handleSaveTree);
    elements.loadTreeBtn.addEventListener("click", handleLoadTree);
    elements.clearTreeBtn.addEventListener("click", handleClearTree);
    elements.layoutDirectionSelect.addEventListener(
        "change",
        handleLayoutChange
    );

    // UI panel changes will trigger re-render via callbacks from ui.js if needed
    // For now, we assume main.js handles re-rendering after UI interactions
}

function handleCanvasClick(e) {
    let target = e.target;
    let nodeId = null;
    let collapseId = null;

    // Traverse up to find the group or the interactive element
    while (target && target !== svgCanvasElement) {
        if (target.dataset && target.dataset.id) {
            nodeId = target.dataset.id;
            break;
        }
        if (target.dataset && target.dataset.collapseId) {
            collapseId = target.dataset.collapseId;
            break;
        }
        target = target.parentNode;
    }

    if (nodeId) {
        setSelectedNodeId(nodeId);
    } else if (collapseId) {
        const nodeToCollapse = findNodeById(collapseId);
        if (nodeToCollapse) {
            updateNodeProperties(collapseId, {
                isCollapsed: !nodeToCollapse.isCollapsed,
            });
        }
    } else {
        // Clicked on canvas background, deselect
        // setSelectedNodeId(null); // Optional: deselect on background click
    }
    fullRenderCycleCallback(); // Always re-render after a click interaction
}

function handleCanvasMouseOver(e) {
    if (!svgCanvasElement)
        treeCanvasRect = document
            .getElementById("treeCanvas")
            .getBoundingClientRect();

    let target = e.target;
    while (target && target !== svgCanvasElement) {
        if (target.dataset && target.dataset.id) {
            const node = findNodeById(target.dataset.id);
            if (node) showTooltip(node, e, treeCanvasRect);
            return;
        }
        target = target.parentNode;
    }
}

function handleCanvasMouseOut(e) {
    hideTooltip();
}

function handleAddRootNode() {
    const currentTree = getTreeData();
    if (
        currentTree.length > 0 &&
        !confirm("This will replace the current tree. Continue?")
    ) {
        return;
    }
    const root = addNode("Root Node", null);
    if (root) setSelectedNodeId(root.id);
    fullRenderCycleCallback();
}

function handleAddChildNode() {
    const parentId = getSelectedNodeId();
    if (parentId) {
        const newChild = addNode("Child Node", parentId);
        if (newChild) {
            const parent = findNodeById(parentId);
            if (parent && parent.isCollapsed) {
                updateNodeProperties(parentId, { isCollapsed: false }); // Auto-expand
            }
            setSelectedNodeId(newChild.id);
        }
    } else {
        alert("Please select a parent node first, or add a root node.");
    }
    fullRenderCycleCallback();
}

function handleDeleteNode() {
    const nodeId = getSelectedNodeId();
    if (
        nodeId &&
        confirm(
            "Are you sure you want to delete this node and all its children?"
        )
    ) {
        deleteNode(nodeId); // This also deselects if needed
        // selectedNodeId is handled by deleteNode if it was the one deleted
    }
    fullRenderCycleCallback();
}

function handleSaveTree() {
    localStorage.setItem("treeMakerAppTree", JSON.stringify(getTreeData()));
    localStorage.setItem(
        "treeMakerAppNodeIdCounter",
        getNodeIdCounter().toString()
    );
    alert("Tree saved to local storage!");
}

function handleLoadTree() {
    const savedTree = localStorage.getItem("treeMakerAppTree");
    const savedCounter = localStorage.getItem("treeMakerAppNodeIdCounter");
    if (savedTree) {
        setTreeData(JSON.parse(savedTree));
        const counter = savedCounter
            ? parseInt(savedCounter)
            : calculateMaxId(getTreeData()) + 1;
        setNodeIdCounter(counter);
        setSelectedNodeId(null);
        alert("Tree loaded from local storage!");
    } else {
        alert("No saved tree found in local storage.");
    }
    fullRenderCycleCallback();
}

function handleClearTree() {
    if (confirm("Are you sure you want to clear the entire tree?")) {
        setTreeData([]);
        setSelectedNodeId(null);
        setNodeIdCounter(0);
        localStorage.removeItem("treeMakerAppTree");
        localStorage.removeItem("treeMakerAppNodeIdCounter");
    }
    fullRenderCycleCallback();
}

function handleLayoutChange(e) {
    setCurrentLayout(e.target.value);
    fullRenderCycleCallback();
}

// Callback for UI changes that require a re-render
export function uiRequiresRender() {
    fullRenderCycleCallback();
}
