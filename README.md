# 🎨 Interactive Face Builder
<img width="1024" height="550" alt="image" src="https://github.com/user-attachments/assets/02329de9-2061-4ce2-a929-b77557a7b27b" />

An interactive **face generation web application** built using **HTML5 Canvas and JavaScript**, allowing users to create custom avatars by combining modular facial components like eyes, nose, hair, and more.

---

## 🚀 Features

* 🧩 **Modular Face Construction**
  Build faces using different components (eyes, nose, lips, hair, etc.)

* 🖱️ **Drag & Drop Interaction**
  Move elements freely across the canvas

* 🔄 **Resize & Rotate Elements**
  Fine-tune each component using resize handles and sliders

* 🧱 **Layer Management System**
  Control stacking order (bring forward / send backward)

* 🎯 **Smart Auto-Positioning**
  Facial components automatically align relative to the face

* ⌨️ **Keyboard Shortcuts**

  * Arrow keys → Move elements
  * Shift + Arrow → Change layer
  * Delete → Remove element

* 📥 **Export as Image**
  Download your final face as a PNG image

* ⚡ **Dynamic Asset Loading**
  Automatically loads assets from folders

---

## 🧠 Tech Stack

* **HTML5 Canvas** → Rendering graphics
* **JavaScript (Vanilla JS)** → Logic & interactions
* **CSS3** → UI styling & animations

---

## 🏗️ Project Structure

```
📁 project-folder
│── index.html        # Main UI layout
│── style.css         # Styling and layout
│── script.js         # Core logic and interactions
│── assets/           # Facial components (images)
```

---

## ⚙️ How It Works

1. User selects facial components from the left panel
2. Components are added to the canvas as objects
3. Each element maintains its own:

   * Position (x, y)
   * Size (width, height)
   * Rotation
   * Layer priority
4. Canvas re-renders all elements dynamically
5. Final image can be exported as PNG

---

## 🧩 Core Concepts Implemented

* **Object-Oriented Design** (Element class)
* **Canvas Rendering Engine**
* **Event Handling (Mouse + Keyboard)**
* **State Management using arrays**
* **Layer-based Rendering System**
* **Dynamic UI updates**

---

## 📸 Demo Preview

> Add your project screenshot here
> (example: `/assets/demo.png`)

---

## ⚠️ Limitations

* No undo/redo functionality
* No persistent save/load feature
* Limited mobile responsiveness

---

## 🚀 Future Improvements

* Add undo/redo functionality
* Save & load designs
* AI-based face generation
* Mobile-friendly UI
* Advanced filters & effects

---

## 💡 Learnings

This project helped me understand:

* Real-time canvas rendering
* Event-driven programming
* UI/UX design principles
* Managing complex state in frontend applications

---
📌 Author

Your Name - Anshul Rajpoot
Branch- Electronics and Communication Engineering
