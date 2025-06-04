const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  // Configuración optimizada para macOS
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false // Para desarrollo local
    },
    titleBarStyle: 'hiddenInset', // Estilo nativo macOS
    vibrancy: 'ultra-dark', // Efecto glassmorphism
    transparent: true,
    frame: true,
    show: false // No mostrar hasta que esté listo
  });

  // Cargar la aplicación
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // Mostrar cuando esté listo
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Enfocar la ventana (importante para el asistente)
    if (isDev) {
      mainWindow.focus();
    }
  });

  // Eventos del asistente
  setupAssistantEvents();
}

function setupAssistantEvents() {
  // IPC para comunicación con React
  ipcMain.handle('show-notification', async (event, { title, body }) => {
    new Notification({ title, body }).show();
    return 'Notification sent';
  });

  ipcMain.handle('voice-command-processed', async (event, command) => {
    console.log('Comando de voz procesado:', command);
    return 'Command received';
  });

  // Atajos de teclado globales para el asistente
  const { globalShortcut } = require('electron');
  
  app.whenReady().then(() => {
    // Cmd+Shift+M para activar MindFlow rápidamente
    globalShortcut.register('CommandOrControl+Shift+M', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
  });
}

// Eventos de la aplicación
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  const { globalShortcut } = require('electron');
  globalShortcut.unregisterAll();
});