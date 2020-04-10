import { app } from "electron";

import MainWindow from "./main-window";
import YoutubePopup from "./youtube-popup";

class YoutubeTopmostApp {
  /**
   * @type {MainWindow}
   */
  mainWindow;

  /**
   * @type {YoutubePopup}
   */
  youtubePopup;

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
    this.youtubePopup = new YoutubePopup();

    this.mainWindow.on("popup", (videoCode) => {
      this.youtubePopup.openVideo(videoCode);
    });

    this.mainWindow.win.on("close", () => {
      this.youtubePopup.close();
    });
  }
}

export default YoutubeTopmostApp;
