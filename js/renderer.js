/**
 * Rendering loop management module
 */

import { CANVAS_CONFIG } from "./constants.js";
import {
  createCanvas,
  drawVideoToCanvas,
  getImageData,
} from "./utils/canvasUtils.js";
import { convertToASCII } from "./utils/asciiConverter.js";

/**
 * Creates a renderer instance for ASCII art generation
 */
export class ASCIIRenderer {
  constructor(
    videoElement,
    asciiElement,
    getAsciiRamp,
    width = CANVAS_CONFIG.WIDTH,
    height = CANVAS_CONFIG.HEIGHT
  ) {
    this.video = videoElement;
    this.asciiElement = asciiElement;
    this.getAsciiRamp = getAsciiRamp;
    this.isRendering = false;
    this.animationFrameId = null;
    this.flipped = false;
    this.width = width;
    this.height = height;

    // Create canvas for processing
    const { canvas, ctx } = createCanvas(width, height);
    this.canvas = canvas;
    this.ctx = ctx;
  }

  /**
   * Updates the canvas size for rendering
   * @param {number} width - New canvas width
   * @param {number} height - New canvas height
   */
  updateCanvasSize(width, height) {
    this.width = width;
    this.height = height;
    const { canvas, ctx } = createCanvas(width, height);
    this.canvas = canvas;
    this.ctx = ctx;
  }

  /**
   * Sets the flip state for the camera view
   * @param {boolean} flipped - Whether to flip the view
   */
  setFlipped(flipped) {
    this.flipped = flipped;
  }

  /**
   * Starts the rendering loop
   */
  start() {
    if (this.isRendering) {
      return;
    }

    this.isRendering = true;
    this.render();
  }

  /**
   * Stops the rendering loop
   */
  stop() {
    this.isRendering = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main rendering function
   */
  render() {
    if (!this.isRendering) {
      return;
    }

    if (this.video.paused || this.video.ended) {
      this.animationFrameId = requestAnimationFrame(() => this.render());
      return;
    }

    const asciiRamp = this.getAsciiRamp();
    if (!asciiRamp || asciiRamp.length === 0) {
      this.animationFrameId = requestAnimationFrame(() => this.render());
      return;
    }

    // Draw video frame to canvas
    drawVideoToCanvas(
      this.ctx,
      this.video,
      this.width,
      this.height,
      this.flipped
    );

    // Get image data and convert to ASCII
    const imageData = getImageData(this.ctx, this.width, this.height);
    const asciiStr = convertToASCII(
      imageData,
      this.width,
      this.height,
      asciiRamp
    );

    // Update ASCII display
    this.asciiElement.textContent = asciiStr;

    // Continue rendering loop
    this.animationFrameId = requestAnimationFrame(() => this.render());
  }
}
