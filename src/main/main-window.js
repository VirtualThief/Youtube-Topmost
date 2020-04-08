import path from "path";
import { format as formatUrl } from "url";
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
  youtubeBrowserView;

  constructor() {
    this._createMainWindow();
    this._createYoutubeBrowserView();

    this.youtubeBrowserView.webContents.loadURL("https://youtube.com/");
  }

  /**
   * Create main application window.
   */
  _createMainWindow() {
    this.win = new BrowserWindow({
      width: Constants.InitialWidth,
      height: Constants.InitialHeight,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    this.win.setMenu(null);

    // Render main view
    if (isDev) {
      this.win.loadURL(
        `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
      );
    } else {
      this.win.loadURL(
        formatUrl({
          pathname: path.join(__dirname, "index.html"),
          protocol: "file",
          slashes: true,
        })
      );
    }

    // Show developer tools
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
        webSecurity: false,
      },
    });

    this.win.setBrowserView(this.youtubeBrowserView);
    this._adjustBrowserViewSize(
      Constants.InitialWidth,
      Constants.InitialHeight
    );
  }

  /**
   * Resize BrowserView to fill window with specified size.
   * @param {BrowserView} browserView
   * @param {number} windowWidth
   * @param {number} windowHeight
   */
  _adjustBrowserViewSize(windowWidth, windowHeight) {
    this.youtubeBrowserView.setBounds({
      x: 0,
      y: Constants.TopBarHeight,
      width: windowWidth,
      height: windowHeight - Constants.TopBarHeight,
    });
  }
}

export default MainWindow;
