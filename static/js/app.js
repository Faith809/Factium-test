
// --- State Management ---
const state = {
    keys: {
        google: localStorage.getItem('factium_api_google') || '',
        openai: localStorage.getItem('factium_api_openai') || ''
    },
    userProfile: JSON.parse(localStorage.getItem('factium_profile') || '{}'),
    activeModel: localStorage.getItem('factium_active_model') || 'factium-native',
    customModels: JSON.parse(localStorage.getItem('factium_custom_models') || '[]'),
    researchMode: 'RESTRICTED'
};

const defaultModels = [
    { id: 'factium-native', name: 'Factium Native (Gemini)', provider: 'Google', description: 'Core intelligence engine.' },
    { id: 'legal-eagle', name: 'Legal Eagle', provider: 'Factium', description: 'Policy and law specialist.' },
    { id: 'finance-tracer', name: 'Finance Tracer', provider: 'Factium', description: 'Financial forensics.' }
];

// --- Core Initialization ---
function init() {
    renderNav();
    renderDashboard();
    updateModelSelectors();
    updateActiveModel(state.activeModel);
    renderIntegratedList();
    loadProfileInputs();
}

// --- View Navigation ---
function showView(viewId) {
    document.querySelectorAll('[id^="view-"]').forEach(v => v.classList.add('hidden-section'));
    document.getElementById(`view-${viewId}`).classList.remove('hidden-section');
    
    // Auto-fill keys if entering Models view
    if(viewId === 'models') {
        document.getElementById('api-key-google').value = state.keys.google;
        document.getElementById('api-key-openai').value = state.keys.openai;
    }
}

// --- API Guardian System ---
async function secureApiCall(endpoint, payload) {
    // 1. Ensure primary key exists
    if (!state.keys.google) {
        showKeyModal(payload.modelId || state.activeModel);
        throw new Error("API_KEY_MISSING");
    }

    // 2. Add key to payload
    const finalPayload = { ...payload, apiKey: state.keys.google };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload)
        });

        if (response.status === 401 || response.status === 403) {
            showKeyModal(payload.modelId || state.activeModel);
            throw new Error("UNAUTHORIZED");
        }

        return await response.json();
    } catch (err) {
        console.error("API Call Failed:", err);
        if(err.message !== "API_KEY_MISSING") alert("Connection Error. Ensure you have an active internet connection.");
        throw err;
    }
}

// --- Key Modal Logic ---
function showKeyModal(modelId) {
    document.getElementById('modal-target-model').innerText = modelId.toUpperCase();
    document.getElementById('modal-key-required').classList.remove('hidden');
}

function hideModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function saveKeyFromModal() {
    const key = document.getElementById('modal-key-input').value;
    if(!key) return alert("Key is required.");
    
    state.keys.google = key;
    localStorage.setItem('factium_api_google', key);
    hideModal('modal-key-required');
    alert("Key validated. Retrying operation...");
}

// --- Neural Armory Logic ---
function saveAllKeys() {
    state.keys.google = document.getElementById('api-key-google').value;
    state.keys.openai = document.getElementById('api-key-openai').value;
    localStorage.setItem('factium_api_google', state.keys.google);
    localStorage.setItem('factium_api_openai', state.keys.openai);
    alert("Vault Updated Successfully.");
}

function createCustomModel() {
    const name = document.getElementById('cust-name').value;
    const id = document.getElementById('cust-id').value;
    const prompt = document.getElementById('cust-prompt').value;

    if(!name || !id || !prompt) return alert("Incomplete forging data.");

    const newModel = { id, name, provider: 'Custom', description: 'User-defined logic.', prompt };
    state.customModels.push(newModel);
    localStorage.setItem('factium_custom_models', JSON.stringify(state.customModels));
    
    updateModelSelectors();
    renderIntegratedList();
    alert(`Model [${name}] has been integrated into the terminal.`);
}

function renderIntegratedList() {
    const list = document.getElementById('integrated-list');
    const all = [...defaultModels, ...state.customModels];
    list.innerHTML = all.map(m => `
        <div class="p-4 bg-surface border border-border rounded-xl flex justify-between items-center">
            <div>
                <div class="font-bold text-sm">${m.name}</div>
                <div class="text-[9px] text-text-muted uppercase">${m.provider} Integration</div>
            </div>
            <span class="text-[9px] px-2 py-1 bg-green-900/20 text-green-500 rounded border border-green-900/30">ACTIVE</span>
        </div>
    `).join('');
}

// --- UI Updates ---
function updateActiveModel(id) {
    state.activeModel = id;
    localStorage.setItem('factium_active_model', id);
    document.getElementById('status-active-model').innerText = id.toUpperCase();
}

function updateModelSelectors() {
    const all = [...defaultModels, ...state.customModels];
    const html = all.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    ['research-model', 'fact-model', 'policy-model'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = html;
    });
}

// --- Feature Logic ---
async function runResearch() {
    const query = document.getElementById('research-query').value;
    if(!query) return;
    
    const container = document.getElementById('research-results');
    container.innerHTML = `<div class="p-8 text-center text-primary font-mono animate-pulse uppercase text-xs">Accessing Global Grid...</div>`;

    try {
        const data = await secureApiCall('/api/research', { query, modelId: state.activeModel, mode: state.researchMode });
        container.innerHTML = `
            <div class="glass-panel p-6 rounded-2xl border-l-4 border-primary">
                <div class="prose prose-invert max-w-none text-sm">${marked.parse(data.summary)}</div>
            </div>
        `;
    } catch(e) { container.innerHTML = ""; }
}

async function runFactCheck() {
    const text = document.getElementById('fact-text').value;
    if(!text) return;
    const data = await secureApiCall('/api/factcheck', { text, modelId: state.activeModel });
    document.getElementById('fact-results').innerHTML = `<div class="glass-panel p-6 mt-4 rounded-xl border-l-4 border-green-500"><h4 class="font-bold">Bias Score: ${data.score}/100</h4><p class="text-sm text-text-muted mt-2">${data.reasoning}</p></div>`;
}

// --- Utility Functions ---
function renderNav() {
    const nav = document.getElementById('nav-links');
    const items = [
        { id: 'dashboard', label: 'Overview' },
        { id: 'research', label: 'Research Terminal' },
        { id: 'fact-check', label: 'Fact Checker' },
        { id: 'policy', label: 'Policy Simulator' },
        { id: 'models', label: 'Neural Armory' },
        { id: 'profile', label: 'User Matrix' }
    ];
    nav.innerHTML = items.map(i => `<button onclick="showView('${i.id}')" class="block w-full text-left px-4 py-3 text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 uppercase tracking-widest">${i.label}</button>`).join('');
}

function renderDashboard() {
    const grid = document.getElementById('dashboard-grid');
    const items = [
        { id: 'research', label: 'Research Terminal', desc: 'Deep data extraction.' },
        { id: 'fact-check', label: 'Fact Checker', desc: 'Bias diagnostic engine.' },
        { id: 'policy', label: 'Policy Simulator', desc: 'Personal impact mapping.' }
    ];
    grid.innerHTML = items.map(i => `
        <div onclick="showView('${i.id}')" class="glass-panel p-8 rounded-2xl cursor-pointer hover:border-primary transition-all group">
            <h3 class="text-xl font-bold mb-2 uppercase tracking-tighter">${i.label}</h3>
            <p class="text-xs text-text-muted mb-4">${i.desc}</p>
            <span class="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">INITIALIZE MODULE →</span>
        </div>
    `).join('');
}

function saveProfile() {
    const profile = {
        name: document.getElementById('prof-name').value,
        location: document.getElementById('prof-loc').value,
        incomeRange: document.getElementById('prof-income').value
    };
    localStorage.setItem('factium_profile', JSON.stringify(profile));
    state.userProfile = profile;
    alert("User Matrix Synchronized.");
}

function loadProfileInputs() {
    const p = state.userProfile;
    if(p.name) document.getElementById('prof-name').value = p.name;
    if(p.location) document.getElementById('prof-loc').value = p.location;
}

// Start
init();
