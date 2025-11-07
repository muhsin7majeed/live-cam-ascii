import { DEFAULT_ASCII_RAMP, ERROR_MESSAGES } from "./constants.js";
import { initializeCamera } from "./camera.js";
import { ASCIIRenderer } from "./renderer.js";
import { saveAsciiToFile, saveAsciiToImage } from "./utils/fileUtils.js";

// DOM elements
const video = document.getElementById("video");
const ascii = document.getElementById("ascii");
const asciiCharsInput = document.getElementById("asciiChars");
const flipCameraCheckbox = document.getElementById("flipCamera");
const detailSlider = document.getElementById("detailSlider");
const cameraPermissionPrompt = document.getElementById(
  "cameraPermissionPrompt"
);
const controls = document.getElementById("controls");
const outputContainer = document.getElementById("outputContainer");
const settingsButton = document.getElementById("settingsButton");
const captureTextButton = document.getElementById("captureTextButton");
const captureImageButton = document.getElementById("captureImageButton");

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
  // Controls remain hidden by default - user can toggle with settings button
  outputContainer.classList.remove("hide");

  // Get initial detail level and set up renderer
  const initialLevel = parseInt(detailSlider.value);
  const { width, height } = getCanvasSizeForDetailLevel(initialLevel);
  updateFontSizeForDetailLevel(initialLevel);

  // Create renderer instance with initial canvas size
  renderer = new ASCIIRenderer(video, ascii, getAsciiRamp, width, height);

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

/**
 * Handles camera flip toggle
 */
flipCameraCheckbox.addEventListener("change", (e) => {
  const isFlipped = e.target.checked;
  if (isFlipped) {
    video.classList.add("flipped");
  } else {
    video.classList.remove("flipped");
  }
  if (renderer) {
    renderer.setFlipped(isFlipped);
  }
});

/**
 * Maps detail level (1-5) to canvas dimensions
 * @param {number} level - Detail level from 1 to 5
 * @returns {Object} Object with width and height
 */
function getCanvasSizeForDetailLevel(level) {
  const baseWidth = 80;
  const baseHeight = 60;
  // Level 1: 80x60, Level 2: 160x120, Level 3: 240x180, Level 4: 320x240, Level 5: 400x300
  return {
    width: baseWidth * level,
    height: baseHeight * level,
  };
}

/**
 * Updates font size based on detail level to keep box size consistent
 * @param {number} level - Detail level from 1 to 5
 */
function updateFontSizeForDetailLevel(level) {
  // Base font size was 0.5rem for 80x60, now 0.25rem for 160x120
  // For level N, font size should be 0.5rem / N
  const baseFontSize = 0.5; // rem
  const fontSize = baseFontSize / level;
  ascii.style.fontSize = `${fontSize}rem`;
}

/**
 * Handles detail level slider changes
 */
detailSlider.addEventListener("input", (e) => {
  const level = parseInt(e.target.value);
  const { width, height } = getCanvasSizeForDetailLevel(level);

  if (renderer) {
    renderer.updateCanvasSize(width, height);
  }

  updateFontSizeForDetailLevel(level);
});

/**
 * Toggles the visibility of the controls section
 */
settingsButton.addEventListener("click", () => {
  controls.classList.toggle("hide");
});

/**
 * Generates a timestamped filename
 * @param {string} extension - File extension (e.g., 'txt', 'png')
 * @returns {string} Timestamped filename
 */
function generateFilename(extension) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  return `ascii-art-${timestamp}.${extension}`;
}

/**
 * Handles ASCII text capture
 */
captureTextButton.addEventListener("click", () => {
  const asciiText = ascii.textContent;
  if (!asciiText || asciiText.trim().length === 0) {
    console.warn("No ASCII art to capture");
    return;
  }

  const filename = generateFilename("txt");
  saveAsciiToFile(asciiText, filename);
});

/**
 * Handles ASCII image capture
 */
captureImageButton.addEventListener("click", () => {
  const asciiText = ascii.textContent;
  if (!asciiText || asciiText.trim().length === 0) {
    console.warn("No ASCII art to capture");
    return;
  }

  // Get computed styles from the pre element to match appearance
  const computedStyle = window.getComputedStyle(ascii);
  const fontSize = parseFloat(computedStyle.fontSize);
  const fontFamily = computedStyle.fontFamily;
  const backgroundColor = computedStyle.backgroundColor || "#3b0270";
  const color = computedStyle.color || "#fff1f1";

  const filename = generateFilename("png");
  saveAsciiToImage(asciiText, filename, {
    fontSize: fontSize * 2, // Scale up for better image quality
    fontFamily: fontFamily,
    backgroundColor: backgroundColor,
    textColor: color,
    padding: 20,
  });
});

// Initially hide main content and show permission prompt
controls.classList.add("hide");
outputContainer.classList.add("hide");
cameraPermissionPrompt.classList.add("show");

// Initialize camera access
initializeCamera(video, onCameraSuccess, onCameraError);
