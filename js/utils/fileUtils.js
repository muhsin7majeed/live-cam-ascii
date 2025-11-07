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
