import { app, BrowserWindow, BrowserView, ipcMain } from "electron";
import * as electron from "electron";

import * as Constants from "./constants";
import MainWindow from "./main-window";

class YoutubeTopmostApp {
  /**
   * @type {MainWindow}
   */
  mainWindow;

  initialize() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on("ready", this._initializeApplication);

    // Quit when all windows are closed.
    app.on("window-all-closed", () => {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    app.on("activate", () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this.mainWindow.win === null) {
        this._initializeApplication();
      }
    });
  }

  /**
   * Create and configure all required windows.
   */
  _initializeApplication() {
    this.mainWindow = new MainWindow();

    // createYoutubeBrowserView();

    // youtubeBrowserView.webContents.loadURL('https://youtube.com/');

    // configureMainWindowEventHandlers();
    // configureToolbarIpcHandlers();
    // electron.session.defaultSession.webRequest.onHeadersReceived(
    //   (details, callback) => {
    //     callback({
    //       responseHeaders: {
    //         ...details.responseHeaders,
    //         "Content-Security-Policy": ["default-src 'self'"],
    //       },
    //     });
    //   }
    // );
  }
}

export default YoutubeTopmostApp;
