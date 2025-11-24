import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // We will need to make sure this css is injected or handled correctly

const rootId = 'leetbot-root';

// Function to inject the app
function injectApp() {
    const existingRoot = document.getElementById(rootId);
    if (existingRoot) return;

    const rootDiv = document.createElement('div');
    rootDiv.id = rootId;
    rootDiv.style.position = 'fixed';
    rootDiv.style.top = '0';
    rootDiv.style.left = '0';
    rootDiv.style.width = '100vw';
    rootDiv.style.height = '100vh';
    rootDiv.style.zIndex = '2147483647';
    rootDiv.style.pointerEvents = 'none'; // Let clicks pass through the container, enable on children

    document.body.appendChild(rootDiv);

    // We use Shadow DOM to isolate styles
    const shadow = rootDiv.attachShadow({ mode: 'open' });

    // Inject styles into shadow DOM
    // In a real build, we might need to fetch the CSS file URL from chrome.runtime.getURL
    // For this simple setup, we might need to manually inject the CSS string or link
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = chrome.runtime.getURL('assets/content.css');
    shadow.appendChild(styleLink);

    const reactRoot = ReactDOM.createRoot(shadow);
    reactRoot.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

// Inject when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectApp);
} else {
    injectApp();
}
