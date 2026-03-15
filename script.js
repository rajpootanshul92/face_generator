const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ===== STATE MANAGEMENT =====
let elements = [];
let selectedElement = null;

let isDragging = false;
let isResizing = false;
let resizeHandle = null;

let startX = 0, startY = 0;
let startWidth = 0, startHeight = 0;
let startElementX = 0, startElementY = 0;

let offsetX = 0;
let offsetY = 0;

let originalLayerIndex = null;

// ===== DOM ELEMENTS =====
const rotateSlider = document.getElementById("rotateSlider");
const xSlider = document.getElementById("xSlider");
const ySlider = document.getElementById("ySlider");

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
  beard: 8
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
    this.id = Date.now() + Math.random();
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
      this.height
    );
    ctx.restore();

    if (this === selectedElement) {
      ctx.save();
      ctx.strokeStyle = "#6c63ff";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.restore();
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
}

// ===== REDRAW =====
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  elements.forEach(el => el.draw());
}

// ===== MOUSE EVENTS =====
canvas.addEventListener("mousedown", e => {

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  for (let i = elements.length - 1; i >= 0; i--) {

    if (elements[i].isInside(mx, my)) {

      selectedElement = elements[i];
      offsetX = mx - selectedElement.x;
      offsetY = my - selectedElement.y;

      isDragging = true;
      redraw();
      return;
    }
  }

  selectedElement = null;
  redraw();
});

canvas.addEventListener("mousemove", e => {

  if (!isDragging || !selectedElement) return;

  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  selectedElement.x = mx - offsetX;
  selectedElement.y = my - offsetY;

  redraw();
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

// ===== SLIDERS =====
rotateSlider.addEventListener("input", e => {
  if (!selectedElement) return;
  selectedElement.rotation = parseFloat(e.target.value);
  redraw();
});

xSlider.addEventListener("input", e => {
  if (!selectedElement) return;
  selectedElement.x = parseFloat(e.target.value);
  redraw();
});

ySlider.addEventListener("input", e => {
  if (!selectedElement) return;
  selectedElement.y = parseFloat(e.target.value);
  redraw();
});

// ===== LAYER CONTROLS =====
function bringForward() {

  if (!selectedElement) return;

  const i = elements.indexOf(selectedElement);

  if (i < elements.length - 1) {
    [elements[i], elements[i + 1]] =
    [elements[i + 1], elements[i]];

    redraw();
  }
}

function sendBackward() {

  if (!selectedElement) return;

  const i = elements.indexOf(selectedElement);

  if (i > 0) {
    [elements[i], elements[i - 1]] =
    [elements[i - 1], elements[i]];

    redraw();
  }
}

function deleteSelected() {

  if (!selectedElement) return;

  elements = elements.filter(el => el !== selectedElement);
  selectedElement = null;

  redraw();
}

// ===== DOWNLOAD =====
function downloadImage() {

  const link = document.createElement("a");

  link.download = "face.png";
  link.href = canvas.toDataURL();

  link.click();
}

// ===== ADD ELEMENT =====
function addElement(src) {

  const img = new Image();
  img.src = src;

  img.onload = () => {

    let type = "element";

    if (src.includes("/face/")) type = "face";
    else if (src.includes("/eyes/")) type = "eyes";
    else if (src.includes("/eyebrows/")) type = "eyebrows";
    else if (src.includes("/nose/")) type = "nose";
    else if (src.includes("/lips/")) type = "lips";
    else if (src.includes("/hair/")) type = "hair";
    else if (src.includes("/beard/")) type = "beard";
    else if (src.includes("/moustache/")) type = "moustache";
    else if (src.includes("/left_ears/")) type = "left ear";
    else if (src.includes("/right_ears/")) type = "right ear";

    // Replace only same feature
    if (type !== "left ear" && type !== "right ear") {

      const existing = elements.find(el => el.type === type);

      if (existing) {
        elements.splice(elements.indexOf(existing), 1);
      }
    }

    let x = canvas.width / 2 - img.width / 4;
    let y = canvas.height / 2 - img.height / 4;

    const el = new Element(img, x, y, type);

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

    redraw();
  };
}

// ===== LOAD ASSETS =====
function loadAssets(id, path, count) {

  const container = document.getElementById(id);

  for (let i = 1; i <= count; i++) {

    const num = String(i).padStart(2, "0");

    const img = document.createElement("img");

    img.src = `assets/${path}/${num}.png`;
    img.className = "draggable";

    container.appendChild(img);
  }
}

// ===== CLICK EVENTS =====
document.addEventListener("click", e => {

  if (!e.target.classList.contains("draggable")) return;

  addElement(e.target.src);
});

// ===== INIT =====
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

};
