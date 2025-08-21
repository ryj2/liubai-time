// Wrap the entire application logic in a function to avoid polluting the global scope.
const runApp = () => {
    // --- 1. Element Discovery ---
    // Find all necessary elements first. If any are missing, halt execution.
    const elements = {
        paper: document.getElementById('paper'),
        buttonContainer: document.getElementById('button-container'),
        tearBtn: document.getElementById('tear-btn'),
        app: document.getElementById('app'),
        contentWrapper: document.getElementById('content-wrapper'),
        finalMessage: document.getElementById('final-message'),
        breathingOverlay: document.getElementById('breathing-overlay'),
        breathingText: document.getElementById('breathing-text'),
        strikethroughText: document.getElementById('strikethrough-text'),
        transitionMessage: document.getElementById('transition-message')
    };

    for (const key in elements) {
        if (!elements[key]) {
            console.error(`Initialization failed: Element with ID '${key}' not found.`);
            document.body.innerHTML = `<p style="font-family: sans-serif; text-align: center; color: #A9A9A9; margin-top: 40vh;">应用程序加载失败。<br>一个关键组件丢失，请检查HTML文件是否完整。</p>`;
            return; // Stop the app
        }
    }

    // --- 2. Fullscreen Logic ---
    const requestFullscreen = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => console.warn(`Fullscreen request failed: ${err.message}`));
        }
    };
    document.body.addEventListener('click', requestFullscreen, { once: true });
    document.body.addEventListener('keydown', requestFullscreen, { once: true });

    // --- 3. Core App Logic ---
    const messages = [
        "现在，去喝一口水。", "抬头看看窗外吧。", "给自己一个微笑。",
        "你已经做得很好了。", "世界很温柔，你也是。"
    ];

    const checkButtonVisibility = () => {
        elements.buttonContainer.classList.toggle('visible', elements.paper.value.trim() !== '');
    };

    elements.paper.addEventListener('input', () => {
        localStorage.setItem('text', elements.paper.value);
        checkButtonVisibility();
    });

    const startShredding = () => {
        elements.contentWrapper.style.display = 'none';
        elements.buttonContainer.style.display = 'none';
        localStorage.removeItem('text');

        const shredsContainer = document.createElement('div');
        shredsContainer.className = 'shreds-container';
        elements.app.appendChild(shredsContainer);

        for (let i = 0; i < 20; i++) {
            const shred = document.createElement('div');
            shred.className = 'shred';
            shred.style.left = `${i * 5}%`;
            shred.style.animationDelay = `${Math.random() * 1.5}s`;
            shredsContainer.appendChild(shred);
        }

        setTimeout(() => {
            elements.transitionMessage.textContent = "纸上的内容已被彻底撕去。";
            elements.transitionMessage.classList.remove('hidden');
            setTimeout(() => {
                elements.transitionMessage.classList.add('hidden');
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                elements.finalMessage.textContent = randomMessage;
                elements.finalMessage.classList.add('visible');
                setTimeout(() => window.close(), 4000);
            }, 3000);
        }, 5000);
    };

    const startBreathingExercise = () => {
        elements.strikethroughText.textContent = elements.paper.value || "（这是一片空白）";
        elements.breathingOverlay.classList.remove('hidden');
        elements.tearBtn.disabled = true;

        const runCycle = (cycle) => {
            if (cycle >= 3) {
                elements.breathingOverlay.classList.add('hidden');
                startShredding();
                return;
            }
            elements.breathingText.textContent = "吸气...";
            setTimeout(() => { elements.breathingText.textContent = "呼气..."; }, 2500);
            setTimeout(() => runCycle(cycle + 1), 5000);
        };
        runCycle(0);
    };

    elements.tearBtn.addEventListener('click', startBreathingExercise);

    // --- 4. Initial State Setup ---
    const savedText = localStorage.getItem('text');
    if (savedText) {
        elements.paper.value = savedText;
    }
    checkButtonVisibility();
};

// --- Service Worker Registration ---
// Only register service worker when not on file:// protocol
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('ServiceWorker registration successful:', reg.scope))
            .catch(err => console.warn('ServiceWorker registration failed:', err));
    });
}

// --- App Initialization ---
// Since the script is at the end of the <body>, the DOM is ready.
// We wait for the 'load' event to ensure all resources (like fonts) are loaded.
window.addEventListener('load', runApp);