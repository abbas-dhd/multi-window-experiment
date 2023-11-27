import './style.css';
import { v4 as uuidv4 } from 'uuid';
import { WindowData, Dimensions } from './types';

let windowData: WindowData[];
let currentWindowId: string;
let initialized = false;

const canvas: HTMLCanvasElement = document.getElementById(
  'canvas'
) as HTMLCanvasElement;
const ctx = canvas!.getContext('2d');

if (!ctx) throw new Error('No context');

ctx.canvas.height = window.innerHeight;
ctx.canvas.width = window.innerWidth;

function updateWindowDimensions() {
  const currentWindowIndex = windowData?.findIndex((data) => {
    return data.id === currentWindowId;
  });

  if (currentWindowIndex === undefined || currentWindowIndex === -1) return;

  const newDimensions = getThisWindowDimensions();
  const oldDimensions = windowData[currentWindowIndex].dimensions;

  if (
    newDimensions.x !== oldDimensions.x ||
    newDimensions.y !== oldDimensions.y ||
    newDimensions.width !== oldDimensions.width ||
    newDimensions.height !== oldDimensions.height
  ) {
    windowData[currentWindowIndex].dimensions = newDimensions;

    drawAllBoxes(windowData);

    localStorage.setItem('windowData', JSON.stringify(windowData));
  }
}

function getThisWindowDimensions() {
  return {
    x: window.screenLeft,
    y: window.screenTop,
    height: window.innerHeight,
    width: window.innerWidth,
  };
}

function drawAllBoxes(_windowData: WindowData[]) {
  if (!ctx) return;
  // clear canvas before drawing boxes
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  _windowData.forEach((data, index) => {
    drawBox(data, index);
  });
}

function drawBox(_windowData: WindowData, index = 0) {
  if (!ctx) return;

  ctx.save();

  const boxSideLength = 100 + index * 50;
  const rotateAngle = index * 10; // degrees
  const targetX =
    _windowData.dimensions.x -
    window.screenLeft +
    _windowData.dimensions.width / 2;

  const targetY =
    _windowData.dimensions.y -
    window.screenTop +
    _windowData.dimensions.height / 2;

  ctx.strokeStyle = `hsl(${index * 50}, 100%, 50%)`;
  ctx.lineWidth = 2;

  ctx.translate(targetX + boxSideLength / 2, targetY + boxSideLength / 2);
  ctx.rotate((rotateAngle * Math.PI) / 180);
  ctx.strokeRect(
    -boxSideLength / 2,
    -boxSideLength / 2,
    boxSideLength,
    boxSideLength
  );

  ctx.restore();
}

function init() {
  initialized = true;
  setTimeout(() => {
    windowData = JSON.parse(
      localStorage.getItem('windowData') || '[]'
    ) as WindowData[];
    const dimensions: Dimensions = getThisWindowDimensions();

    currentWindowId = uuidv4();
    windowData.push({ id: currentWindowId, dimensions });
    localStorage.setItem('windowData', JSON.stringify(windowData));

    drawAllBoxes(windowData);
  }, 500);
}

window.onload = () => {
  if (document.visibilityState === 'hidden') return;
  init();
};

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState != 'hidden' && !initialized) {
    init();
  }
});

window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

addEventListener('storage', (e) => {
  if (e.key === 'windowData') {
    windowData =
      (JSON.parse(
        localStorage.getItem('windowData') || '[]'
      ) as WindowData[]) || [];

    drawAllBoxes(windowData);
  }
});

window.addEventListener('unload', () => {
  const currentWindowIndex = windowData.findIndex((data) => {
    return data.id === currentWindowId;
  });

  windowData.splice(currentWindowIndex, 1);
  localStorage.setItem('windowData', JSON.stringify(windowData));
});

const render = () => {
  updateWindowDimensions();
  requestAnimationFrame(render);
};

render();
