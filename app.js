const video = document.querySelector("#camera");
const canvas = document.querySelector("#overlay");
const ctx = canvas.getContext("2d");
const emptyState = document.querySelector("#emptyState");
const startButton = document.querySelector("#startButton");
const switchButton = document.querySelector("#switchButton");
const statusText = document.querySelector("#statusText");
const countText = document.querySelector("#countText");

let model;
let stream;
let facingMode = "environment";
let detecting = false;

function setStatus(text) {
  statusText.textContent = text;
}

function stopStream() {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    track.stop();
  }
  stream = null;
}

async function openCamera() {
  stopStream();
  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  });

  video.srcObject = stream;
  await video.play();
  emptyState.classList.add("hidden");
  switchButton.disabled = false;
}

function resizeCanvas() {
  const box = video.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.round(box.width * pixelRatio);
  canvas.height = Math.round(box.height * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function videoToCanvasRect([x, y, width, height]) {
  const viewWidth = canvas.clientWidth;
  const viewHeight = canvas.clientHeight;
  const videoRatio = video.videoWidth / video.videoHeight;
  const viewRatio = viewWidth / viewHeight;

  let renderedWidth = viewWidth;
  let renderedHeight = viewHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (videoRatio > viewRatio) {
    renderedHeight = viewHeight;
    renderedWidth = renderedHeight * videoRatio;
    offsetX = (viewWidth - renderedWidth) / 2;
  } else {
    renderedWidth = viewWidth;
    renderedHeight = renderedWidth / videoRatio;
    offsetY = (viewHeight - renderedHeight) / 2;
  }

  return [
    offsetX + (x / video.videoWidth) * renderedWidth,
    offsetY + (y / video.videoHeight) * renderedHeight,
    (width / video.videoWidth) * renderedWidth,
    (height / video.videoHeight) * renderedHeight,
  ];
}

function drawDetections(people) {
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#22c55e";
  ctx.fillStyle = "#22c55e";
  ctx.font = "700 14px system-ui, sans-serif";

  for (const person of people) {
    const [x, y, width, height] = videoToCanvasRect(person.bbox);
    const confidence = `${Math.round(person.score * 100)}%`;
    ctx.strokeRect(x, y, width, height);
    ctx.fillRect(x, Math.max(0, y - 28), 88, 28);
    ctx.fillStyle = "#052e16";
    ctx.fillText(`人 ${confidence}`, x + 10, Math.max(19, y - 9));
    ctx.fillStyle = "#22c55e";
  }
}

async function detectLoop() {
  if (!detecting) return;

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    const predictions = await model.detect(video);
    const people = predictions.filter((item) => item.class === "person" && item.score >= 0.55);
    countText.textContent = String(people.length);
    setStatus(people.length > 0 ? "偵測到人" : "掃描中");
    drawDetections(people);
  }

  requestAnimationFrame(detectLoop);
}

async function start() {
  try {
    setStatus("載入模型");
    startButton.disabled = true;
    model = model || (await cocoSsd.load());
    setStatus("開啟相機");
    await openCamera();
    detecting = true;
    detectLoop();
  } catch (error) {
    console.error(error);
    startButton.disabled = false;
    setStatus("無法開啟");
    alert("無法開啟相機。請確認瀏覽器權限，並使用 HTTPS 或 localhost 開啟。");
  }
}

async function switchCamera() {
  facingMode = facingMode === "environment" ? "user" : "environment";
  setStatus("切換鏡頭");
  await openCamera();
}

startButton.addEventListener("click", start);
switchButton.addEventListener("click", switchCamera);
window.addEventListener("resize", resizeCanvas);
