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
    this._createMainWindow();
    this._createYoutubeBrowserView();
    this._configureMainWindowEventHandlers();
    this._configureToolbarIpcHandlers();

    this.youtubeBrowserView.webContents.loadURL("https://youtube.com/");
  }

  on(event, handler) {
    if (!this._handlers[event]) {
      this._handlers[event] = [];
    }

    this._handlers[event].push(handler);

    // TODO Return unsubscribe.
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

  /**
   * Configure event handlers for main window events.
   */
  _configureMainWindowEventHandlers() {
    // When main window is closed, also close popup window.
    // TODO Move subscription to popup class.
    // win.on('close', () => {
    //   youtubePopup.close();
    // });

    this.win.on("close", () => {
      if (this._handlers["close"]) {
        this._handlers["close"].forEach((handler) => {
          handler();
        });
      }
    });

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

      console.log(match);

      if (match !== null) {
        const videoCode = match[1];
        this._pauseCurrentVideo();
        // TODO Move to popup class
        // youtubePopup.openVideo(videoCode);
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
