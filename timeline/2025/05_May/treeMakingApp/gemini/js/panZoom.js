let svgElement = null;
let treeContainer = null;
let isPanning = false;
let startPoint = { x: 0, y: 0 };
let endPoint = { x: 0, y: 0 };
let scale = 1;
let panX = 0;
let panY = 0;

export function initPanZoom(svg, container) {
    svgElement = svg;
    treeContainer = container;

    svgElement.addEventListener("mousedown", handleMouseDown);
    svgElement.addEventListener("mousemove", handleMouseMove);
    svgElement.addEventListener("mouseup", handleMouseUp);
    svgElement.addEventListener("mouseleave", handleMouseUp); // Stop panning if mouse leaves SVG
    svgElement.addEventListener("wheel", handleWheel);
    updateTransform();
}

function handleMouseDown(e) {
    // Only pan if not clicking on a node element (or its children like text, rect)
    if (e.target.closest(".node-group, [data-collapse-id]")) {
        isPanning = false;
        return;
    }
    e.preventDefault();
    isPanning = true;
    startPoint = { x: e.clientX, y: e.clientY };
}

function handleMouseMove(e) {
    if (!isPanning) return;
    e.preventDefault();
    endPoint = { x: e.clientX, y: e.clientY };
    panX += (endPoint.x - startPoint.x) / scale; // Adjust by scale for consistent pan speed
    panY += (endPoint.y - startPoint.y) / scale;
    startPoint = { x: endPoint.x, y: endPoint.y };
    updateTransform();
}

function handleMouseUp(e) {
    if (!isPanning) return;
    isPanning = false;
}

function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1; // Zoom factor
    const oldScale = scale;
    scale *= delta;
    scale = Math.max(0.1, Math.min(scale, 5)); // Clamp scale

    // Zoom towards mouse cursor
    const svgRect = svgElement.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    // Transform mouse point from screen to SVG panZoom-transformed space
    // Inverse of: screenMouseX = (svgMouseX * currentScale) + currentPanX_Screen
    // svgMouseX = (screenMouseX - currentPanX_Screen) / currentScale
    // Here, panX and panY are in SVG units, not screen pixels directly for the transform
    // Let M be mouse point in SVG coords, P be pan offset, S be scale
    // ScreenCoords = (M + P) * S  => M = ScreenCoords/S - P
    // We want the point under the mouse to stay the same after zoom.
    // (mouseX/oldScale - panX) should be same as (mouseX/newScale - newPanX)
    // newPanX = mouseX/newScale - (mouseX/oldScale - panX)
    // newPanX = panX + mouseX * (1/newScale - 1/oldScale)

    // Simpler approach often used:
    // Find mouse position in unscaled SVG space (relative to treeContainer's 0,0)
    const mousePointX = (mouseX - panX * oldScale) / oldScale;
    const mousePointY = (mouseY - panY * oldScale) / oldScale;

    // New pan so that mousePointX, mousePointY remains under the cursor
    panX = (mouseX - mousePointX * scale) / scale;
    panY = (mouseY - mousePointY * scale) / scale;

    updateTransform();
}

function updateTransform() {
    if (treeContainer) {
        // Pan is applied first in SVG units, then scale
        treeContainer.setAttribute(
            "transform",
            `translate(${panX * scale}, ${panY * scale}) scale(${scale})`
        );
        // The above is simpler but pan speed changes with zoom.
        // For consistent pan speed and zoom to cursor:
        // The transform on 'treeContainer' should be `translate(worldPanX, worldPanY) scale(scale)`
        // worldPanX = panX * scale, worldPanY = panY * scale when panX, panY are "world units"
        // If panX, panY are screen units, then transform is translate(panX, panY) scale(scale)
        // And mousemove updates are dx/scale, dy/scale.
        // Let's stick to panX, panY being logical offsets of the 0,0 of treeContainer.
        // The transform becomes: translate(panX_screen, panY_screen) scale(scale)
        // where panX_screen += dx, panY_screen += dy
        // and then tree content is at (node.x - panX_svg_offset)*scale, (node.y - panY_svg_offset)*scale
        // This can get confusing. The current approach is:
        // treeContainer at (0,0) has its own coord system.
        // We apply scale, then translate.
        // Or translate, then scale. `transform="translate(tx ty) scale(s)"` means translate first, then scale around new (0,0).
        // `transform="scale(s) translate(tx ty)"` means scale around original (0,0), then translate the scaled content. This is usually preferred.
        // Let's adjust to `scale` then `translate(panX, panY)` where panX/panY are in unscaled units.
        treeContainer.setAttribute(
            "transform",
            `scale(${scale}) translate(${panX}, ${panY})`
        );
    }
}

export function getPanZoom() {
    return { panX, panY, scale };
}

// Utility to convert screen coordinates to SVG world coordinates
export function screenToSVGCoords(screenX, screenY) {
    if (!svgElement) return { x: screenX, y: screenY };
    const svgRect = svgElement.getBoundingClientRect();
    // Assuming transform is scale() translate()
    const svgX = (screenX - svgRect.left) / scale - panX;
    const svgY = (screenY - svgRect.top) / scale - panY;
    return { x: svgX, y: svgY };
}
