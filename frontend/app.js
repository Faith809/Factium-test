
function showSection(id) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('sec-' + id).classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
}

async function executeResearch() {
    const q = document.getElementById('research-query').value;
    const results = document.getElementById('results');
    results.innerText = "Analyzing deep archives...";
    
    const res = await fetch('/api/research', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ query: q })
    });

    if (res.status === 401) {
        document.getElementById('api-modal').classList.remove('hidden');
        return;
    }

    const data = await res.json();
    results.innerText = data.text || data.error;
}

async function saveApiKey() {
    const key = document.getElementById('api-key-input').value;
    await fetch('/api/save_key', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ key: key })
    });
    document.getElementById('api-modal').classList.add('hidden');
    alert("Connection established.");
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
}

async function forgeModel() {
    const payload = {
        name: document.getElementById('m-name').value,
        id: document.getElementById('m-id').value,
        prompt: document.getElementById('m-prompt').value
    };
    await fetch('/api/add_model', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    alert("Model Forged.");
}
