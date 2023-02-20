const { app, BrowserWindow } = require('electron');
const url = require('url');
const path = require('path');

let appWindow;
let chatWindow;
const ipc = require('electron').ipcMain;

function initWindow() {
    appWindow = new BrowserWindow({
        // fullscreen: true,
        height: 1080,
        width: 1920,
        minHeight: 1080,
        minWidth: 1920,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    // Electron Build Path
    appWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, '/dist/client/index.html'),
            protocol: 'file:',
            slashes: true,
        }),
    );

    appWindow.setMenuBarVisibility(false)

    // Initialize the DevTools.
    // appWindow.webContents.openDevTools();

    appWindow.on('closed', function () {
        appWindow = null;
    });
}

function openModal() {
    var urlToLoad = url.format({
        pathname: path.join(__dirname, '/dist/client/index.html'),
        protocol: 'file:',
        slashes: true,
    });
    chatWindow = new BrowserWindow({
        width: 500,
        height: 800,
        minHeight: 600,
        minWidth: 350,
        parent: appWindow,
        modal: false,
        show: false,

        webPreferences: {
            nodeIntegration: true,
        },
    });
    chatWindow.setMenuBarVisibility(false);
    chatWindow.loadURL(urlToLoad + '#/chat');
    chatWindow.once('ready-to-show', () => {
        chatWindow.show();
    });
}

ipc.on('openModal', function (event, message) {
    openModal();
    chatWindow.webContents.on('did-finish-load', () => {
        chatWindow.webContents.sendToFrame(1, 'forChatWindow', message);
    });
});

app.on('ready', initWindow);

// Close when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (win === null) {
        initWindow();
    }
});
