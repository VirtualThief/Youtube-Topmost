'use strict'

document.addEventListener('DOMContentLoaded', function (event) {
    const popupButton = document.querySelector('.button-popup');
    popupButton.addEventListener('click', () => {
        alert("test");
    });

    const navBackButton = document.querySelector('.button-nav-back');
    navBackButton.addEventListener('click', () => {
        alert('back');
    });
});
