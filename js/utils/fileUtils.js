/**
 * File utility functions for saving ASCII art
 */

/**
 * Saves ASCII text to a file and triggers download
 * @param {string} text - The ASCII text to save
 * @param {string} filename - The filename (default: ascii-art.txt)
 */
export function saveAsciiToFile(text, filename = "ascii-art.txt") {
  // Create a Blob with the text content
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });

  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element to trigger download
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Converts ASCII text to an image and saves it
 * @param {string} text - The ASCII text to convert
 * @param {string} filename - The filename (default: ascii-art.png)
 * @param {Object} options - Options for rendering (fontSize, fontFamily, padding, etc.)
 */
export function saveAsciiToImage(
  text,
  filename = "ascii-art.png",
  options = {}
) {
  const {
    fontSize = 12,
    fontFamily = "Courier New, monospace",
    padding = 20,
    backgroundColor = "#3b0270",
    textColor = "#fff1f1",
    lineHeight = 1.2,
  } = options;

  // Split text into lines (preserve empty lines)
  const lines = text.split("\n");
  // Remove trailing empty line if text ends with newline
  if (
    lines.length > 0 &&
    lines[lines.length - 1] === "" &&
    text.endsWith("\n")
  ) {
    lines.pop();
  }
  const lineLengths = lines.map((line) => line.length);
  const maxLineLength = lineLengths.length > 0 ? Math.max(...lineLengths) : 0;

  // Ensure minimum dimensions
  if (lines.length === 0 || maxLineLength === 0) {
    console.warn("No content to render as image");
    return;
  }

  // Create a temporary canvas to measure text
  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");
  measureCtx.font = `${fontSize}px ${fontFamily}`;

  // Calculate dimensions
  const charWidth = measureCtx.measureText("M").width;
  const lineHeightPx = fontSize * lineHeight;
  const canvasWidth = maxLineLength * charWidth + padding * 2;
  const canvasHeight = lines.length * lineHeightPx + padding * 2;

  // Create the actual canvas for rendering
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Set text properties
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "top";

  // Draw each line
  lines.forEach((line, index) => {
    const y = padding + index * lineHeightPx;
    ctx.fillText(line, padding, y);
  });

  // Convert canvas to blob and download
  canvas.toBlob((blob) => {
    if (!blob) {
      console.error("Failed to create image blob");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }, "image/png");
}

/**
 * Video recorder class for recording ASCII art as video
 */
export class ASCIIVideoRecorder {
  constructor(options = {}) {
    const {
      fontSize = 12,
      fontFamily = "Courier New, monospace",
      padding = 20,
      backgroundColor = "#3b0270",
      textColor = "#fff1f1",
      lineHeight = 1.2,
      frameRate = 30,
    } = options;

    this.options = {
      fontSize,
      fontFamily,
      padding,
      backgroundColor,
      textColor,
      lineHeight,
      frameRate,
    };

    this.isRecording = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.canvas = null;
    this.ctx = null;
    this.stream = null;
    this.animationFrameId = null;
    this.currentAsciiText = "";
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.mimeType = null;
  }

  /**
   * Sets up the canvas for recording
   * @param {string} asciiText - Sample ASCII text to calculate dimensions
   */
  setupCanvas(asciiText) {
    const lines = asciiText.split("\n");
    if (
      lines.length > 0 &&
      lines[lines.length - 1] === "" &&
      asciiText.endsWith("\n")
    ) {
      lines.pop();
    }
    const lineLengths = lines.map((line) => line.length);
    const maxLineLength = lineLengths.length > 0 ? Math.max(...lineLengths) : 0;

    if (lines.length === 0 || maxLineLength === 0) {
      throw new Error("No content to record");
    }

    // Create a temporary canvas to measure text
    const measureCanvas = document.createElement("canvas");
    const measureCtx = measureCanvas.getContext("2d");
    measureCtx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;

    // Calculate dimensions
    const charWidth = measureCtx.measureText("M").width;
    const lineHeightPx = this.options.fontSize * this.options.lineHeight;
    this.canvasWidth = maxLineLength * charWidth + this.options.padding * 2;
    this.canvasHeight = lines.length * lineHeightPx + this.options.padding * 2;

    // Create the actual canvas for rendering
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.ctx = this.canvas.getContext("2d");
  }

  /**
   * Renders ASCII text to the canvas
   * @param {string} asciiText - ASCII text to render
   */
  renderFrame(asciiText) {
    if (!this.ctx || !this.canvas) {
      return;
    }

    const lines = asciiText.split("\n");
    if (
      lines.length > 0 &&
      lines[lines.length - 1] === "" &&
      asciiText.endsWith("\n")
    ) {
      lines.pop();
    }

    // Fill background
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Set text properties
    this.ctx.fillStyle = this.options.textColor;
    this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
    this.ctx.textBaseline = "top";

    // Draw each line
    const lineHeightPx = this.options.fontSize * this.options.lineHeight;
    lines.forEach((line, index) => {
      const y = this.options.padding + index * lineHeightPx;
      this.ctx.fillText(line, this.options.padding, y);
    });
  }

  /**
   * Starts recording
   * @param {Function} getAsciiText - Function that returns current ASCII text
   * @returns {Promise<void>}
   */
  async start(getAsciiText) {
    if (this.isRecording) {
      return;
    }

    // Get initial ASCII text to set up canvas
    const initialText = getAsciiText();
    if (!initialText || initialText.trim().length === 0) {
      throw new Error("No ASCII art to record");
    }

    this.setupCanvas(initialText);

    // Get canvas stream
    this.stream = this.canvas.captureStream(this.options.frameRate);

    // Set up MediaRecorder - find supported mime type
    let mimeType = "video/webm";
    const types = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }

    this.mimeType = mimeType;
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: mimeType,
      videoBitsPerSecond: 2500000, // 2.5 Mbps
    });

    this.recordedChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.isRecording = true;
    this.mediaRecorder.start(100); // Collect data every 100ms

    // Start rendering loop
    const renderLoop = () => {
      if (!this.isRecording) {
        return;
      }

      const asciiText = getAsciiText();
      if (asciiText) {
        this.currentAsciiText = asciiText;
        this.renderFrame(asciiText);
      }

      this.animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }

  /**
   * Stops recording and returns the video blob and mime type
   * @returns {Promise<{blob: Blob, mimeType: string}>}
   */
  async stop() {
    if (!this.isRecording) {
      return null;
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: this.mimeType || this.mediaRecorder.mimeType,
        });
        const result = {
          blob,
          mimeType: this.mimeType || this.mediaRecorder.mimeType,
        };
        this.cleanup();
        resolve(result);
      };

      this.mediaRecorder.onerror = (event) => {
        this.cleanup();
        reject(new Error("Recording error", event));
      };

      this.isRecording = false;
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      if (this.mediaRecorder.state === "recording") {
        this.mediaRecorder.stop();
      }

      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }
    });
  }

  /**
   * Cleans up resources
   */
  cleanup() {
    this.isRecording = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.canvas = null;
    this.ctx = null;
    this.stream = null;
    this.mimeType = null;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
