const MAX_WORDS = 10000;

// IMPORTANT: set this to your Worker URL after you deploy it.
const WORKER_URL = "https://YOUR-WORKER.your-subdomain.workers.dev/humanize";

const elInput = document.getElementById("input");
const elOutput = document.getElementById("output");
const elWord = document.getElementById("wordCount");
const elMode = document.getElementById("mode");
const elStrength = document.getElementById("strength");
const elStatus = document.getElementById("status");

const btnHumanize = document.getElementById("btnHumanize");
const btnClear = document.getElementById("btnClear");
const btnCopy = document.getElementById("btnCopy");

function countWords(text){
  const m = text.trim().match(/\b[\p{L}\p{N}']+\b/gu);
  return m ? m.length : 0;
}

function updateCounts(){
  const words = countWords(elInput.value);
  elWord.textContent = String(words);
  btnHumanize.disabled = words === 0 || words > MAX_WORDS;
  if (words > MAX_WORDS) elStatus.textContent = "Too long: please stay within 10,000 words.";
  else elStatus.textContent = "";
}

elInput.addEventListener("input", updateCounts);
updateCounts();

btnClear.addEventListener("click", () => {
  elInput.value = "";
  elOutput.value = "";
  updateCounts();
});

btnCopy.addEventListener("click", async () => {
  const t = elOutput.value.trim();
  if (!t) return;
  await navigator.clipboard.writeText(t);
  btnCopy.textContent = "Copied!";
  setTimeout(() => (btnCopy.textContent = "Copy output"), 900);
});

btnHumanize.addEventListener("click", async () => {
  const text = elInput.value;
  const words = countWords(text);
  if (!words || words > MAX_WORDS) return;

  btnHumanize.disabled = true;
  elStatus.textContent = "Rewriting…";

  try{
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        mode: elMode.value,
        strength: elStrength.value
      })
    });

    if (!res.ok){
      const err = await res.text();
      throw new Error(err || `HTTP ${res.status}`);
    }

    const data = await res.json();
    elOutput.value = data.rewritten || "";
    elStatus.textContent = "Done.";
  } catch (e){
    elStatus.textContent = `Error: ${e.message}`;
  } finally{
    btnHumanize.disabled = false;
  }
});
