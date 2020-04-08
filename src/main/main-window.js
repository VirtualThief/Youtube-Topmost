import { BrowserWindow, BrowserView } from "electron";
import isDev from "electron-is-dev";

import * as Constants from "./constants";

class MainWindow {
  /**
   * @type {BrowserWindow}
   */
  win;

  /**
   * @type {BrowserView}
   */
  browserView;

  constructor() {
    this._createMainWindow();
  }

  /**
   * Create main application window.
   */
  _createMainWindow() {
    this.win = new BrowserWindow({
      width: Constants.InitialWidth,
      height: Constants.InitialHeight,
      webPreferences: {
        devTools: false,
      },
    });

    this.win.setMenu(null);

    this.win.loadFile("index.html");

    if (isDev) {
      console.log("Opening dev tools for development build");
      this.win.webContents.openDevTools({ mode: "undocked" });
    }
  }

  /**
   * Create BrowserView for youtube site.
   * BrowserView is used to prevent external sites from accessing Node API.
   */
  _createYoutubeBrowserView() {
    this.youtubeBrowserView = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
      },
    });
  }
}

export default MainWindow;
