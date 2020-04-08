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

const youtubeApp = new YoutubeTopmostApp();
youtubeApp.initialize();
