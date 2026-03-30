const STORAGE_KEY = "character_hub_worker_url";
const SAMPLE_SIZE = 120;

const workerUrlInput = document.getElementById("workerUrl");
const workerStatus = document.getElementById("workerStatus");
const characterCountInput = document.getElementById("characterCount");
const characterGrid = document.getElementById("characterGrid");
const characterSelect = document.getElementById("characterSelect");
const chatLog = document.getElementById("chatLog");
const messageInput = document.getElementById("messageInput");

const adjectivePool = [
  "Arcane",
  "Neon",
  "Astral",
  "Quantum",
  "Velvet",
  "Solar",
  "Mythic",
  "Binary",
  "Echo",
  "Rune",
];

const rolePool = [
  "Strategist",
  "Warden",
  "Archivist",
  "Pilot",
  "Mentor",
  "Composer",
  "Navigator",
  "Engineer",
  "Alchemist",
  "Historian",
];

function pseudoCharacter(index) {
  const adjective = adjectivePool[index % adjectivePool.length];
  const role = rolePool[(index * 7) % rolePool.length];
  return {
    id: index,
    name: `${adjective} ${role} #${index + 1}`,
    bio: `I am ${adjective.toLowerCase()} and specialize in ${role.toLowerCase()} workflows.`,
  };
}

function renderCharacters() {
  const target = characterCountInput.value.trim();
  const parsed = BigInt(target || "0");

  const countText = parsed > BigInt(SAMPLE_SIZE)
    ? `${SAMPLE_SIZE.toLocaleString()} preview characters shown out of ${parsed.toString()}`
    : `${Number(parsed).toLocaleString()} characters shown`;

  workerStatus.textContent = `${workerStatus.textContent.split(" • ")[0]} • ${countText}`;

  characterGrid.innerHTML = "";
  characterSelect.innerHTML = "";

  const localCount = parsed > BigInt(SAMPLE_SIZE) ? SAMPLE_SIZE : Number(parsed);

  for (let i = 0; i < localCount; i += 1) {
    const character = pseudoCharacter(i);

    const card = document.createElement("article");
    card.className = "character-card";
    card.innerHTML = `<strong>${character.name}</strong><p>${character.bio}</p>`;
    characterGrid.appendChild(card);

    const option = document.createElement("option");
    option.value = String(character.id);
    option.textContent = character.name;
    characterSelect.appendChild(option);
  }
}

function setWorkerStatus(message) {
  workerStatus.textContent = message;
}

function loadWorkerUrl() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    workerUrlInput.value = saved;
    setWorkerStatus("Worker endpoint saved locally.");
  }
}

async function sendMessage() {
  const workerUrl = workerUrlInput.value.trim();
  const prompt = messageInput.value.trim();

  if (!workerUrl) {
    setWorkerStatus("Enter a Cloudflare Worker URL first.");
    return;
  }

  if (!prompt) {
    return;
  }

  const persona = characterSelect.options[characterSelect.selectedIndex]?.text || "Unknown Character";

  const userMessage = document.createElement("div");
  userMessage.className = "msg";
  userMessage.textContent = `You → ${persona}: ${prompt}`;
  chatLog.appendChild(userMessage);

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character: persona,
        message: prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Worker returned ${response.status}`);
    }

    const data = await response.json();
    const reply = document.createElement("div");
    reply.className = "msg";
    reply.textContent = `${persona}: ${data.reply || "(no reply field found)"}`;
    chatLog.appendChild(reply);
  } catch (error) {
    const err = document.createElement("div");
    err.className = "msg";
    err.textContent = `Error: ${error.message}`;
    chatLog.appendChild(err);
  }
}

document.getElementById("saveWorker").addEventListener("click", () => {
  const value = workerUrlInput.value.trim();
  if (!value) {
    setWorkerStatus("Please provide a valid Worker URL.");
    return;
  }

  localStorage.setItem(STORAGE_KEY, value);
  setWorkerStatus("Worker endpoint saved locally.");
});

document.getElementById("generateCharacters").addEventListener("click", () => {
  try {
    const raw = characterCountInput.value.trim();
    if (!raw.match(/^\d+$/)) {
      throw new Error("Use only numeric characters.");
    }
    renderCharacters();
  } catch (error) {
    setWorkerStatus(`Character count invalid: ${error.message}`);
  }
});

document.getElementById("sendMessage").addEventListener("click", sendMessage);

loadWorkerUrl();
renderCharacters();
