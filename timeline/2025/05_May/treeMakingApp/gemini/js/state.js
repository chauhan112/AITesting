import {
    createNodeObject,
    setNodeIdCounter as setFactoryCounter,
    getNodeIdCounter as getFactoryCounter,
} from "./nodeFactory.js";

let treeData = [];
let selectedNodeId = null;
let currentLayout = "top-to-bottom"; // 'top-to-bottom' or 'left-to-right'

export function getTreeData() {
    return treeData;
}
export function setTreeData(data) {
    treeData = data;
}
export function getSelectedNodeId() {
    return selectedNodeId;
}
export function setSelectedNodeId(id) {
    selectedNodeId = id;
}
export function getCurrentLayout() {
    return currentLayout;
}
export function setCurrentLayout(layout) {
    currentLayout = layout;
}
export function getNodeIdCounter() {
    return getFactoryCounter();
}
export function setNodeIdCounter(value) {
    setFactoryCounter(value);
}

export function findNodeById(id, nodes = treeData) {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(id, node.children);
            if (found) return found;
        }
    }
    return null;
}

export function findNodeAndParent(id, nodes = treeData, parent = null) {
    for (const node of nodes) {
        if (node.id === id) return { node, parent };
        if (node.children) {
            const found = findNodeAndParent(id, node.children, node);
            if (found.node) return found;
        }
    }
    return { node: null, parent: null };
}

export function addNode(text, parentId = null) {
    const newNode = createNodeObject(text, parentId);
    if (parentId === null) {
        if (
            treeData.length > 0 &&
            !confirm("A root node already exists. Replace it?")
        ) {
            return null;
        }
        treeData = [newNode];
    } else {
        const parentNode = findNodeById(parentId);
        if (parentNode) {
            parentNode.children.push(newNode);
        } else {
            console.error("Parent node not found:", parentId);
            return null;
        }
    }
    return newNode;
}

export function deleteNode(nodeId) {
    const { node, parent } = findNodeAndParent(nodeId);
    if (!node) return false;

    if (parent) {
        parent.children = parent.children.filter(
            (child) => child.id !== nodeId
        );
    } else {
        // It's a root node
        treeData = treeData.filter((root) => root.id !== nodeId);
    }
    if (selectedNodeId === nodeId) selectedNodeId = null;
    return true;
}

export function updateNodeProperties(id, updates) {
    const node = findNodeById(id);
    if (node) {
        Object.assign(node, updates);
        return true;
    }
    return false;
}

export function getAllDescendants(nodeId) {
    const node = findNodeById(nodeId);
    if (!node) return [];
    let descendants = [];
    function collect(currentNode) {
        if (currentNode.children) {
            currentNode.children.forEach((child) => {
                descendants.push(child);
                collect(child);
            });
        }
    }
    collect(node);
    return descendants;
}

export function calculateMaxId(nodes) {
    let maxIdNum = -1;
    function findMax(nodeArray) {
        nodeArray.forEach((n) => {
            const idNum = parseInt(n.id.split("-")[1]);
            if (idNum > maxIdNum) maxIdNum = idNum;
            if (n.children) findMax(n.children);
        });
    }
    if (nodes && nodes.length > 0) findMax(nodes);
    return maxIdNum;
}
