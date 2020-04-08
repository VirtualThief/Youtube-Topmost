import YoutubeTopmostApp from "./application";
// import YoutubePopupManager from './YoutubePopupManager';

// import { app, BrowserWindow, BrowserView, ipcMain } from 'electron';
// import { readFile } from 'fs';

/*
 * TODO:
 * [x] Handle popup
 * [x] Handle back button
 * [x] Make popup window always stay on top
 * [x] Pause the video in main window when opened in popup
 * [x] Open new popup window if old one was closed
 * [x] Fix window resize
 * [x] Configure builds to drop to subfolder
 * [ ] Auto start video when opened
 * [ ] Continue playing video from the time it was on when button was clicked
 * [ ] Configure build
 * [ ] Playlist of videos
 * [ ] Add quick open field
 */

// /**
//  * @type {YoutubePopupManager}
//  */
// const youtubePopup = new YoutubePopupManager();

// /**
//  * @type {BrowserView}
//  */
// let youtubeBrowserView;

//   win.setBrowserView(youtubeBrowserView);
//   adjustBrowserViewSize(InitialWidth, InitialHeight);
// }

// /**
//  * Resize BrowserView to fill window with specified size.
//  * @param {BrowserView} browserView
//  * @param {number} windowWidth
//  * @param {number} windowHeight
//  */
// function adjustBrowserViewSize(windowWidth, windowHeight) {
//   youtubeBrowserView.setBounds({
//     x: 0,
//     y: TopBarHeight,
//     width: windowWidth,
//     height: windowHeight - TopBarHeight,
//   });
// }

// /**
//  * Configure event handlers for main window events.
//  */
// function configureMainWindowEventHandlers() {
//   // When main window is closed, also close popup window.
//   win.on('close', () => {
//     youtubePopup.close();
//   });

//   // Resize BrowserView with youtube when main window is resized to fill it.
//   win.on('resize', () => {
//     const size = win.getSize();
//     adjustBrowserViewSize(size[0], size[1]);
//   });
// }

// /**
//  * Configure handlers for IPC messages from toolbar.
//  */
// function configureToolbarIpcHandlers() {
//   ipcMain.on('popup', () => {
//     const videoUrl = youtubeBrowserView.webContents.getURL();
//     const match = YoutubeVideoRegex.exec(videoUrl);

//     console.log(videoUrl);
//     console.log(match);

//     if (match !== null) {
//       const videoCode = match[1];
//       pauseCurrentVideoInMainWindow();
//       youtubePopup.openVideo(videoCode);
//     }
//   });

//   ipcMain.on('nav-back', () => {
//     youtubeBrowserView.webContents.goBack();
//   });
// }

// function pauseCurrentVideoInMainWindow() {
//   readFile(`${__dirname}/inject/pauseYoutubeVideo.js`, { encoding: 'utf-8' }, (err1, data) => {
//     if (err1) {
//       console.error(err1);
//       return;
//     }

//     youtubeBrowserView.webContents.executeJavaScript(data)
//       .catch((err2) => {
//         console.error(err2);
//       });
//   });
// }

const youtubeApp = new YoutubeTopmostApp();
youtubeApp.initialize();
