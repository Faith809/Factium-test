
import { app, BrowserWindow, ipcMain, net } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let backendProcess;

// Handle internal API routing to bypass CORS and handle packaged paths
ipcMain.handle('electron-fetch', async (event, { url, options }) => {
  try {
    const response = await net.fetch(url, options);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    return {
      ok: response.ok,
      status: response.status,
      data: data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    console.error('Electron Fetch Error:', error);
    return { ok: false, status: 500, error: error.message };
  }
});

function startBackend() {
  const backendPath = path.join(__dirname, 'backend', 'server.js');
  backendProcess = fork(backendPath, [], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: app.isPackaged ? 'production' : 'development' }
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });

  backendProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Backend exited with code ${code}`);
    }
  });
}

async function createWindow() {
  // Start backend server
  startBackend();

  // FORCE CLEAN START: Clear session data to prevent "Cache Loops" or "PWA Shielding"
  // This programmatically does what "deleting %AppData%" does manually.
  if (app.isPackaged) {
    const { session } = await import('electron');
    await session.defaultSession.clearStorageData();
    await session.defaultSession.clearCache();
    console.log('Production: Session and Cache cleared for fresh start.');
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      // CRITICAL: Bypassing Protocol Restrictions
      // Packaged apps run on file:// which is untrusted by default.
      // Disabling webSecurity allows the app to call AI APIs (Gemini/OpenAI) without CORS blocks.
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    },
    title: "Factium AI",
    autoHideMenuBar: true
  });

  // Open DevTools for debugging packaged apps
  mainWindow.webContents.openDevTools();

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // Ensure all internal links are relative and handle file:// protocol correctly
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Prevent "Ghost Server" errors by ensuring we don't try to connect to localhost:3000 in production
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (!isDev && validatedURL.includes('localhost:3000')) {
      console.warn('Redirecting ghost server request to local file...');
      mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
