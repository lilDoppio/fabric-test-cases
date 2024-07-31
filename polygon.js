const canvas = new fabric.Canvas("polygon");
canvas.selection = false;

const container = document.querySelector(".upper-canvas");
const startBtn = document.querySelector("#start");
const resultElm = document.querySelector("#square");

let allowDrowing = false;

startBtn.addEventListener("click", init);

const pointSize = 8;
const cordGap = 8;

let currMousePosX = 0;
let currMousePosY = 0;

let currLine = null;

let xCords = [];
let yCords = [];

function init() {
  canvas.remove(...canvas.getObjects());

  container.addEventListener("click", startDrowing);
  container.addEventListener("mousemove", mouseTracker);
  resultElm.innerHTML = "";

  currMousePosX = 0;
  currMousePosY = 0;

  currLine = null;

  xCords = [];
  yCords = [];
}

function mouseTracker(e) {
  const existCordX = xCords.find(
    (val) => e.offsetX < val + cordGap && e.offsetX > val - cordGap
  );
  const existCordY = yCords.find(
    (val) => e.offsetY < val + cordGap && e.offsetY > val - cordGap
  );

  currMousePosX = existCordX || e.offsetX;
  currMousePosY = existCordY || e.offsetY;

  if (!currLine) return;

  currLine.set("x2", currMousePosX);
  currLine.set("y2", currMousePosY);

  canvas.renderAll();
}

function startDrowing() {
  const pointWidth = pointSize;
  const pointHeight = pointSize;

  const top = currMousePosY - pointWidth / 2;
  const left = currMousePosX - pointHeight / 2;

  const rect = new fabric.Rect({
    top: top,
    left: left,
    width: pointWidth,
    height: pointHeight,
    fill: "red",
    stroke: "black",
    strokeWidth: 2,
    selectable: false,
  });

  if (currMousePosX === xCords[0] && currMousePosY === yCords[0]) {
    container.removeEventListener("click", startDrowing);

    return endDrowing();
  }

  xCords.push(currMousePosX);
  yCords.push(currMousePosY);

  canvas.add(rect);

  const lineStartX = rect.left + pointSize / 2;
  const lineStartY = rect.top + pointSize / 2;
  const lineEndX = currMousePosX;
  const lineEndY = currMousePosY;

  const line = new fabric.Line([lineStartX, lineStartY, lineEndX, lineEndY], {
    width: 4,
    height: 4,
    fill: "red",
    stroke: "black",
    strokeWidth: 4,
    selectable: false,
  });

  canvas.add(line);

  currLine = line;
}

function endDrowing() {
  currLine = null;

  container.removeEventListener("mousemove", mouseTracker);

  canvas.remove(...canvas.getObjects());

  const points = [];

  for (let i = 0; i < xCords.length; i++) {
    points[i] = {
      x: xCords[i],
      y: yCords[i],
    };
  }

  const polygon = new fabric.Polygon(points, {
    selectable: false,
    objectCaching: false,
  });

  canvas.add(polygon);

  let cordsLength = xCords.length;
  let square = 0;
  for (let i = 0; i < cordsLength - 1; i++) {
    square += xCords[i] * yCords[i + 1] - yCords[i] * xCords[i + 1];
  }

  square +=
    xCords[cordsLength - 1] * yCords[0] - yCords[cordsLength - 1] * xCords[0];
  square /= 2;
  square = Math.abs(square);

  resultElm.innerHTML = square.toLocaleString();
}
