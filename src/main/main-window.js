import path from "path";
import { format as formatUrl } from "url";
import { readFile } from "fs";
import { BrowserWindow, BrowserView, ipcMain } from "electron";
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

  _handlers = {};

  constructor() {
    this.win = this._createMainWindow();
    this._createYoutubeBrowserView();
    this._configureWindowResize();
    this._configureToolbarIpcHandlers();

    this.youtubeBrowserView.webContents.loadURL("https://youtube.com/");
  }

  on(event, handler) {
    if (!this._handlers[event]) {
      this._handlers[event] = [];
    }

    this._handlers[event].push(handler);

    // Return unsubscribe callback.
    return () => {
      this._handlers[event] = this._handlers[event].filter(
        (h) => h !== handler
      );
    };
  }

  /**
   * Create main application window.
   */
  _createMainWindow() {
    const win = new BrowserWindow({
      width: Constants.InitialWidth,
      height: Constants.InitialHeight,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    win.setMenu(null);

    // Render main view
    if (isDev) {
      win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
    } else {
      win.loadURL(
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
      win.webContents.openDevTools({ mode: "undocked" });
    }

    return win;
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

  /**
   * Configure event handlers for main window events.
   */
  _configureWindowResize() {
    this._adjustBrowserViewSize(
      Constants.InitialWidth,
      Constants.InitialHeight
    );

    // Resize BrowserView with youtube when main window is resized to fill it.
    this.win.on("resize", () => {
      const [width, height] = this.win.getSize();
      this._adjustBrowserViewSize(width, height);
    });
  }

  /**
   * Configure handlers for IPC messages from toolbar.
   */
  _configureToolbarIpcHandlers() {
    ipcMain.on("popup", () => {
      const videoUrl = this.youtubeBrowserView.webContents.getURL();
      const match = Constants.YoutubeVideoRegex.exec(videoUrl);

      if (match !== null) {
        const videoCode = match[1];
        this._pauseCurrentVideo();

        if (this._handlers["popup"]) {
          this._handlers["popup"].forEach((handler) => {
            handler(videoCode);
          });
        }
      }
    });

    ipcMain.on("nav-back", () => {
      this.youtubeBrowserView.webContents.goBack();
    });
  }

  _pauseCurrentVideo() {
    readFile(
      `${__dirname}/inject/pauseYoutubeVideo.js`,
      { encoding: "utf-8" },
      async (err1, data) => {
        if (err1) {
          console.error(err1);
          return;
        }

        try {
          await this.youtubeBrowserView.webContents.executeJavaScript(data);
        } catch (err2) {
          console.error(err2);
        }
      }
    );
  }
}

export default MainWindow;
