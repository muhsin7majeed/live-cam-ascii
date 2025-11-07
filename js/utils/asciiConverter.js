/**
 * ASCII conversion utilities
 */

/**
 * Converts image data to ASCII string
 * @param {ImageData} imageData - The image data from canvas
 * @param {number} width - Width of the image
 * @param {number} height - Height of the image
 * @param {string} asciiRamp - Character set from dark to light
 * @returns {string} ASCII art representation
 */
export function convertToASCII(imageData, width, height, asciiRamp) {
  if (!asciiRamp || asciiRamp.length === 0) {
    return "";
  }

  const data = imageData.data;
  let asciiStr = "";

  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const char = asciiRamp[Math.floor((avg / 255) * (asciiRamp.length - 1))];
      line += char;
    }
    asciiStr += line + "\n";
  }

  return asciiStr;
}

/**
 * Calculates brightness from RGB values
 * @param {number} r - Red channel value
 * @param {number} g - Green channel value
 * @param {number} b - Blue channel value
 * @returns {number} Average brightness (0-255)
 */
export function calculateBrightness(r, g, b) {
  return (r + g + b) / 3;
}

/**
 * Maps brightness value to ASCII character
 * @param {number} brightness - Brightness value (0-255)
 * @param {string} asciiRamp - Character set from dark to light
 * @returns {string} Corresponding ASCII character
 */
export function mapBrightnessToChar(brightness, asciiRamp) {
  if (!asciiRamp || asciiRamp.length === 0) {
    return " ";
  }
  const index = Math.floor((brightness / 255) * (asciiRamp.length - 1));
  return asciiRamp[index];
}
