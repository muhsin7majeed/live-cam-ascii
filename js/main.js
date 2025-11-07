import { DEFAULT_ASCII_RAMP, ERROR_MESSAGES } from "./constants.js";
import { initializeCamera } from "./camera.js";
import { ASCIIRenderer } from "./renderer.js";

// DOM elements
const video = document.getElementById("video");
const ascii = document.getElementById("ascii");
const asciiCharsInput = document.getElementById("asciiChars");
const cameraPermissionPrompt = document.getElementById(
  "cameraPermissionPrompt"
);
const controls = document.getElementById("controls");
const outputContainer = document.getElementById("outputContainer");

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
  // Hide permission prompt and show main content
  cameraPermissionPrompt.classList.remove("show");
  cameraPermissionPrompt.classList.add("hide");
  controls.classList.remove("hide");
  outputContainer.classList.remove("hide");

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
  // Show permission prompt and hide main content
  cameraPermissionPrompt.classList.remove("hide");
  cameraPermissionPrompt.classList.add("show");
  controls.classList.add("hide");
  outputContainer.classList.add("hide");

  console.error(ERROR_MESSAGES.CAMERA_GENERIC, error);
}

/**
 * Updates ASCII ramp when input changes
 */
asciiCharsInput.addEventListener("input", (e) => {
  asciiRamp = e.target.value || DEFAULT_ASCII_RAMP;
});

// Initially hide main content and show permission prompt
controls.classList.add("hide");
outputContainer.classList.add("hide");
cameraPermissionPrompt.classList.add("show");

// Initialize camera access
initializeCamera(video, onCameraSuccess, onCameraError);
