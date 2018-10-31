const { BrowserWindow } = require('electron');
const { isNullOrUndefined } = require('../common/utilities');

const YoutubeEmbedUrlPrefix = 'https://www.youtube.com/embed/';
const ModalInitialWidth = 400;
const ModalInitialHeight = 300;

/**
 * Manages the popup window.
 * @field {BrowserWindow} _youtubePopupWindow_internal
 */
class YoutubePopupManager {
  /**
   * Open video with provided ID.
   * @param {string} videoCode The ID of the video.
   */
  openVideo(videoCode) {
    if (isNullOrUndefined(this._youtubePopupWindow_internal)) {
      this._createPopupWindowInternal();
    }

    this._youtubePopupWindow_internal.focus();

    this._youtubePopupWindow_internal.webContents.loadURL(`${YoutubeEmbedUrlPrefix}${videoCode}`);
  }

  /**
   * Close popup.
   */
  close() {
    if (!isNullOrUndefined(this._youtubePopupWindow_internal)
      && !this._youtubePopupWindow_internal.isDestroyed()) {
      // Need to save this to separate variable because field is nullified when window is closed.
      const window = this._youtubePopupWindow_internal;
      window.close();
      window.destroy();
    }
  }

  /**
   * Creates new popup window.
   */
  _createPopupWindowInternal() {
    if (!isNullOrUndefined(this._youtubePopupWindow_internal)) {
      throw new Error('Popup is already created');
    }

    this._youtubePopupWindow_internal = new BrowserWindow({
      width: ModalInitialWidth,
      height: ModalInitialHeight,
      alwaysOnTop: true,
    });

    this._youtubePopupWindow_internal.setMenu(null);

    this._youtubePopupWindow_internal.on('close', () => {
      this._youtubePopupWindow_internal = null;
    });

    this._youtubePopupWindow_internal.show();
  }
}

module.exports = YoutubePopupManager;
