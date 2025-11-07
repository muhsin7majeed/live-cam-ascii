const video = document.getElementById("video");
const ascii = document.getElementById("ascii");
const asciiCharsInput = document.getElementById("asciiChars");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

let asciiRamp = " .:-=+*#%@";

// Update character set when input changes
asciiCharsInput.addEventListener("input", (e) => {
  asciiRamp = e.target.value || " .:-=+*#%@";
});

navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
  video.addEventListener("play", renderASCII);
}).catch((error) => {
  console.error("Error accessing camera:", error);
  ascii.textContent = "Error: Could not access camera. Please allow camera permissions.";
});

function renderASCII() {
  const width = 80; // smaller = faster
  const height = 60;
  canvas.width = width;
  canvas.height = height;

  if (video.paused || video.ended) return;

  // Use current character set from input
  const currentRamp = asciiCharsInput.value || asciiRamp;
  if (currentRamp.length === 0) {
    requestAnimationFrame(renderASCII);
    return;
  }

  ctx.drawImage(video, 0, 0, width, height);
  const frame = ctx.getImageData(0, 0, width, height);
  const data = frame.data;

  let asciiStr = "";
  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const char = currentRamp[Math.floor((avg / 255) * (currentRamp.length - 1))];
      line += char;
    }
    asciiStr += line + "\n";
  }

  ascii.textContent = asciiStr;
  requestAnimationFrame(renderASCII);
}
