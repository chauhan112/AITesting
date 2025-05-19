import { DEFAULT_COLOR, DEFAULT_FONT_SIZE } from "./constants.js";
import {
    getSelectedNodeId,
    findNodeById,
    updateNodeProperties,
    getAllDescendants,
} from "./state.js";

let nodeEditPanel,
    selectedNodeInfo,
    nodeTextInput,
    nodeColorInput,
    applyColorToChildrenBtn,
    nodeFontSizeInput,
    nodeNoteInput,
    tooltipElement;

export function initUI(elements) {
    nodeEditPanel = elements.nodeEditPanel;
    selectedNodeInfo = elements.selectedNodeInfo;
    nodeTextInput = elements.nodeTextInput;
    nodeColorInput = elements.nodeColorInput;
    applyColorToChildrenBtn = elements.applyColorToChildrenBtn;
    nodeFontSizeInput = elements.nodeFontSizeInput;
    nodeNoteInput = elements.nodeNoteInput;
    tooltipElement = elements.tooltipElement;

    // Attach internal listeners for edit panel changes
    nodeTextInput.addEventListener("input", handleNodeTextChange);
    nodeColorInput.addEventListener("input", handleNodeColorChange);
    nodeFontSizeInput.addEventListener("input", handleNodeFontSizeChange);
    nodeNoteInput.addEventListener("input", handleNodeNoteChange);
    applyColorToChildrenBtn.addEventListener(
        "click",
        handleApplyColorToChildren
    );
}

export function updateEditPanel() {
    const nodeId = getSelectedNodeId();
    if (nodeId) {
        const node = findNodeById(nodeId);
        if (node) {
            nodeEditPanel.classList.remove("hidden");
            selectedNodeInfo.textContent = `Editing: ${node.text.substring(
                0,
                30
            )} (ID: ${node.id})`;
            nodeTextInput.value = node.text;
            nodeColorInput.value = node.color || DEFAULT_COLOR;
            nodeFontSizeInput.value = node.fontSize || DEFAULT_FONT_SIZE;
            nodeNoteInput.value = node.note || "";
            return;
        }
    }
    nodeEditPanel.classList.add("hidden");
    selectedNodeInfo.textContent = "No node selected.";
}

function handleNodeTextChange(e) {
    const nodeId = getSelectedNodeId();
    if (nodeId) updateNodeProperties(nodeId, { text: e.target.value });
    // Caller (main.js) should call render after this
}
function handleNodeColorChange(e) {
    const nodeId = getSelectedNodeId();
    if (nodeId) updateNodeProperties(nodeId, { color: e.target.value });
}
function handleNodeFontSizeChange(e) {
    const nodeId = getSelectedNodeId();
    if (nodeId)
        updateNodeProperties(nodeId, { fontSize: parseInt(e.target.value) });
}
function handleNodeNoteChange(e) {
    const nodeId = getSelectedNodeId();
    if (nodeId) updateNodeProperties(nodeId, { note: e.target.value });
}
function handleApplyColorToChildren() {
    const parentId = getSelectedNodeId();
    if (!parentId) return;
    const parentNode = findNodeById(parentId);
    if (!parentNode) return;

    const newColor = parentNode.color;
    const descendants = getAllDescendants(parentId);
    descendants.forEach((desc) => {
        updateNodeProperties(desc.id, { color: newColor });
    });
    // Caller (main.js) should call render after this
}

export function showTooltip(node, event, canvasRect) {
    if (node && node.note) {
        tooltipElement.textContent = node.note;
        tooltipElement.style.opacity = "1";

        const nodeGroup = document.getElementById(`group-${node.id}`);
        if (!nodeGroup) return;

        const nodeRect = nodeGroup.getBoundingClientRect(); // Screen coordinates of the node group

        tooltipElement.style.left = `${
            nodeRect.left -
            canvasRect.left +
            nodeRect.width / 2 -
            tooltipElement.offsetWidth / 2
        }px`;
        tooltipElement.style.top = `${
            nodeRect.top - canvasRect.top - tooltipElement.offsetHeight - 10
        }px`;
    }
}

export function hideTooltip() {
    tooltipElement.style.opacity = "0";
}
