import { DEFAULT_COLOR, DEFAULT_FONT_SIZE } from "./constants.js";

let nodeIdCounter = 0;

export function generateId() {
    return `node-${nodeIdCounter++}`;
}

export function setNodeIdCounter(value) {
    nodeIdCounter = value;
}
export function getNodeIdCounter() {
    return nodeIdCounter;
}

export function createNodeObject(text, parentId = null) {
    return {
        id: generateId(),
        text: text || "New Node",
        parentId: parentId,
        children: [],
        x: 0,
        y: 0,
        prelim: 0,
        mod: 0, // Layout properties
        width: 0, // Calculated width of the subtree rooted at this node
        color: DEFAULT_COLOR,
        fontSize: DEFAULT_FONT_SIZE,
        note: "",
        isCollapsed: false,
        // For Buchheim-Walker algorithm
        thread: null,
        ancestor: null, // Points to itself initially
        _lmost_sibling: null, // Leftmost sibling
        _change: 0, //  _change
        _shift: 0,
    };
}
