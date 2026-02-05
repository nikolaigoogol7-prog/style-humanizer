// app.js

const inputArea = document.getElementById('input');
const outputArea = document.getElementById('output');
const btnHumanize = document.getElementById('btnHumanize');
const btnClear = document.getElementById('btnClear');
const btnCopy = document.getElementById('btnCopy');
const wordCountDisplay = document.getElementById('wordCount');
const statusHint = document.getElementById('status');
const modeSelect = document.getElementById('mode');
const strengthSelect = document.getElementById('strength');

const WORKER_URL = "https://your-worker-name.workers.dev/humanize";

// 1. Word Counter Logic
inputArea.addEventListener('input', () => {
    const words = inputArea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    wordCountDisplay.innerText = words;
    if (words > 10000) {
        wordCountDisplay.style.color = "red";
    } else {
        wordCountDisplay.style.color = "inherit";
    }
});

// 2. Clear Button
btnClear.addEventListener('click', () => {
    inputArea.value = "";
    outputArea.value = "";
    wordCountDisplay.innerText = "0";
    statusHint.innerText = "";
});

// 3. Copy Button
btnCopy.addEventListener('click', () => {
    if (!outputArea.value) return;
    navigator.clipboard.writeText(outputArea.value);
    btnCopy.innerText = "Copied!";
    setTimeout(() => btnCopy.innerText = "Copy output", 2000);
});

// 4. MAIN HUMANIZE FUNCTION
btnHumanize.addEventListener('click', async () => {
    const text = inputArea.value.trim();
    
    if (!text) {
        statusHint.innerText = "⚠️ Please enter some text first.";
        return;
    }

    // UI Feedback
    btnHumanize.disabled = true;
    btnHumanize.innerText = "Processing...";
    statusHint.innerText = "Connecting to AI engine...";

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: text,
                mode: modeSelect.value,
                strength: strengthSelect.value
            })
        });

        const data = await response.json();

        if (data.rewritten) {
            outputArea.value = data.rewritten;
            statusHint.innerText = "✅ Successfully humanized!";
        } else {
            statusHint.innerText = "❌ Error: " + (data.error || "Unknown error.");
        }
    } catch (error) {
        statusHint.innerText = "❌ Connection Error. Check your Worker URL.";
        console.error(error);
    } finally {
        btnHumanize.disabled = false;
        btnHumanize.innerText = "Humanize";
    }
});
