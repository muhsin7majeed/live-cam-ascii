/**
 * Canvas utility functions
 */

/**
 * Creates and configures a canvas element
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {Object} Object containing canvas element and 2D context
 */
export function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  return { canvas, ctx };
}

/**
 * Draws video frame to canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {HTMLVideoElement} video - Video element to draw
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @param {boolean} flipped - Whether to flip the image horizontally
 */
export function drawVideoToCanvas(ctx, video, width, height, flipped = false) {
  if (flipped) {
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();
  } else {
    ctx.drawImage(video, 0, 0, width, height);
  }
}

/**
 * Gets image data from canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {ImageData} Image data from canvas
 */
export function getImageData(ctx, width, height) {
  return ctx.getImageData(0, 0, width, height);
}
