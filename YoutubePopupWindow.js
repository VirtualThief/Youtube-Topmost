'use strict'

const { BrowserWindow } = require('electron');
const { isNullOrUndefined } = require('./utilities');

const ModalInitialWidth = 400;
const ModalInitialHeight = 300;

class YoutubePopupManager {
    /**
     * Youtube popup window object
     * @type {BrowserWindow}
     */
    _youtubePopupWindow_internal = null;

    /**
     * Creates new popup window.
     */
    _createPopupWindow_internal() {
        if (!isNullOrUndefined(this._youtubePopupWindow_internal)) {
            throw new Error("Popup is already created");
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