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

let win;

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
 * @returns {BrowserWindow}
 */
function createYoutubeModal(width, height) {
    let youtubeModal = new BrowserWindow({
        width,
        height,
        alwaysOnTop: true,
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
 * Configure event handlers for main window events.
 * @param {BrowserView} youtubeBrowserView 
 * @param {BrowserWindow} youtubeModal
 */
function configureMainWindowEventHandlers(youtubeBrowserView, youtubeModal) {
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
 * @param {BrowserWindow} youtubeModal A BrowserWindow popup for youtube videos 
 */
function configureToolbarIpcHandlers(youtubeBrowserView, youtubeModal) {
    ipcMain.on('popup', () => {
        const videoUrl = youtubeBrowserView.webContents.getURL();
        const match = YoutubeVideoRegex.exec(videoUrl);

        console.log(videoUrl);
        console.log(match);

        if (match !== null) {
            const videoCode = match[1];
            youtubeModal.webContents.loadURL(`${YoutubeEmbedUrlPrefix}${videoCode}`);
        }
    });

    ipcMain.on('nav-back', () => {
        youtubeBrowserView.webContents.goBack();
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

    let youtubeModal = createYoutubeModal(ModalInitialWidth, ModalInitialHeight);
    youtubeModal.show();

    configureMainWindowEventHandlers(youtubeBrowserView, youtubeModal);
    configureToolbarIpcHandlers(youtubeBrowserView, youtubeModal);
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