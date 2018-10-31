'use strict'

const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');

/*
 * TODO:
 * [x] Handle popup
 * [x] Handle back button
 * [x] Make popup window always stay on top
 * [ ] Auto start video when opened
 * [ ] Pause the video in main window when opened in popup
 * [ ] Continue playing video from the time it was on when button was clicked
 * [ ] Open new popup window if old one was closed
 */

const YoutubeVideoRegex = /^(?:https?\:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.?be)\/watch\?v=([0-9A-za-z_\-]{11})$/

const YoutubeEmbedUrlPrefix = 'https://www.youtube.com/embed/';

const InitialWidth = 1024;
const InitialHeight = 768;
const TopBarHeight = 34;
const ModalInitialWidth = 400;
const ModalInitialHeight = 300;

/**
 * @type {BrowserWindow}
 */
let win;

/**
 * @type {BrowserWindow}
 */
let youtubeModal;

/**
 * Create main application window.
 */
function createMainWindow() {
    win = new BrowserWindow({
        width: InitialWidth,
        height: InitialHeight,
        webPreferences: {
            devTools: false,
        },
    });

    win.setMenu(null);

    //win.webContents.openDevTools({ mode: 'detach' });

    win.loadFile("index.html");
}

/**
 * Create BrowserView for youtube site.
 * BrowserView is used to prevent external sites from accessing Node API.
 * @returns {BrowserView}
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
 * @param {number} width 
 * @param {number} height
 */
function createYoutubeModal(width, height) {
    youtubeModal = new BrowserWindow({
        width,
        height,
        alwaysOnTop: true,
    });

    youtubeModal.setMenu(null);

    youtubeModal.on('close', () => {
        youtubeModal = null;
    });

    youtubeModal.show();
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
 * Configure event handlers for main window events.
 * @param {BrowserView} youtubeBrowserView 
 */
function configureMainWindowEventHandlers(youtubeBrowserView) {
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

/**
 * Configure handlers for IPC messages from toolbar.
 * @param {BrowserView} youtubeBrowserView A BrowserView with youtube
 */
function configureToolbarIpcHandlers(youtubeBrowserView) {
    ipcMain.on('popup', () => {
        const videoUrl = youtubeBrowserView.webContents.getURL();
        const match = YoutubeVideoRegex.exec(videoUrl);

        console.log(videoUrl);
        console.log(match);

        if (match !== null) {
            const videoCode = match[1];
            openVideoInPopup(videoCode);
        }
    });

    ipcMain.on('nav-back', () => {
        youtubeBrowserView.webContents.goBack();
    });
}

/**
 * Open video in popup window. If window is closed, open a new one.
 * @param {string} videoCode
 */
function openVideoInPopup(videoCode) {
    if (isNullOrUndefined(youtubeModal)) {
        createYoutubeModal(ModalInitialWidth, ModalInitialHeight);
    }

    if (youtubeModal.isVisible()) {
        youtubeModal.focus();
    }

    youtubeModal.webContents.loadURL(`${YoutubeEmbedUrlPrefix}${videoCode}`);
}

/**
 * Check if value is null or undefined.
 * @param {*} value 
 */
function isNullOrUndefined(value) {
    return value === null
        || value === undefined;
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
    
    configureMainWindowEventHandlers(youtubeBrowserView);
    configureToolbarIpcHandlers(youtubeBrowserView);
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