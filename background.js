// Store active connections
let connections = new Map();

// Single connection listener
chrome.runtime.onConnect.addListener((port) => {
    console.log('[BACKGROUND] New connection from:', port.sender.tab.url);
    
    // Store the connection
    const tabId = port.sender.tab.id;
    connections.set(tabId, port);

    // Handle disconnection
    port.onDisconnect.addListener(() => {
        console.log('[BACKGROUND] Port disconnected:', tabId);
        connections.delete(tabId);
    });

    // Handle messages
    port.onMessage.addListener((msg) => {
        console.log('[BACKGROUND] Received message:', msg.type, 'from tab:', tabId);

        if (msg.type === 'requestImage') {
            console.log('[BACKGROUND] Looking for Discord tab to request image');
            // Forward request to Discord tab
            chrome.tabs.query({url: '*://*.discord.com/*'}, (tabs) => {
                if (tabs.length > 0) {
                    const discordTab = tabs[0];
                    const discordPort = connections.get(discordTab.id);
                    if (discordPort) {
                        console.log('[BACKGROUND] Forwarding request to Discord tab:', discordTab.id);
                        discordPort.postMessage({ type: 'requestImage' });
                    } else {
                        console.error('[BACKGROUND] No connection to Discord tab');
                    }
                } else {
                    console.error('[BACKGROUND] No Discord tab found');
                }
            });
        }
        
        if (msg.type === 'transferImage') {
            console.log('[BACKGROUND] Received image URL, looking for pump.fun tab');
            // Forward image to pump.fun tab
            chrome.tabs.query({url: '*://*.pump.fun/create*'}, (tabs) => {
                if (tabs.length > 0) {
                    const pumpTab = tabs[0];
                    const pumpPort = connections.get(pumpTab.id);
                    if (pumpPort) {
                        console.log('[BACKGROUND] Forwarding image to pump.fun tab:', pumpTab.id);
                        pumpPort.postMessage({
                            type: 'transferImage',
                            imageUrl: msg.imageUrl
                        });
                    } else {
                        console.error('[BACKGROUND] No connection to pump.fun tab');
                    }
                } else {
                    console.error('[BACKGROUND] No pump.fun tab found');
                }
            });
        }
    });
}); 