'use strict'

const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const fs = require('fs');

/*
 * TODO:
 * [x] Handle popup
 * [x] Handle back button
 * [x] Make popup window always stay on top
 * [x] Pause the video in main window when opened in popup
 * [x] Open new popup window if old one was closed
 * [ ] Auto start video when opened
 * [ ] Continue playing video from the time it was on when button was clicked
 * [ ] Configure build
 * [ ] Playlist of videos
 */

const YoutubeVideoRegex = /^(?:https?\:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.?be)\/watch\?v=([0-9A-za-z_\-]{11})$/

const YoutubeEmbedUrlPrefix = 'https://www.youtube.com/embed/';

const InitialWidth = 1024;
const InitialHeight = 768;
const TopBarHeight = 34;

/**
 * @type {BrowserWindow}
 */
let win;

/**
 * @type {BrowserWindow}
 */
let youtubeModal;

/**
 * @type {BrowserView}
 */
let youtubeBrowserView;

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
 */
function createYoutubeBrowserView() {
    youtubeBrowserView = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
        },
    });

    win.setBrowserView(youtubeBrowserView);
    adjustBrowserViewSize(InitialWidth, InitialHeight);
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
function adjustBrowserViewSize(windowWidth, windowHeight) {
    youtubeBrowserView.setBounds({
        x: 0,
        y: TopBarHeight,
        width: windowWidth,
        height: windowHeight - TopBarHeight,
    });
}

/**
 * Configure event handlers for main window events. 
 */
function configureMainWindowEventHandlers() {
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
 */
function configureToolbarIpcHandlers() {
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
    pauseCurrentVideoInMainWindow();

    if (isNullOrUndefined(youtubeModal)) {
        createYoutubeModal(ModalInitialWidth, ModalInitialHeight);
    }

    if (youtubeModal.isVisible()) {
        youtubeModal.focus();
    }

    youtubeModal.webContents.loadURL(`${YoutubeEmbedUrlPrefix}${videoCode}`);
}


function pauseCurrentVideoInMainWindow() {
    fs.readFile(`${__dirname}/inject/pauseYoutubeVideo.js`, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        youtubeBrowserView.webContents.executeJavaScript(data)
            .catch(err => {
                console.error(err);
            });
    });
}

/**
 * Create and configure all required windows.
 */
function initializeApplication() {
    createMainWindow();

    createYoutubeBrowserView();

    youtubeBrowserView.webContents.loadURL("https://youtube.com/");

    configureMainWindowEventHandlers();
    configureToolbarIpcHandlers();
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