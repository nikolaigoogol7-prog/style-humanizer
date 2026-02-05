const MAX_WORDS = 10000;

// ✅ YOUR REAL CLOUDFLARE WORKER ENDPOINT
const WORKER_URL =
 "https://bold-feather-03a6.nikolaigoogol7.workers.dev/humanize"

const elInput = document.getElementById("input");
const elOutput = document.getElementById("output");
const elWord = document.getElementById("wordCount");
const elMode = document.getElementById("mode");
const elStrength = document.getElementById("strength");
const elStatus = document.getElementById("status");

const btnHumanize = document.getElementById("btnHumanize");
const btnClear = document.getElementById("btnClear");
const btnCopy = document.getElementById("btnCopy");

function countWords(text) {
  const m = text.trim().match(/\b[\p{L}\p{N}']+\b/gu);
  return m ? m.length : 0;
}

function updateCounts() {
  const words = countWords(elInput.value);
  if (elWord) elWord.textContent = String(words);

  if (btnHumanize) {
    btnHumanize.disabled = words === 0 || words > MAX_WORDS;
  }

  if (elStatus) {
    elStatus.textContent =
      words > MAX_WORDS
        ? "Too long: please stay within 10,000 words."
        : "";
  }
}

if (elInput) {
  elInput.addEventListener("input", updateCounts);
  updateCounts();
}

if (btnClear) {
  btnClear.addEventListener("click", () => {
    elInput.value = "";
    elOutput.value = "";
    updateCounts();
  });
}

if (btnCopy) {
  btnCopy.addEventListener("click", async () => {
    const t = elOutput.value.trim();
    if (!t) return;
    await navigator.clipboard.writeText(t);
    btnCopy.textContent = "Copied!";
    setTimeout(() => (btnCopy.textContent = "Copy output"), 900);
  });
}

if (btnHumanize) {
  btnHumanize.addEventListener("click", async () => {
    const text = elInput.value;
    const words = countWords(text);
    if (!words || words > MAX_WORDS) return;

    btnHumanize.disabled = true;
    if (elStatus) elStatus.textContent = "Rewriting…";

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          mode: elMode ? elMode.value : "academic",
          strength: elStrength ? elStrength.value : "high"
        })
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }

      const data = await res.json();
      elOutput.value = data.rewritten || "";
      if (elStatus) elStatus.textContent = "Done.";
    } catch (e) {
      if (elStatus) elStatus.textContent = `Error: ${e.message}`;
    } finally {
      btnHumanize.disabled = false;
    }
  });
}
