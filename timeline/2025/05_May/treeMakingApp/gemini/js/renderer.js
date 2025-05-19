import {
    SVG_NS,
    NODE_WIDTH,
    NODE_HEIGHT,
    V_SPACING,
    H_SPACING,
} from "./constants.js";
import { getSelectedNodeId, getCurrentLayout } from "./state.js";

let svgCanvasElement = null;
let treeContainerElement = null;
let explorerDivElement = null;
let selectNodeCallback = null; // For explorer clicks

export function initRenderer(
    svgCanvas,
    treeContainer,
    explorerDiv,
    onSelectNode
) {
    svgCanvasElement = svgCanvas;
    treeContainerElement = treeContainer;
    explorerDivElement = explorerDiv;
    selectNodeCallback = onSelectNode;
}

function createSVGElemen(tag, attributes) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const key in attributes) {
        el.setAttribute(key, attributes[key]);
    }
    return el;
}

function renderNode(node, parentNodeData) {
    const isSelected = node.id === getSelectedNodeId();
    const currentLayout = getCurrentLayout();

    // Node Group
    const group = createSVGElemen("g", {
        class: "node-group cursor-pointer",
        id: `group-${node.id}`,
        transform: `translate(${node.x}, ${node.y})`,
    });
    treeContainerElement.appendChild(group);

    // Node Rectangle
    const rect = createSVGElemen("rect", {
        x: -NODE_WIDTH / 2,
        y: -NODE_HEIGHT / 2,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        rx: 5,
        fill: node.color,
        stroke: isSelected ? "yellow" : "rgba(200,200,255,0.7)",
        "stroke-width": isSelected ? "3" : "1",
        "data-id": node.id,
    });
    group.appendChild(rect);

    // Node Text
    const textContent =
        node.text.length > 15 ? node.text.substring(0, 13) + "..." : node.text;
    const text = createSVGElemen("text", {
        x: 0,
        y: 0,
        fill: "#FFFFFF",
        "font-size": `${node.fontSize}px`,
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        "data-id": node.id,
    });
    text.textContent = textContent;
    group.appendChild(text);

    // Collapse/Expand button
    if (node.children && node.children.length > 0) {
        const btnX =
            currentLayout === "left-to-right" ? 0 : NODE_WIDTH / 2 - 10;
        const btnY =
            currentLayout === "left-to-right" ? NODE_HEIGHT / 2 - 10 : 0;

        const collapseBtn = createSVGElemen("circle", {
            cx: btnX,
            cy: btnY,
            r: 8,
            fill: node.isCollapsed ? "gray" : "lightgray",
            stroke: "black",
            "stroke-width": "1",
            "data-collapse-id": node.id,
        });
        group.appendChild(collapseBtn);

        const collapseIcon = createSVGElemen("text", {
            x: btnX,
            y: btnY,
            "font-size": "12px",
            "font-family": "monospace",
            "text-anchor": "middle",
            "dominant-baseline": "central",
            fill: "black",
            "data-collapse-id": node.id,
        });
        collapseIcon.textContent = node.isCollapsed ? "+" : "-";
        group.appendChild(collapseIcon);
    }

    // Line to parent
    if (parentNodeData) {
        let d;
        if (currentLayout === "top-to-bottom") {
            d = `M ${parentNodeData.x} ${parentNodeData.y + NODE_HEIGHT / 2} 
                 C ${parentNodeData.x} ${
                parentNodeData.y + NODE_HEIGHT / 2 + V_SPACING / 2
            },
                   ${node.x} ${node.y - NODE_HEIGHT / 2 - V_SPACING / 2},
                   ${node.x} ${node.y - NODE_HEIGHT / 2}`;
        } else {
            // left-to-right
            d = `M ${parentNodeData.x + NODE_WIDTH / 2} ${parentNodeData.y}
                 C ${parentNodeData.x + NODE_WIDTH / 2 + H_SPACING / 2} ${
                parentNodeData.y
            },
                   ${node.x - NODE_WIDTH / 2 - H_SPACING / 2} ${node.y},
                   ${node.x - NODE_WIDTH / 2} ${node.y}`;
        }
        const line = createSVGElemen("path", {
            d: d,
            stroke: "rgba(150,150,200,0.5)",
            "stroke-width": 2,
            fill: "none",
        });
        treeContainerElement.insertBefore(
            line,
            treeContainerElement.firstChild
        );
    }
}

function renderNodesRecursive(nodes, parentNodeData) {
    nodes.forEach((node) => {
        renderNode(node, parentNodeData);
        if (node.children && node.children.length > 0 && !node.isCollapsed) {
            renderNodesRecursive(node.children, node);
        }
    });
}

export function renderTree(treeData) {
    if (!treeContainerElement) return;
    treeContainerElement.innerHTML = ""; // Clear previous render (nodes and lines)
    renderNodesRecursive(treeData, null);
}

export function renderExplorer(treeData) {
    if (!explorerDivElement) return;
    explorerDivElement.innerHTML = "";
    function buildExplorerList(nodes, parentElement, depth = 0) {
        nodes.forEach((node) => {
            const item = document.createElement("div");
            item.className = `pl-${
                depth * 4
            } py-1 hover:bg-gray-700 rounded cursor-pointer ${
                node.id === getSelectedNodeId() ? "bg-blue-700" : ""
            }`;
            item.textContent = node.text;
            item.dataset.id = node.id;
            item.addEventListener("click", () => {
                if (selectNodeCallback) selectNodeCallback(node.id);
            });
            parentElement.appendChild(item);
            if (
                node.children &&
                node.children.length > 0 &&
                !node.isCollapsed
            ) {
                buildExplorerList(node.children, parentElement, depth + 1);
            }
        });
    }
    buildExplorerList(treeData, explorerDivElement);
}
