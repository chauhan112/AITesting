import {
    NODE_WIDTH,
    NODE_HEIGHT,
    H_SPACING,
    V_SPACING,
    SIBLING_SEPARATION,
    SUBTREE_SEPARATION,
    LEVEL_SEPARATION,
} from "./constants.js";
import { getTreeData, getCurrentLayout } from "./state.js";

// --- Buchheim-Walker Algorithm ---
// Based on: "Improving Walker's Algorithm to Run in Linear Time" by Buchheim et al.
// And "Drawing Presentable Trees" by Bill Mill

function firstWalk(node, isLeftToRight) {
    if (node.isCollapsed || !node.children || node.children.length === 0) {
        if (node._lmost_sibling) {
            node.prelim =
                node._lmost_sibling.prelim +
                (isLeftToRight
                    ? NODE_HEIGHT + V_SPACING
                    : NODE_WIDTH + H_SPACING) *
                    SIBLING_SEPARATION;
        } else {
            node.prelim = 0;
        }
    } else {
        let defaultAncestor = node.children[0];
        for (const child of node.children) {
            child.ancestor = child; // Initialize ancestor
            firstWalk(child, isLeftToRight);
            defaultAncestor = apportion(child, defaultAncestor, isLeftToRight);
        }
        executeShifts(node);
        const midpoint =
            (node.children[0].prelim +
                node.children[node.children.length - 1].prelim) /
            2;

        if (node._lmost_sibling) {
            node.prelim =
                node._lmost_sibling.prelim +
                (isLeftToRight
                    ? NODE_HEIGHT + V_SPACING
                    : NODE_WIDTH + H_SPACING) *
                    SIBLING_SEPARATION;
            node.mod = node.prelim - midpoint;
        } else {
            node.prelim = midpoint;
        }
    }
}

function apportion(node, defaultAncestor, isLeftToRight) {
    const spacing =
        (isLeftToRight ? NODE_HEIGHT + V_SPACING : NODE_WIDTH + H_SPACING) *
        SUBTREE_SEPARATION;
    if (node._lmost_sibling) {
        let vir = node; // v_inner_right
        let vor = node; // v_outer_right
        let vil = node._lmost_sibling; // v_inner_left
        let vol = node.parent.children[0]; // v_outer_left (first child of parent)

        let sir = vir.mod; // sum_inner_right
        let sor = vor.mod; // sum_outer_right
        let sil = vil.mod; // sum_inner_left
        let sol = vol.mod; // sum_outer_left

        while (nextRight(vil) && nextLeft(vir)) {
            vil = nextRight(vil);
            vir = nextLeft(vir);
            vol = nextLeft(vol);
            vor = nextRight(vor);
            vor.ancestor = node;

            const shift = vil.prelim + sil - (vir.prelim + sir) + spacing;
            if (shift > 0) {
                moveSubtree(ancestor(vil, node, defaultAncestor), node, shift);
                sir = sir + shift;
                sor = sor + shift;
            }
            sil += vil.mod;
            sir += vir.mod;
            sol += vol.mod;
            sor += vor.mod;
        }

        if (nextRight(vil) && !nextRight(vor)) {
            vor.thread = nextRight(vil);
            vor.mod += sil - sor;
        }
        if (nextLeft(vir) && !nextLeft(vol)) {
            vol.thread = nextLeft(vir);
            vol.mod += sir - sol;
            defaultAncestor = node;
        }
    }
    return defaultAncestor;
}

function moveSubtree(wl, wr, shift) {
    const subtrees =
        wr.parent.children.indexOf(wr) - wl.parent.children.indexOf(wl);
    if (subtrees > 0) {
        const nr = wr.parent.children.indexOf(wr);
        const nl = wl.parent.children.indexOf(wl);
        const factor = shift / subtrees;
        wr._change -= factor; // change in Buchheim
        wr.shift += shift;
        wl._change += factor;
        wr.prelim += shift;
        wr.mod += shift;
    }
}

function executeShifts(node) {
    let shift = 0,
        change = 0;
    for (let i = node.children.length - 1; i >= 0; i--) {
        const child = node.children[i];
        child.prelim += shift;
        child.mod += shift;
        change += child._change; // child.change
        shift += child.shift + change;
    }
}

function ancestor(vil, node, defaultAncestor) {
    if (vil.ancestor.parent === node.parent) {
        return vil.ancestor;
    }
    return defaultAncestor;
}

function secondWalk(node, m, depth, isLeftToRight, minCoord) {
    let x = node.prelim + m;
    let y =
        depth *
        (isLeftToRight ? NODE_WIDTH + H_SPACING : NODE_HEIGHT + V_SPACING) *
        LEVEL_SEPARATION;

    if (isLeftToRight) {
        node.y = x;
        node.x = y;
        if (node.y < minCoord.val) minCoord.val = node.y;
    } else {
        node.x = x;
        node.y = y;
        if (node.x < minCoord.val) minCoord.val = node.x;
    }

    // Initialize children's properties for layout algorithm
    if (node.children) {
        let lmost = null;
        node.children.forEach((child) => {
            child._lmost_sibling = lmost;
            lmost = child;
            child.ancestor = child; // Re-initialize for this walk if needed
            child.thread = null;
            child.mod = 0;
            child.prelim = 0;
            child.shift = 0;
            child._change = 0; // child.change
        });
    }

    if (!node.isCollapsed && node.children) {
        for (const child of node.children) {
            secondWalk(child, m + node.mod, depth + 1, isLeftToRight, minCoord);
        }
    }
}

function nextLeft(node) {
    return node.isCollapsed
        ? node.thread
        : node.children
        ? node.children[0]
        : node.thread;
}
function nextRight(node) {
    return node.isCollapsed
        ? node.thread
        : node.children
        ? node.children[node.children.length - 1]
        : node.thread;
}

export function calculatePositions() {
    const roots = getTreeData();
    if (!roots || roots.length === 0) return;
    const isLeftToRight = getCurrentLayout() === "left-to-right";

    // Initialize properties for each root
    roots.forEach((root) => {
        root.ancestor = root;
        root.thread = null;
        root.mod = 0;
        root.prelim = 0;
        root.shift = 0;
        root._change = 0; // root.change
        root._lmost_sibling = null;

        // Initialize for children as well (important for subsequent runs)
        function initNodeForLayout(n) {
            n.ancestor = n;
            n.thread = null;
            n.mod = 0;
            n.prelim = 0;
            n.shift = 0;
            n._change = 0;
            n._lmost_sibling = null;
            if (n.children) {
                let lmost = null;
                n.children.forEach((c) => {
                    c._lmost_sibling = lmost;
                    lmost = c;
                    initNodeForLayout(c);
                });
            }
        }
        initNodeForLayout(root);

        firstWalk(root, isLeftToRight);
    });

    // Find overall min coordinate to shift tree to positive values
    let minCoord = { val: Infinity };
    roots.forEach((root) => {
        secondWalk(root, 0, 0, isLeftToRight, minCoord);
    });

    // Normalize coordinates to be positive (start from a margin)
    const margin = 50;
    let offset = margin;
    if (minCoord.val < margin) {
        offset = margin - minCoord.val;
    }

    function applyOffset(nodes) {
        nodes.forEach((node) => {
            if (isLeftToRight) {
                node.y += offset;
            } else {
                node.x += offset;
            }
            if (node.children && !node.isCollapsed) {
                applyOffset(node.children);
            }
        });
    }
    applyOffset(roots);
}
