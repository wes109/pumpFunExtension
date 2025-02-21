// Global port for communication
let port = chrome.runtime.connect({ name: 'image-port' });
let isProcessing = false;

// Function to get image from Discord
function getLastEmbeddedImage() {
    try {
        const selectors = [
            'div[class*="embedMedia"] img',
            'div[class*="imageContent"] img',
            'div[class*="embedMedia"] a[href*="cdn.discordapp.com"]'
        ];

        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                const lastElement = elements[elements.length - 1];
                return lastElement.src || lastElement.href;
            }
        }
        return null;
    } catch (error) {
        console.error('Error getting image:', error);
        return null;
    }
}

// Ensure fresh port connection
function ensureConnection() {
    if (!port) {
        console.log('Reconnecting port...');
        port = chrome.runtime.connect({ name: 'image-port' });
        setupPortListeners();
    }
    return port;
}

// Set up port listeners
function setupPortListeners() {
    port.onDisconnect.addListener(() => {
        console.log('Port disconnected');
        port = null;
        setTimeout(ensureConnection, 100);
    });
}

// Handle Discord page
if (window.location.href.includes('discord.com/channels')) {
    setupPortListeners();
    
    port.onMessage.addListener((msg) => {
        console.log('Discord received message:', msg.type);
        if (msg.type === 'requestImage' && !isProcessing) {
            isProcessing = true;
            const imageUrl = getLastEmbeddedImage();
            if (imageUrl) {
                console.log('Found image URL:', imageUrl);
                ensureConnection().postMessage({
                    type: 'transferImage',
                    imageUrl: imageUrl
                });
            }
            setTimeout(() => { isProcessing = false; }, 500);
        }
    });
}

// Handle Pump.fun page
if (window.location.href.includes('pump.fun/create')) {
    // Input restrictions
    function applyInputRestrictions() {
        const nameInput = document.querySelector('input[id="name"]');
        if (nameInput) nameInput.maxLength = 32;

        const tickerInput = document.querySelector('input[id="ticker"]');
        if (tickerInput) tickerInput.maxLength = 10;

        const amountInput = document.querySelector('input[id="amount"]');
        if (amountInput) {
            chrome.storage.local.get(['pumpFunAmount'], function(result) {
                if (!amountInput.value) {
                    amountInput.value = result.pumpFunAmount || 5;
                    amountInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }
    }

    // Apply restrictions with debounce
    let restrictionTimeout = null;
    const observer = new MutationObserver(() => {
        if (restrictionTimeout) clearTimeout(restrictionTimeout);
        restrictionTimeout = setTimeout(applyInputRestrictions, 100);
    });

    applyInputRestrictions();
    observer.observe(document.body, { childList: true, subtree: true });

    // Create button
    const button = document.createElement('button');
    button.id = 'grabDiscordImage';
    button.textContent = 'GRAB DISCORD IMAGE';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 30px 60px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        z-index: 999999;
        transition: background-color 0.2s;
    `;

    button.addEventListener('click', () => {
        if (isProcessing) return;
        
        button.style.backgroundColor = '#ff6666';
        isProcessing = true;

        console.log('Requesting image from Discord');
        ensureConnection().postMessage({ 
            type: 'requestImage'
        });

        setTimeout(() => {
            button.style.backgroundColor = '#ff4444';
            isProcessing = false;
        }, 1000);
    });

    document.body.appendChild(button);

    // Handle incoming images
    setupPortListeners();
    port.onMessage.addListener(async (msg) => {
        console.log('Pump.fun received message:', msg.type);
        if (msg.type === 'transferImage' && msg.imageUrl) {
            try {
                console.log('Processing image:', msg.imageUrl);
                const response = await fetch(msg.imageUrl);
                if (!response.ok) throw new Error('Fetch failed');
                
                const blob = await response.blob();
                const file = new File([blob], 'image.png', { type: 'image/png' });
                
                const fileInput = document.querySelector('input[type="file"][accept="video/*,image/*"]');
                if (!fileInput) throw new Error('File input not found');

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                
                // Dispatch both events with a small delay
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                setTimeout(() => {
                    fileInput.dispatchEvent(new Event('input', { bubbles: true }));
                }, 50);
                
                console.log('Image attached successfully');
            } catch (error) {
                console.error('Error processing image:', error);
            } finally {
                isProcessing = false;
                button.style.backgroundColor = '#ff4444';
            }
        }
    });
} 