const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ===== STATE MANAGEMENT =====
let elements = [];
let selectedElement = null;

let isDragging = false;
let isResizing = false;
let resizeHandle = null;

let startX = 0,
  startY = 0;
let startWidth = 0,
  startHeight = 0;
let startElementX = 0,
  startElementY = 0;

let offsetX = 0;
let offsetY = 0;

let originalLayerIndex = null;

// ===== DOM ELEMENTS =====
const rotateSlider = document.getElementById("rotateSlider");
const xSlider = document.getElementById("xSlider");
const ySlider = document.getElementById("ySlider");
const rotateValue = document.getElementById("rotateValue");
const xValue = document.getElementById("xValue");
const yValue = document.getElementById("yValue");
const statusBar = document.getElementById("statusBar");

// ===== LAYER PRIORITY =====
const layerPriority = {
  face: 0,
  hair: 1,
  "left ear": 2,
  "right ear": 2,
  eyebrows: 3,
  eyes: 4,
  nose: 5,
  moustache: 6,
  lips: 7,
  beard: 8,
};

// ===== ASSET TYPES FOR DISPLAY =====
const ASSET_TYPES = {
  face: "Face",
  eyes: "Eyes",
  eyebrows: "Eyebrows",
  nose: "Nose",
  lips: "Lips",
  hair: "Hair",
  beard: "Beard",
  moustache: "Moustache",
  "left ear": "Left Ear",
  "right ear": "Right Ear",
};

// ===== ELEMENT CLASS =====
class Element {
  constructor(img, x, y, type) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.width = img.width * 0.5;
    this.height = img.height * 0.5;
    this.rotation = 0;
    this.type = type;
    this.id = Date.now() + Math.random(); // Unique identifier
  }

  draw() {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    ctx.drawImage(
      this.img,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );
    ctx.restore();

    if (this === selectedElement) {
      // Draw selection outline
      ctx.save();
      ctx.strokeStyle = "#6c63ff";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.restore();

      drawHandles(this);
    }
  }

  isInside(mx, my) {
    return (
      mx > this.x &&
      mx < this.x + this.width &&
      my > this.y &&
      my < this.y + this.height
    );
  }

  // Get position relative to canvas center (for sliders)
  getRelativePosition() {
    return {
      x: this.x - (canvas.width / 2 - this.width / 2),
      y: this.y - (canvas.height / 2 - this.height / 2),
    };
  }

  // Update position from relative values
  setRelativePosition(relX, relY) {
    this.x = canvas.width / 2 - this.width / 2 + relX;
    this.y = canvas.height / 2 - this.height / 2 + relY;
  }
}

// ===== HANDLE DRAWING =====
function drawHandles(el) {
  const x = el.x;
  const y = el.y;
  const w = el.width;
  const h = el.height;

  const points = [
    [x, y],
    [x + w / 2, y],
    [x + w, y],
    [x + w, y + h / 2],
    [x + w, y + h],
    [x + w / 2, y + h],
    [x, y + h],
    [x, y + h / 2],
  ];

  points.forEach((p) => {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "#6c63ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(p[0] - 4, p[1] - 4, 8, 8);
    ctx.fill();
    ctx.stroke();
  });
}

// ===== HANDLE DETECTION =====
function getHandle(mx, my) {
  if (!selectedElement) return null;

  const x = selectedElement.x;
  const y = selectedElement.y;
  const w = selectedElement.width;
  const h = selectedElement.height;

  const handles = [
    { x: x, y: y, type: "nw", cursor: "nw-resize" },
    { x: x + w / 2, y: y, type: "n", cursor: "n-resize" },
    { x: x + w, y: y, type: "ne", cursor: "ne-resize" },
    { x: x + w, y: y + h / 2, type: "e", cursor: "e-resize" },
    { x: x + w, y: y + h, type: "se", cursor: "se-resize" },
    { x: x + w / 2, y: y + h, type: "s", cursor: "s-resize" },
    { x: x, y: y + h, type: "sw", cursor: "sw-resize" },
    { x: x, y: y + h / 2, type: "w", cursor: "w-resize" },
  ];

  for (let hnd of handles) {
    if (mx > hnd.x - 6 && mx < hnd.x + 6 && my > hnd.y - 6 && my < hnd.y + 6) {
      return hnd;
    }
  }
  return null;
}

// ===== SLIDER UPDATES =====
function updateSliders() {
  if (selectedElement) {
    const relPos = selectedElement.getRelativePosition();

    rotateSlider.value = selectedElement.rotation;
    xSlider.value = Math.round(relPos.x);
    ySlider.value = Math.round(relPos.y);

    if (rotateValue)
      rotateValue.textContent = selectedElement.rotation.toFixed(2);
    if (xValue) xValue.textContent = Math.round(relPos.x);
    if (yValue) yValue.textContent = Math.round(relPos.y);
  } else {
    rotateSlider.value = 0;
    xSlider.value = 0;
    ySlider.value = 0;

    if (rotateValue) rotateValue.textContent = "0.00";
    if (xValue) xValue.textContent = "0";
    if (yValue) yValue.textContent = "0";
  }
}

// ===== STATUS BAR =====
function updateStatus() {
  if (!statusBar) return;

  if (selectedElement) {
    statusBar.innerHTML = `✨ Selected: ${ASSET_TYPES[selectedElement.type] || selectedElement.type} | Drag to move | Use handles to resize | Sliders to adjust`;
  } else {
    statusBar.innerHTML =
      "ℹ️ Click an asset to add, then drag to position | Use handles to resize";
  }
}

// ===== RENDERING =====
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  elements.forEach((el) => el.draw());
  updateLayerPanel();
  updateSliders();
  updateStatus();
}

// ===== LAYER PANEL =====
function updateLayerPanel() {
  const panel = document.getElementById("layerPanel");
  if (!panel) return;

  panel.innerHTML = "";

  elements.forEach((el) => {
    const div = document.createElement("div");
    div.className = `layer-item ${el === selectedElement ? "active" : ""}`;

    const preview = document.createElement("img");
    preview.src = el.img.src;
    preview.className = "layer-preview";
    preview.alt = el.type;

    const label = document.createElement("span");
    label.innerText = ASSET_TYPES[el.type] || el.type;

    div.appendChild(preview);
    div.appendChild(label);

    div.addEventListener("click", () => {
      // Store original index before moving to top
      originalLayerIndex = elements.indexOf(el);

      // Move to top for visual feedback
      elements = elements.filter((e) => e !== el);
      elements.push(el);

      selectedElement = el;
      redraw();
    });

    panel.appendChild(div);
  });
}

// ===== MOUSE EVENTS =====
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  // Check if clicking on a resize handle
  const handle = getHandle(mx, my);
  if (handle && selectedElement) {
    isResizing = true;
    resizeHandle = handle.type;

    startX = mx;
    startY = my;
    startWidth = selectedElement.width;
    startHeight = selectedElement.height;
    startElementX = selectedElement.x;
    startElementY = selectedElement.y;

    canvas.style.cursor = handle.cursor;
    return;
  }

  // Check if clicking on an element (from top layer down)
  for (let i = elements.length - 1; i >= 0; i--) {
    if (elements[i].isInside(mx, my)) {
      selectedElement = elements[i];
      offsetX = mx - selectedElement.x;
      offsetY = my - selectedElement.y;
      isDragging = true;

      // Store original index
      originalLayerIndex = elements.indexOf(selectedElement);

      redraw();
      return;
    }
  }

  // Clicked on empty canvas
  if (selectedElement && originalLayerIndex !== null) {
    // Restore layer order if needed
    const tempElements = [...elements];
    const lastElement = tempElements.pop();
    if (lastElement === selectedElement) {
      elements = tempElements;
      elements.splice(originalLayerIndex, 0, selectedElement);
    }
  }

  selectedElement = null;
  originalLayerIndex = null;
  redraw();
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  // Update cursor based on handle
  const handle = getHandle(mx, my);
  canvas.style.cursor = handle
    ? handle.cursor
    : selectedElement
      ? "move"
      : "default";

  // Handle dragging
  if (isDragging && selectedElement) {
    selectedElement.x = mx - offsetX;
    selectedElement.y = my - offsetY;
    redraw();
  }

  // Handle resizing
  if (isResizing && selectedElement && resizeHandle) {
    const dx = mx - startX;
    const dy = my - startY;

    // Maintain minimum size
    const MIN_SIZE = 20;

    switch (resizeHandle) {
      case "se":
        selectedElement.width = Math.max(MIN_SIZE, startWidth + dx);
        selectedElement.height = Math.max(MIN_SIZE, startHeight + dy);
        break;

      case "nw":
        selectedElement.width = Math.max(MIN_SIZE, startWidth - dx);
        selectedElement.height = Math.max(MIN_SIZE, startHeight - dy);
        selectedElement.x = startElementX + dx;
        selectedElement.y = startElementY + dy;
        break;

      case "ne":
        selectedElement.width = Math.max(MIN_SIZE, startWidth + dx);
        selectedElement.height = Math.max(MIN_SIZE, startHeight - dy);
        selectedElement.y = startElementY + dy;
        break;

      case "sw":
        selectedElement.width = Math.max(MIN_SIZE, startWidth - dx);
        selectedElement.height = Math.max(MIN_SIZE, startHeight + dy);
        selectedElement.x = startElementX + dx;
        break;

      case "n":
        selectedElement.height = Math.max(MIN_SIZE, startHeight - dy);
        selectedElement.y = startElementY + dy;
        break;

      case "s":
        selectedElement.height = Math.max(MIN_SIZE, startHeight + dy);
        break;

      case "e":
        selectedElement.width = Math.max(MIN_SIZE, startWidth + dx);
        break;

      case "w":
        selectedElement.width = Math.max(MIN_SIZE, startWidth - dx);
        selectedElement.x = startElementX + dx;
        break;
    }

    redraw();
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  isResizing = false;
  resizeHandle = null;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
  isResizing = false;
  resizeHandle = null;
});

// ===== SLIDER CONTROLS =====
rotateSlider.addEventListener("input", (e) => {
  if (!selectedElement) return;
  selectedElement.rotation = parseFloat(e.target.value);
  redraw();
});

xSlider.addEventListener("input", (e) => {
  if (!selectedElement) return;
  const relX = parseFloat(e.target.value);
  const relY = selectedElement.getRelativePosition().y;
  selectedElement.setRelativePosition(relX, relY);
  redraw();
});

ySlider.addEventListener("input", (e) => {
  if (!selectedElement) return;
  const relY = parseFloat(e.target.value);
  const relX = selectedElement.getRelativePosition().x;
  selectedElement.setRelativePosition(relX, relY);
  redraw();
});

// ===== LAYER CONTROLS =====
function deleteSelected() {
  if (!selectedElement) {
    showToast("No element selected", "warning");
    return;
  }

  elements = elements.filter((el) => el !== selectedElement);
  selectedElement = null;
  originalLayerIndex = null;
  redraw();
  showToast("Element deleted", "success");
}

function bringForward() {
  if (!selectedElement) {
    showToast("No element selected", "warning");
    return;
  }

  const i = elements.indexOf(selectedElement);
  if (i < elements.length - 1) {
    [elements[i], elements[i + 1]] = [elements[i + 1], elements[i]];
    originalLayerIndex = elements.indexOf(selectedElement);
    redraw();
    showToast("Layer moved up", "info");
  }
}

function sendBackward() {
  if (!selectedElement) {
    showToast("No element selected", "warning");
    return;
  }

  const i = elements.indexOf(selectedElement);
  if (i > 0) {
    [elements[i], elements[i - 1]] = [elements[i - 1], elements[i]];
    originalLayerIndex = elements.indexOf(selectedElement);
    redraw();
    showToast("Layer moved down", "info");
  }
}

// ===== EXPORT =====
function downloadImage() {
  if (elements.length === 0) {
    showToast("Add some elements first!", "warning");
    return;
  }

  const link = document.createElement("a");
  link.download = `face-${new Date().getTime()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  showToast("Image downloaded!", "success");
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${type === "success" ? "#4caf50" : type === "warning" ? "#ff9800" : "#2196f3"};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Add animation styles
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener("keydown", (e) => {
  if (!selectedElement) return;

  // Prevent default scrolling
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Backspace",
    ].includes(e.key)
  ) {
    e.preventDefault();
  }

  switch (e.key) {
    case "Delete":
    case "Backspace":
      deleteSelected();
      break;
    case "ArrowUp":
      if (e.shiftKey) {
        bringForward();
      } else {
        selectedElement.y -= 5;
        redraw();
      }
      break;
    case "ArrowDown":
      if (e.shiftKey) {
        sendBackward();
      } else {
        selectedElement.y += 5;
        redraw();
      }
      break;
    case "ArrowLeft":
      selectedElement.x -= 5;
      redraw();
      break;
    case "ArrowRight":
      selectedElement.x += 5;
      redraw();
      break;
  }
});

// ===== ADD ELEMENTS =====
function addElement(src) {
  const img = new Image();
  img.src = src;
  img.crossOrigin = "anonymous";

  img.onload = () => {
    let type = "element";

    if (src.includes("face")) type = "face";
    else if (src.includes("eyes")) type = "eyes";
    else if (src.includes("eyebrows")) type = "eyebrows";
    else if (src.includes("nose")) type = "nose";
    else if (src.includes("lips")) type = "lips";
    else if (src.includes("hair")) type = "hair";
    else if (src.includes("beard")) type = "beard";
    else if (src.includes("moustache")) type = "moustache";
    else if (src.includes("left_ears")) type = "left ear";
    else if (src.includes("right_ears")) type = "right ear";

    // Remove existing element of same type (except ears)
    if (type !== "left ear" && type !== "right ear") {
      elements = elements.filter((el) => el.type !== type);
    }

    // Center position
    let x = canvas.width / 2 - img.width / 4;
    let y = canvas.height / 2 - img.height / 4;

    // Check if there's a face for positioning reference
    const face = elements.find((el) => el.type === "face");
    if (face && type !== "face") {
      const fw = face.width;
      const fh = face.height;
      const fx = face.x;
      const fy = face.y;
      const centerX = fx + fw / 2;

      const positions = {
        eyebrows: { x: centerX - img.width * 0.25, y: fy + fh * 0.25 },
        eyes: { x: centerX - img.width * 0.25, y: fy + fh * 0.35 },
        nose: { x: centerX - img.width * 0.25, y: fy + fh * 0.48 },
        moustache: { x: centerX - img.width * 0.25, y: fy + fh * 0.6 },
        lips: { x: centerX - img.width * 0.25, y: fy + fh * 0.7 },
        beard: { x: centerX - img.width * 0.35, y: fy + fh * 0.8 },
        hair: { x: centerX - img.width * 0.5, y: fy - img.height * 0.35 },
        "left ear": { x: fx - img.width * 0.3, y: fy + fh * 0.4 },
        "right ear": { x: fx + fw - img.width * 0.7, y: fy + fh * 0.4 },
      };

      if (positions[type]) {
        x = positions[type].x;
        y = positions[type].y;
      }
    }

    const el = new Element(img, x, y, type);

    // Insert based on layer priority
    const newPriority = layerPriority[type] ?? 100;
    let inserted = false;

    for (let i = 0; i < elements.length; i++) {
      const existingPriority = layerPriority[elements[i].type] ?? 100;
      if (newPriority < existingPriority) {
        elements.splice(i, 0, el);
        inserted = true;
        break;
      }
    }

    if (!inserted) elements.push(el);

    selectedElement = el;
    originalLayerIndex = elements.indexOf(el);

    redraw();
    showToast(`${ASSET_TYPES[type] || type} added!`, "success");
  };

  img.onerror = () => {
    console.error(`Failed to load: ${src}`);
    showToast("Failed to load asset", "warning");
  };
}

// ===== ASSET LOADING =====
function loadAssets(id, path, count) {
  const container = document.getElementById(id);
  if (!container) return;

  container.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const num = String(i).padStart(2, "0");
    const img = document.createElement("img");
    img.src = `assets/${path}/${num}.png`;
    img.className = "draggable";
    img.alt = `${path} ${i}`;
    img.loading = "lazy";

    img.onerror = function () {
      this.style.display = "none";
      console.warn(`Missing: assets/${path}/${num}.png`);
    };

    container.appendChild(img);
  }
}

// ===== EVENT DELEGATION FOR ASSETS =====
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("draggable")) return;
  addElement(e.target.src);
});

// ===== INITIALIZATION =====
window.onload = () => {
  loadAssets("faces", "face", 10);
  loadAssets("eyes", "eyes", 12);
  loadAssets("eyebrows", "eyebrows", 12);
  loadAssets("noses", "nose", 12);
  loadAssets("lips", "lips", 12);
  loadAssets("moustaches", "moustache", 12);
  loadAssets("beards", "beard", 12);
  loadAssets("hairs", "hair", 12);
  loadAssets("left_ears", "left_ears", 4);
  loadAssets("right_ears", "right_ears", 4);

  showToast("Welcome to Face Generator! 🎨", "info");
};
