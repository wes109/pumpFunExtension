// Default values
const DEFAULT_AMOUNT = 5;
const DEFAULT_DELAY = 5;

// Load saved values when popup opens
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['pumpFunAmount', 'pumpFunDelay'], function(result) {
        document.getElementById('amountInput').value = result.pumpFunAmount || DEFAULT_AMOUNT;
        document.getElementById('delayInput').value = result.pumpFunDelay || DEFAULT_DELAY;
    });
});

document.getElementById('applyButton').addEventListener('click', function() {
    const amount = document.getElementById('amountInput').value || DEFAULT_AMOUNT;
    const delay = document.getElementById('delayInput').value || DEFAULT_DELAY;
    
    chrome.storage.local.set({ 
        'pumpFunAmount': amount,
        'pumpFunDelay': delay
    }, function() {
        console.log('Settings saved:', { amount, delay });
    });
}); 