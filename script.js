const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

const audioInput = document.getElementById("audio-file");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const albumArt = document.getElementById("album-art");
const lyricsDiv = document.getElementById("lyrics");

let audioCtx, analyser, dataArray, audioElement;
let lyrics = [];

// Load sample lyrics
fetch("lyrics.json")
  .then(res => res.json())
  .then(data => lyrics = data);

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Draw visualizer
function draw() {
  requestAnimationFrame(draw);
  if (!analyser) return;

  analyser.getByteFrequencyData(dataArray);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const barWidth = canvas.width / dataArray.length;
  dataArray.forEach((value, i) => {
    const barHeight = value * 2;
    ctx.fillStyle = `rgb(${barHeight+100},50,200)`;
    ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
  });

  // Update lyrics
  if (audioElement) {
    const currentTime = audioElement.currentTime * 1000; // ms
    const currentLine = lyrics.find(l => currentTime >= l.start && currentTime <= l.end);
    lyricsDiv.textContent = currentLine ? currentLine.text : "";
  }
}

// Handle audio file selection
audioInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (audioElement) {
    audioElement.pause();
  }

  audioElement = new Audio(URL.createObjectURL(file));
  audioElement.crossOrigin = "anonymous";
  audioElement.play();

  // Setup Web Audio
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audioElement);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  // Set dummy info (you can replace later with real metadata)
  titleEl.textContent = file.name.replace(/\.[^/.]+$/, "");
  artistEl.textContent = "Unknown Artist";
  albumArt.src = "album.jpg"; // placeholder
});

draw();
