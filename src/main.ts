import './style.css';
import { v4 as uuidv4 } from 'uuid';
import { WindowData, Dimensions } from './types';

let windowData: WindowData[];
let currentWindowId: string;

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

    windowData.forEach((data) => {
      updateRenderBox(data);
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

function updateRenderBox(_windowData: WindowData) {
  const element = document.getElementById(_windowData.id);
  if (!element) return;

  const targetPositionX =
    _windowData.dimensions.x -
    window.screenLeft +
    _windowData.dimensions.width / 2;

  const targetPositionY =
    _windowData.dimensions.y -
    window.screenTop +
    _windowData.dimensions.height / 2;

  element.style.left = targetPositionX + 'px';
  element.style.top = targetPositionY + 'px';
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
  newElement.style.height = `${boxSideLength}px`;
  newElement.style.width = `${boxSideLength}px`;

  const targetPositionX =
    _windowData.dimensions.x -
    window.screenLeft +
    _windowData.dimensions.width / 2;

  const targetPositionY =
    _windowData.dimensions.y -
    window.screenTop +
    _windowData.dimensions.height / 2;

  newElement.style.left = targetPositionX + 'px';
  newElement.style.top = targetPositionY + 'px';

  newElement.style.transform = `rotate(${rotation}deg`;
  newElement.classList.add('box');

  document.body.appendChild(newElement);
}

window.onload = () => {
  setTimeout(() => {
    windowData = JSON.parse(
      localStorage.getItem('windowData') || '[]'
    ) as WindowData[];
    const dimensions: Dimensions = getThisWindowDimensions();

    currentWindowId = uuidv4();
    windowData.push({ id: currentWindowId, dimensions });
    localStorage.setItem('windowData', JSON.stringify(windowData));

    windowData.forEach((data, index) => {
      renderBox(index, data);
    });
  }, 500);
};

addEventListener('storage', (e) => {
  if (e.key === 'windowData') {
    windowData =
      (JSON.parse(
        localStorage.getItem('windowData') || '[]'
      ) as WindowData[]) || [];
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

const render = () => {
  updateWindowDimensions();
  requestAnimationFrame(render);
};

render();
