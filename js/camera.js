/**
 * Camera access and management module
 */

import { ERROR_MESSAGES } from "./constants.js";

/**
 * Initializes camera access and sets up video stream
 * @param {HTMLVideoElement} videoElement - Video element to display stream
 * @param {Function} onSuccess - Callback when camera access succeeds
 * @param {Function} onError - Callback when camera access fails
 */
export function initializeCamera(videoElement, onSuccess, onError) {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      videoElement.srcObject = stream;
      if (onSuccess) {
        onSuccess();
      }
    })
    .catch((error) => {
      console.error(ERROR_MESSAGES.CAMERA_GENERIC, error);
      if (onError) {
        onError(error);
      }
    });
}

/**
 * Stops the camera stream
 * @param {HTMLVideoElement} videoElement - Video element with active stream
 */
export function stopCamera(videoElement) {
  if (videoElement.srcObject) {
    const tracks = videoElement.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
    videoElement.srcObject = null;
  }
}

/**
 * Checks if camera is available
 * @returns {boolean} True if camera is available
 */
export function isCameraAvailable() {
  return (
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia !== undefined
  );
}
