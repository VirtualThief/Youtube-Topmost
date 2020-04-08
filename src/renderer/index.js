import { ipcRenderer } from "electron";

// Import CSS styles
import "../../static/photon/css/photon.min.css";
import "../../static/style.css";

// Import HTML markup
import * as body from "../../static/body.html";

// Configure main page rendering
document.title = "Youtube";
document.body.innerHTML = body;

// Set up communication between renderer and main threads
document.addEventListener("DOMContentLoaded", () => {
  const popupButton = document.querySelector(".button-popup");
  popupButton.addEventListener("click", () => {
    ipcRenderer.send("popup");
  });

  const navBackButton = document.querySelector(".button-nav-back");
  navBackButton.addEventListener("click", () => {
    ipcRenderer.send("nav-back");
  });
});
