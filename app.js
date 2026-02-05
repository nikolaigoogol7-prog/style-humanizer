const WORKER_URL = "https://bold-feather-03a6.nikolaigoogol7.workers.dev/humanize";

const input = document.getElementById('input');
const output = document.getElementById('output');
const btn = document.getElementById('btnHumanize');
const status = document.getElementById('status');

btn.addEventListener('click', async () => {
    if (!input.value.trim()) return alert("Please enter text");

    btn.disabled = true;
    btn.innerText = "Processing...";
    status.innerText = "AI is rewriting...";

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                text: input.value,
                mode: document.getElementById('mode').value 
            })
        });

        const data = await response.json();
        if (data.rewritten) {
            output.value = data.rewritten;
            status.innerText = "Done!";
        } else {
            status.innerText = "Error: " + data.error;
        }
    } catch (e) {
        status.innerText = "Connection Error. Make sure Worker is deployed.";
    } finally {
        btn.disabled = false;
        btn.innerText = "Humanize Text";
    }
});
