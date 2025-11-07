const asciiRamp = " .:-=+*#%@";
const video = document.getElementById("video");
const ascii = document.getElementById("ascii");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
  video.addEventListener("play", renderASCII);
});

function renderASCII() {
  const width = 80; // smaller = faster
  const height = 60;
  canvas.width = width;
  canvas.height = height;

  if (video.paused || video.ended) return;

  ctx.drawImage(video, 0, 0, width, height);
  const frame = ctx.getImageData(0, 0, width, height);
  const data = frame.data;

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

  ascii.textContent = asciiStr;
  requestAnimationFrame(renderASCII);
}
