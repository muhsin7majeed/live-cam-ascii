import { DEFAULT_ASCII_RAMP, ERROR_MESSAGES } from "./constants.js";
import { initializeCamera } from "./camera.js";
import { ASCIIRenderer } from "./renderer.js";

// DOM elements
const video = document.getElementById("video");
const ascii = document.getElementById("ascii");
const asciiCharsInput = document.getElementById("asciiChars");

// State
let asciiRamp = DEFAULT_ASCII_RAMP;
let renderer = null;

/**
 * Gets the current ASCII character ramp
 * @returns {string} Current ASCII ramp
 */
function getAsciiRamp() {
  return asciiCharsInput.value || asciiRamp;
}

/**
 * Handles camera initialization success
 */
function onCameraSuccess() {
  // Create renderer instance
  renderer = new ASCIIRenderer(video, ascii, getAsciiRamp);

  // Start rendering when video starts playing
  video.addEventListener("play", () => {
    renderer.start();
  });

  // Stop rendering when video pauses or ends
  video.addEventListener("pause", () => {
    renderer.stop();
  });

  video.addEventListener("ended", () => {
    renderer.stop();
  });
}

/**
 * Handles camera initialization errors
 * @param {Error} error - Error object
 */
function onCameraError(error) {
  ascii.textContent = ERROR_MESSAGES.CAMERA_ACCESS;
  console.error(ERROR_MESSAGES.CAMERA_GENERIC, error);
}

/**
 * Updates ASCII ramp when input changes
 */
asciiCharsInput.addEventListener("input", (e) => {
  asciiRamp = e.target.value || DEFAULT_ASCII_RAMP;
});

// Initialize camera access
initializeCamera(video, onCameraSuccess, onCameraError);
