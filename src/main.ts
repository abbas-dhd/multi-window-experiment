import './style.css';
import { v4 as uuidv4 } from 'uuid';
import { WindowData, Dimensions } from './types';

let windowData: WindowData[];
let currentWindowId: string;

declare global {
  interface Window {
    worldDimension: Dimensions;
  }
}
window.worldDimension = {
  height: 0,
  width: 0,
  x: 0,
  y: 0,
};

addEventListener('storage', (e) => {
  if (e.key === 'windowData') {
    windowData =
      (JSON.parse(localStorage.getItem('windowData') || '') as WindowData[]) ||
      [];
    updateGlobalWindowDimensions(windowData);
    windowData.forEach((data, index) => {
      renderBox(index, data);
    });
  }
});

window.addEventListener('unload', () => {
  const currentWindowIndex = windowData.findIndex((data) => {
    return data.id === currentWindowId;
  });

  windowData.splice(currentWindowIndex, 1);
  localStorage.setItem('windowData', JSON.stringify(windowData));
});

window.onload = () => {
  setTimeout(() => {
    windowData = JSON.parse(
      localStorage.getItem('windowData') || '[]'
    ) as WindowData[];
    const dimensions: Dimensions = getThisWindowDimensions();

    currentWindowId = uuidv4();
    windowData.push({ id: currentWindowId, dimensions });
    updateGlobalWindowDimensions(windowData);
    localStorage.setItem('windowData', JSON.stringify(windowData));

    windowData.forEach((data, index) => {
      renderBox(index, data);
    });
  }, 500);
};

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
    updateGlobalWindowDimensions(windowData);

    windowData.forEach((data, index) => {
      updateRenderBox(index, data);
    });

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

function updateGlobalWindowDimensions(windowsData: WindowData[]) {
  let left = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  let top = Infinity;

  // Loop through each box to find the extreme positions
  windowsData.forEach((window) => {
    const { x, y, width, height } = window.dimensions;
    left = Math.min(left, x);
    right = Math.max(right, x + width);
    bottom = Math.max(bottom, y + height);
    top = Math.min(top, y);
  });

  // Calculate the outer box dimensions
  const outerBoxWidth = right - left;
  const outerBoxHeight = bottom - top;

  window.worldDimension.x = left;
  window.worldDimension.y = top;
  window.worldDimension.width = outerBoxWidth;
  window.worldDimension.height = outerBoxHeight;
}

const render = () => {
  updateWindowDimensions();
  requestAnimationFrame(render);
};

render();

function updateRenderBox(index = 0, _windowData: WindowData) {
  const element = document.getElementById(_windowData.id);
  if (!element) return;

  element.style.left =
    _windowData.dimensions.x -
    window.screenLeft +
    _windowData.dimensions.width / 2 +
    'px';

  element.style.top =
    _windowData.dimensions.y -
    window.screenTop +
    _windowData.dimensions.height / 2 +
    'px';
}

function renderBox(index = 0, _windowData: WindowData) {
  const element = document.getElementById(_windowData.id)?.remove();

  if (element) return;

  const newElement = document.createElement('div');
  newElement.id = _windowData.id;
  newElement.style.borderWidth = '2px';
  newElement.style.borderStyle = 'solid';
  newElement.style.borderColor = `hsl(${index * 50}, 100%, 50%)`;
  newElement.style.position = 'absolute';

  const boxSideLength = 100 + index * 50;
  const rotation = index * 10;

  newElement.style.left =
    _windowData.dimensions.x -
    window.screenLeft +
    _windowData.dimensions.width / 2 +
    'px';

  newElement.style.top =
    _windowData.dimensions.y -
    window.screenTop +
    _windowData.dimensions.height / 2 +
    'px';

  newElement.style.height = `${boxSideLength}px`;
  newElement.style.width = `${boxSideLength}px`;

  newElement.style.transform = `rotate(${rotation}deg`;
  newElement.classList.add('box');

  document.body.appendChild(newElement);
}
