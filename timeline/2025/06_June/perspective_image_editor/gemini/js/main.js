// --- DOM Elements ---
const imageUpload = document.getElementById("imageUpload");
const inputCanvas = document.getElementById("inputCanvas");
const outputCanvas = document.getElementById("outputCanvas");
const processBtn = document.getElementById("processBtn");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn"); // New button
const pointMarkersContainer = document.getElementById("pointMarkersContainer");

// --- Canvas Contexts ---
const inputCtx = inputCanvas.getContext("2d");
const outputCtx = outputCanvas.getContext("2d");

// --- Global State Variables ---
let currentImage = null;
let selectedPoints = [];
const MAX_POINTS = 4;
const POINT_RADIUS = 8; // For drawing markers

// --- UI State Management Functions ---
function setInitialUIState() {
    processBtn.disabled = true;
    downloadBtn.disabled = true;
}

function updateUIState() {
    processBtn.disabled = !(
        currentImage && selectedPoints.length === MAX_POINTS
    );
    // Download button only enabled after successful processing, not just point selection
    // It will be enabled in `handleProcessImage`
}

// --- Canvas Drawing Functions ---

function resetCanvas(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f0f0f0"; // Light background for empty canvas
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawOriginalImage() {
    if (!currentImage) return;

    const aspectRatio = currentImage.width / currentImage.height;
    let drawWidth = inputCanvas.width;
    let drawHeight = inputCanvas.height;

    if (drawWidth / drawHeight > aspectRatio) {
        drawWidth = drawHeight * aspectRatio;
    } else {
        drawHeight = drawWidth / aspectRatio;
    }

    const xOffset = (inputCanvas.width - drawWidth) / 2;
    const yOffset = (inputCanvas.height - drawHeight) / 2;

    inputCtx.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
    inputCtx.fillStyle = "#f0f0f0";
    inputCtx.fillRect(0, 0, inputCanvas.width, inputCanvas.height);
    inputCtx.drawImage(currentImage, xOffset, yOffset, drawWidth, drawHeight);

    // Store actual drawn image dimensions/offset for accurate point mapping (if needed later)
    inputCanvas.imageData = {
        x: xOffset,
        y: yOffset,
        width: drawWidth,
        height: drawHeight,
        originalWidth: currentImage.width,
        originalHeight: currentImage.height,
    };
}

function drawPointsOverlay() {
    selectedPoints.forEach((point, index) => {
        inputCtx.beginPath();
        inputCtx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2);
        inputCtx.fillStyle = `rgba(255, 0, 0, 0.7)`;
        inputCtx.fill();
        inputCtx.lineWidth = 2;
        inputCtx.strokeStyle = "white";
        inputCtx.stroke();

        inputCtx.fillStyle = "white";
        inputCtx.font = "12px Arial";
        inputCtx.textAlign = "center";
        inputCtx.textBaseline = "middle";
        inputCtx.fillText(index + 1, point.x, point.y);
    });
}

function updatePointMarkers() {
    pointMarkersContainer.innerHTML = ""; // Clear previous markers

    const rect = inputCanvas.getBoundingClientRect();
    const scaleX = rect.width / inputCanvas.width;
    const scaleY = rect.height / inputCanvas.height;

    selectedPoints.forEach((point, index) => {
        const marker = document.createElement("div");
        marker.className = "point-marker";
        marker.style.left = `${point.x * scaleX + rect.left}px`;
        marker.style.top = `${point.y * scaleY + rect.top}px`;
        marker.textContent = index + 1;
        marker.style.backgroundColor = `hsl(${index * 90}, 70%, 50%)`;
        marker.style.color = "white";
        marker.style.fontSize = "10px";
        marker.style.display = "flex";
        marker.style.alignItems = "center";
        marker.style.justifyContent = "center";
        pointMarkersContainer.appendChild(marker);
    });
}

// --- Image Processing Logic (Homography) ---
// These functions are pure mathematical operations, separated from UI.

function multiplyMatrices(A, B) {
    const rowsA = A.length,
        colsA = A[0].length,
        rowsB = B.length,
        colsB = B[0].length;
    if (colsA !== rowsB) {
        console.error("Matrix dimensions mismatch for multiplication!");
        return null;
    }
    const result = new Array(rowsA).fill(0).map(() => new Array(colsB).fill(0));
    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            for (let k = 0; k < colsA; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return result;
}

function invertMatrix(matrix) {
    if (matrix.length !== 3 || matrix[0].length !== 3) {
        console.error("Inverse only implemented for 3x3 matrices.");
        return null;
    }
    const [a, b, c, d, e, f, g, h, i] = [
        matrix[0][0],
        matrix[0][1],
        matrix[0][2],
        matrix[1][0],
        matrix[1][1],
        matrix[1][2],
        matrix[2][0],
        matrix[2][1],
        matrix[2][2],
    ];
    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    if (det === 0) {
        console.error("Determinant is zero, matrix cannot be inverted.");
        return null;
    }
    const invDet = 1 / det;
    return [
        [
            (e * i - f * h) * invDet,
            (c * h - b * i) * invDet,
            (b * f - c * e) * invDet,
        ],
        [
            (f * g - d * i) * invDet,
            (a * i - c * g) * invDet,
            (c * d - a * f) * invDet,
        ],
        [
            (d * h - e * g) * invDet,
            (b * g - a * h) * invDet,
            (a * e - b * d) * invDet,
        ],
    ];
}

function solveLinearSystem(A, B) {
    const n = A.length;
    const Ab = A.map((row, i) => [...row, B[i]]);

    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(Ab[k][i]) > Math.abs(Ab[maxRow][i])) {
                maxRow = k;
            }
        }
        [Ab[i], Ab[maxRow]] = [Ab[maxRow], Ab[i]];

        if (Math.abs(Ab[i][i]) < 1e-9) {
            console.warn(
                "Singular or near-singular matrix detected in solveLinearSystem."
            );
            return null;
        }

        for (let j = i + 1; j < n + 1; j++) {
            Ab[i][j] /= Ab[i][i];
        }
        Ab[i][i] = 1;

        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const factor = Ab[k][i];
                for (let j = i; j < n + 1; j++) {
                    Ab[k][j] -= factor * Ab[i][j];
                }
            }
        }
    }
    return Ab.map((row) => row[n]);
}

function getTransformationMatrix(srcPoints, destPoints) {
    const A = [];
    const B = [];

    for (let i = 0; i < 4; i++) {
        const s = srcPoints[i];
        const d = destPoints[i];

        A.push([-s.x, -s.y, -1, 0, 0, 0, d.x * s.x, d.x * s.y]);
        B.push(-d.x);

        A.push([0, 0, 0, -s.x, -s.y, -1, d.y * s.x, d.y * s.y]);
        B.push(-d.y);
    }

    const h_params = solveLinearSystem(A, B);
    if (!h_params) return null;

    return [
        [h_params[0], h_params[1], h_params[2]],
        [h_params[3], h_params[4], h_params[5]],
        [h_params[6], h_params[7], 1],
    ];
}

// --- Event Handlers (Orchestrators) ---

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const img = new Image();
        img.src = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });

        img.onload = () => {
            currentImage = img;
            resetCanvas(inputCanvas, inputCtx);
            resetCanvas(outputCanvas, outputCtx);
            drawOriginalImage();
            selectedPoints = []; // Clear points for new image
            updatePointMarkers(); // Clear HTML markers
            updateUIState(); // Disable process button
            downloadBtn.disabled = true; // Disable download for new image
        };
        img.onerror = () => {
            alert("Could not load image. Please try a different file.");
            currentImage = null; // Ensure state is clean
            handleReset(); // Reset UI
        };
    } catch (error) {
        console.error("Error loading image:", error);
        alert("Failed to load image.");
        handleReset();
    }
}

function handleCanvasClick(event) {
    if (!currentImage || selectedPoints.length >= MAX_POINTS) {
        return;
    }

    const rect = inputCanvas.getBoundingClientRect();
    const scaleX = inputCanvas.width / rect.width;
    const scaleY = inputCanvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    selectedPoints.push({ x, y });

    drawOriginalImage(); // Redraw image
    drawPointsOverlay(); // Draw points on top
    updatePointMarkers(); // Update HTML markers
    updateUIState(); // Check if process button should be enabled
}

function handleProcessImage() {
    if (!currentImage || selectedPoints.length !== MAX_POINTS) {
        alert("Please upload an image and select exactly 4 points first.");
        return;
    }

    // Determine output canvas dimensions dynamically
    const p1 = selectedPoints[0]; // Top-Left (assuming user order)
    const p2 = selectedPoints[1]; // Top-Right
    const p3 = selectedPoints[2]; // Bottom-Right
    const p4 = selectedPoints[3]; // Bottom-Left

    const widthTop = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const widthBottom = Math.hypot(p3.x - p4.x, p3.y - p4.y);
    const outputWidth = Math.max(widthTop, widthBottom);

    const heightLeft = Math.hypot(p4.x - p1.x, p4.y - p1.y);
    const heightRight = Math.hypot(p3.x - p2.x, p3.y - p2.y);
    const outputHeight = Math.max(heightLeft, heightRight);

    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;

    const destPoints = [
        { x: 0, y: 0 },
        { x: outputWidth, y: 0 },
        { x: outputWidth, y: outputHeight },
        { x: 0, y: outputHeight },
    ];

    const inputImageData = inputCtx.getImageData(
        0,
        0,
        inputCanvas.width,
        inputCanvas.height
    );
    const outputImageData = outputCtx.createImageData(
        outputCanvas.width,
        outputCanvas.height
    );

    const H = getTransformationMatrix(selectedPoints, destPoints);
    if (!H) {
        alert(
            "Could not calculate transformation matrix. Points might be collinear or too close."
        );
        downloadBtn.disabled = true; // Keep download disabled if processing fails
        return;
    }
    const H_inv = invertMatrix(H);
    if (!H_inv) {
        alert(
            "Could not invert transformation matrix. This can happen with degenerate point selections."
        );
        downloadBtn.disabled = true; // Keep download disabled if processing fails
        return;
    }

    // Perform the actual pixel mapping
    for (let dy = 0; dy < outputCanvas.height; dy++) {
        for (let dx = 0; dx < outputCanvas.width; dx++) {
            const sx_homogeneous =
                H_inv[0][0] * dx + H_inv[0][1] * dy + H_inv[0][2];
            const sy_homogeneous =
                H_inv[1][0] * dx + H_inv[1][1] * dy + H_inv[1][2];
            const w_homogeneous =
                H_inv[2][0] * dx + H_inv[2][1] * dy + H_inv[2][2];

            const sx = sx_homogeneous / w_homogeneous;
            const sy = sy_homogeneous / w_homogeneous;

            if (
                sx >= 0 &&
                sx < inputCanvas.width &&
                sy >= 0 &&
                sy < inputCanvas.height
            ) {
                const srcIdx =
                    (Math.floor(sy) * inputCanvas.width + Math.floor(sx)) * 4;
                const destIdx = (dy * outputCanvas.width + dx) * 4;

                outputImageData.data[destIdx] = inputImageData.data[srcIdx];
                outputImageData.data[destIdx + 1] =
                    inputImageData.data[srcIdx + 1];
                outputImageData.data[destIdx + 2] =
                    inputImageData.data[srcIdx + 2];
                outputImageData.data[destIdx + 3] =
                    inputImageData.data[srcIdx + 3];
            } else {
                const destIdx = (dy * outputCanvas.width + dx) * 4;
                outputImageData.data[destIdx + 3] = 0; // Transparent
            }
        }
    }
    outputCtx.putImageData(outputImageData, 0, 0);
    downloadBtn.disabled = false; // Enable download button after successful processing
}

function handleDownload() {
    if (
        outputCanvas.width === 0 ||
        outputCanvas.height === 0 ||
        downloadBtn.disabled
    ) {
        alert("No processed image available to download.");
        return;
    }

    const dataURL = outputCanvas.toDataURL("image/png"); // Get image data as PNG
    const link = document.createElement("a"); // Create a temporary link element
    link.href = dataURL; // Set the href to the image data
    link.download = "rectangular_paper.png"; // Set the download filename
    link.click(); // Programmatically click the link to trigger download
    link.remove(); // Clean up the temporary link
}

function handleReset() {
    currentImage = null;
    selectedPoints = [];
    imageUpload.value = ""; // Clear file input
    resetCanvas(inputCanvas, inputCtx);
    resetCanvas(outputCanvas, outputCtx);
    updatePointMarkers(); // Clear HTML markers
    setInitialUIState(); // Disable both process and download buttons
}

// --- Initialization ---

// Attach Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    imageUpload.addEventListener("change", handleImageUpload);
    inputCanvas.addEventListener("click", handleCanvasClick);
    processBtn.addEventListener("click", handleProcessImage);
    downloadBtn.addEventListener("click", handleDownload);
    resetBtn.addEventListener("click", handleReset);

    // Initial setup
    resetCanvas(inputCanvas, inputCtx);
    resetCanvas(outputCanvas, outputCtx);
    updatePointMarkers(); // Ensure marker container is ready
    setInitialUIState(); // Set buttons to their initial disabled state
});
