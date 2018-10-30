'use strict'

const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function (event) {
    const popupButton = document.querySelector('.button-popup');
    popupButton.addEventListener('click', () => {
        ipcRenderer.send('popup');
    });

    const navBackButton = document.querySelector('.button-nav-back');
    navBackButton.addEventListener('click', () => {
        ipcRenderer.send('nav-back');
    });
});
