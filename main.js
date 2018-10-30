'use strict'

const { app, BrowserWindow, BrowserView } = require('electron');

/*
 * TODO:
 * [ ] Handle popup
 * [ ] Handle back button
 * [ ] Open new popup window if old one was closed
 */

const InitialWidth = 1024;
const InitialHeight = 768;
const TopBarHeight = 34;
const ModalInitialWidth = 400;
const ModalInitialHeight = 300;

let win;

/**
 * Create main application window.
 */
function createMainWindow() {
    win = new BrowserWindow({
        width: InitialWidth,
        height: InitialHeight,
    });

    win.setMenu(null);

    win.webContents.openDevTools({mode: 'detach'});

    win.loadFile("index.html");
}

/**
 * Create BrowserView for youtube site.
 * BrowserView is used to prevent external sites from accessing Node API.
 */
function createYoutubeBrowserView() {
    const browserView = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
        },
    });

    return browserView;
}

/**
 * Create modal window for Youtube videos.
 * @param {BrowserWindow} parent 
 * @param {number} width 
 * @param {number} height 
 */
function createYoutubeModal(parent, width, height) {
    let youtubeModal = new BrowserWindow({
        parent,
        width,
        height,
    });

    youtubeModal.setMenu(null);

    return youtubeModal;
}

/**
 * Resize BrowserView to fill window with specified size.
 * @param {BrowserView} browserView 
 * @param {number} windowWidth 
 * @param {number} windowHeight 
 */
function adjustBrowserViewSize(browserView, windowWidth, windowHeight) {
    browserView.setBounds({
        x: 0,
        y: TopBarHeight,
        width: windowWidth,
        height: windowHeight - TopBarHeight,
    });
}

/**
 * Create and configure all required windows.
 */
function initializeApplication() {
    createMainWindow();

    let youtubeBrowserView = createYoutubeBrowserView();    
    win.setBrowserView(youtubeBrowserView);
    adjustBrowserViewSize(youtubeBrowserView, InitialWidth, InitialHeight);
    youtubeBrowserView.webContents.loadURL("https://youtube.com/");

    let youtubeModal = createYoutubeModal(win, ModalInitialWidth, ModalInitialHeight);
    youtubeModal.show();

    // When main window is closed, also close modal window.
    win.on('close', () => {
        if (youtubeModal && !youtubeModal.isDestroyed()) {
            youtubeModal.close();            
        }

        win = null;
    });
    
    // Resize BrowserView with youtube when main window is resized to fill it.
    win.on('resize', () => {
        let size = win.getSize();
        adjustBrowserViewSize(youtubeBrowserView, size[0], size[1]);
    });    
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initializeApplication)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        initializeApplication()
    }
})