# 🌌 Zero-Gravity To-Do List

A futuristic, interactive single-page To-Do List application built with **React**, **Tailwind CSS (v4)**, and **Matter.js** (a 2D physics engine). 

Tasks float dynamically on your screen like astronauts in outer space. You can grab, toss, and throw them. To delete a task, throw it directly into the pulsating black hole in the bottom-right corner!

---

## 🚀 Features

* **Zero-Gravity Physics:** Tasks float freely, rotate, and bounce off the edges of the viewport.
* **Interactive Mouse Controls:** Grab tasks with your mouse cursor and throw them in any direction.
* **Gravitational Black Hole:** An animated black hole in the corner that actively sucks in nearby tasks and consumes them.
* **Glassmorphic UI Overlay:** A sleek, modern user interface with neon accents and space-themed aesthetics.

---

## 🛠️ Tech Stack

* **Framework:** React 19 + Vite
* **Styling:** Tailwind CSS v4
* **Physics Engine:** Matter.js
* **Typography:** Space Mono (Google Fonts)

---

## 📦 Installation & Setup

1. **Clone or create your project directory:**
   ```bash
   npx create-vite@latest zero-gravity-todo --template react
   cd zero-gravity-todo
   ```

2. **Install dependencies:**
   ```bash
   npm install matter-js
   npm install -D tailwindcss @tailwindcss/vite
   ```

3. **Configure Vite (Vite + Tailwind v4):**
   Update your `vite.config.js` to include the Tailwind CSS v4 plugin:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import tailwindcss from '@tailwindcss/vite'

   export default defineConfig({
     plugins: [
       react(),
       tailwindcss(),
     ],
   })
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

---

## 🎮 How to Play / Use

1. Enter a task in the input field and click **Add** (or press Enter).
2. Click and hold any floating task to drag it around.
3. Flick or throw the task with your mouse cursor.
4. Drag or throw it near the bottom-right corner to let the gravity of the black hole capture and permanently delete it.
