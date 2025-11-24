# LeetBot

LeetBot is an advanced AI-powered companion for LeetCode, designed to supercharge your problem-solving experience with interactive hints, solution planning, and visual explanations. Built as a browser extension, LeetBot brings a modern, glassmorphic UI, physics-based window interactions, and zoomable graph visualizations directly to your coding workflow.

---

## Features

### 🧠 AI Tutor, Planner, and Hint Modes
- **Tutor Mode:** Get detailed explanations of problem concepts and solution strategies.
- **Hint Mode:** Receive subtle, step-by-step hints without spoiling the solution.
- **Planner Mode:** Collaboratively plan brute-force and optimized solutions, with context-aware guidance.

### 📈 Interactive Graph Visualizations
- **Mermaid.js Diagrams:** Automatically generates flowcharts, trees, and sequence diagrams for problems and solutions.
- **Zoom & Pan:** Explore large graphs with pinch-to-zoom, drag, and reset controls.
- **Responsive Node Sizing:** Node and text sizes scale with the window for maximum readability.

### 🪟 Glassmorphic Floating Window
- **Jelly Physics:** Drag the window with a smooth, springy "jelly" effect for a delightful UX.
- **Resizable & Movable:** Snap, resize, and reposition the window anywhere on your screen.
- **Theme Matching:** UI colors and accents match the LeetCode theme for seamless integration.

### 🔑 Gemini/AI API Integration
- **Configurable API Key:** Securely store and manage your Gemini/AI API key in local storage.
- **Model Selection:** Choose between different AI models for tailored responses.

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/vasu-devs/LeetBot.git
cd LeetBot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Extension
```bash
npm run build
```

### 4. Load into Browser (Chrome/Edge)
1. Go to `chrome://extensions` (or Edge equivalent).
2. Enable **Developer Mode**.
3. Click **Load unpacked** and select the `dist/` folder.

---

## Usage

- Click the floating brain icon on any LeetCode problem page to open LeetBot.
- Select a mode (Tutor, Hint, Planner) to start interacting.
- Ask questions, request hints, or plan solutions. Use the chat input for follow-ups.
- View AI-generated diagrams and zoom/pan for clarity.
- Resize and move the window as needed.

---

## Configuration

- **API Key:** Enter your Gemini/AI API key in the settings panel (gear icon).
- **Theme:** Toggle between dark and light modes to match your preference.
- **Model:** Select the AI model for responses.

---

## Technologies Used

- **React** (UI & State Management)
- **Vite** (Build Tool)
- **Framer Motion** (Physics-based animations)
- **Mermaid.js** (Graph visualizations)
- **react-zoom-pan-pinch** (Graph interaction)
- **TypeScript** (Type safety)

---

## Development

### Scripts
- `npm run build` — Build the extension for production.
- `npm run dev` — Start development server (for popup/content scripts).

### Folder Structure
```
LeetBot/
├── public/
├── scripts/
├── src/
│   ├── background/
│   ├── content/
│   ├── logic/
│   ├── services/
│   ├── store_assets/
│   ├── main.tsx
│   ├── style.css
│   └── counter.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vite.background.config.ts
├── vite.content.config.ts
```

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License.

---

## Credits

- Developed by [vasu-devs](https://github.com/vasu-devs)
- Powered by Gemini/AI
- Inspired by the LeetCode community

---

## Screenshots

> _Add screenshots of the extension in action for better visibility._

---

## Troubleshooting

- If diagrams are not rendering, ensure your API key is valid and the extension is loaded on a LeetCode problem page.
- For UI issues, try resizing or resetting the window position.
- For build errors, ensure all dependencies are installed and Node.js is up to date.

---

## Contact

For support or feature requests, open an issue or contact [vasu-devs](https://github.com/vasu-devs).

---

Happy Coding! 🚀
