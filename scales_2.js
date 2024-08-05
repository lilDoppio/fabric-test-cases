const canvas = new fabric.Canvas("scales_2");
canvas.selection = false;

const multiply = fabric.util.multiplyTransformMatrices;
const invert = fabric.util.invertTransform;

const frameDilay = 16;

let scaleLine = null;

let leftCup = null;
let rightCup = null;

let leftCupLeftString = null;
let leftCupRightString = null;
let rightCupLeftString = null;
let rightCupRightString = null;

let leftBall = null;
let rightBall = null;

const scaleLineWidth = 300;
const cupWidth = 80;

let leftBallRadius = 40;
let rightBallRadius = 40;

let rightBallVal = 40;
let leftBallVal = 40;

let lastSavedAngle = 0;

drowScales();

function drowScales() {
  const rect = new fabric.Rect({
    top: canvas.height / 2,
    left: canvas.width / 2,
    width: 10,
    height: 400,
    fill: "grey",
    selectable: false,
    originX: "center",
    originY: "center",
  });

  canvas.add(rect);

  const circle = new fabric.Circle({
    radius: 20,
    fill: "grey",
    top: canvas.height / 2 - 200,
    left: canvas.width / 2,
    selectable: false,
    originX: "center",
    originY: "center",
  });

  canvas.add(circle);

  scaleLine = new fabric.Rect({
    top: canvas.height / 2 - scaleLineWidth / 2,
    left: canvas.width / 2,
    width: scaleLineWidth,
    height: 10,
    fill: "grey",
    selectable: false,
    originX: "center",
    originY: "center",
  });

  canvas.add(scaleLine);

  leftCup = new fabric.Rect({
    top: canvas.height / 2,
    left: canvas.width / 2 - scaleLineWidth / 2,
    width: cupWidth,
    height: 10,
    fill: "grey",
    selectable: false,
    originX: "center",
    originY: "center",
  });

  canvas.add(leftCup);

  leftCupLeftString = new fabric.Line(
    [
      canvas.width / 2 - scaleLineWidth / 2,
      canvas.height / 2 - scaleLineWidth / 2,
      canvas.width / 2 - scaleLineWidth / 2 - cupWidth / 2,
      canvas.height / 2,
    ],
    {
      stroke: "black",
      selectable: false,
    }
  );

  canvas.add(leftCupLeftString);

  leftCupRightString = new fabric.Line(
    [
      canvas.width / 2 - scaleLineWidth / 2,
      canvas.height / 2 - scaleLineWidth / 2,
      canvas.width / 2 - scaleLineWidth / 2 + cupWidth / 2,
      canvas.height / 2,
    ],
    {
      stroke: "black",
      selectable: false,
    }
  );

  canvas.add(leftCupRightString);

  rightCup = new fabric.Rect({
    top: canvas.height / 2,
    left: canvas.width / 2 + scaleLineWidth / 2,
    width: cupWidth,
    height: 10,
    fill: "grey",
    selectable: false,
    originX: "center",
    originY: "center",
  });

  canvas.add(rightCup);

  rightCupLeftString = new fabric.Line(
    [
      canvas.width / 2 + scaleLineWidth / 2,
      canvas.height / 2 - scaleLineWidth / 2,
      canvas.width / 2 + scaleLineWidth / 2 - cupWidth / 2,
      canvas.height / 2,
    ],
    {
      stroke: "black",
      selectable: false,
    }
  );

  canvas.add(rightCupLeftString);

  rightCupRightString = new fabric.Line(
    [
      canvas.width / 2 + scaleLineWidth / 2,
      canvas.height / 2 - scaleLineWidth / 2,
      canvas.width / 2 + scaleLineWidth / 2 + cupWidth / 2,
      canvas.height / 2,
    ],
    {
      stroke: "black",
      selectable: false,
    }
  );

  canvas.add(rightCupRightString);

  leftBall = new fabric.Circle({
    radius: leftBallRadius,
    fill: "red",
    left: canvas.width / 2 - scaleLineWidth / 2,
    top: canvas.height / 2 - leftBallRadius,
    selectable: true,
    lockMovementX: true,
    lockMovementY: true,
    originX: "center",
    originY: "center",
  });

  canvas.add(leftBall);

  rightBall = new fabric.Circle({
    radius: rightBallRadius,
    fill: "green",
    left: canvas.width / 2 + scaleLineWidth / 2,
    top: canvas.height / 2 - rightBallRadius,
    selectable: true,
    lockMovementX: true,
    lockMovementY: true,
    originX: "center",
    originY: "center",
  });

  canvas.add(rightBall);

  objectsBinding();
}

let angleValue = 15;
let savedAngleResults = {
  left: {},
  right: {},
};

calcAngleResult();

function calcAngleResult() {
  for (
    let currAngle = -angleValue * 100;
    currAngle <= angleValue * 100;
    currAngle++
  ) {
    let fixedAngle = currAngle / 100;

    scaleLine.rotate(fixedAngle);
    const cups = [leftCup, rightCup];
    cups.forEach((cup, i) => {
      if (!cup.relationship) return;

      const relationship = cup.relationship;
      const newTransform = multiply(
        scaleLine.calcTransformMatrix(),
        relationship
      );

      const opt = fabric.util.qrDecompose(newTransform);

      const radians = (fixedAngle * Math.PI) / 180;
      const cosOf = Math.cos(radians);

      const xPos = !i
        ? canvas.height / 2 - (scaleLineWidth / 2) * cosOf - cupWidth / 2
        : canvas.height / 2 + (scaleLineWidth / 2) * cosOf - cupWidth / 2;

      const key = fixedAngle;

      const marginOfXError = 10;
      const marginOfYError = 0;

      if (!i) {
        savedAngleResults.left[key] = {};
        savedAngleResults.left[key].left = xPos - marginOfXError;
        savedAngleResults.left[key].top = opt.translateY - marginOfYError;
      } else {
        savedAngleResults.right[key] = {};
        savedAngleResults.right[key].left = xPos - marginOfXError;
        savedAngleResults.right[key].top = opt.translateY - marginOfYError;
      }
    });
  }
}

function objectsBinding() {
  const bindObjects = [
    leftCup,
    rightCup,
    leftCupLeftString,
    leftCupRightString,
    rightCupLeftString,
    rightCupRightString,
  ];

  const scaleLineTransform = scaleLine.calcTransformMatrix();
  const invertedScaleLineTransform = invert(scaleLineTransform);

  bindObjects.forEach((o) => {
    const desiredTransform = multiply(
      invertedScaleLineTransform,
      o.calcTransformMatrix()
    );

    o.relationship = desiredTransform;
  });
}

updateScales();

function updateScales(prevRightBallVal, prevLeftBallVal) {
  rightBallVal = rightBallRadius * rightBall.zoomX;
  leftBallVal = leftBallRadius * leftBall.zoomX;

  if (rightBallVal === prevRightBallVal && leftBallVal === prevLeftBallVal) {
    return setTimeout(
      () => updateScales(rightBallVal, leftBallVal),
      frameDilay
    );
  }

  let scaleAngle;

  if (rightBallVal > leftBallVal) {
    scaleAngle = angleValue;
  } else if (rightBallVal < leftBallVal) {
    scaleAngle = -angleValue;
  } else {
    scaleAngle = 0;
  }

  scaleLine.animate("angle", scaleAngle, {
    duration: 1000,
    onChange: canvas.renderAll.bind(canvas),
    easing: fabric.util.ease["easeOut"],
  });

  const balls = [leftBall, rightBall];
  balls.forEach((ball) => updateBall(ball));

  setTimeout(() => updateScales(rightBallVal, leftBallVal), frameDilay);
}

onScaleUpdate();

function onScaleUpdate() {
  if (lastSavedAngle == scaleLine.angle.toFixed(2)) {
    return setTimeout(() => onScaleUpdate(), frameDilay);
  }

  lastSavedAngle = scaleLine.angle.toFixed(2);

  const strings = [
    leftCupLeftString,
    leftCupRightString,
    rightCupLeftString,
    rightCupRightString,
  ];
  strings.forEach((string, i) => updateStrings(string, i));

  const cups = [leftCup, rightCup];
  cups.forEach((cup, i) => updateCups(cup, i));

  const balls = [leftBall, rightBall];
  balls.forEach((ball) => updateBall(ball));

  setTimeout(() => onScaleUpdate(), frameDilay);
}

function updateStrings(string, i) {
  if (!string.relationship) {
    return;
  }

  const currAngle = scaleLine.angle.toFixed(2);
  let stringPos = null;

  if (i < 2) {
    stringPos = savedAngleResults.left[currAngle];
  } else {
    stringPos = savedAngleResults.right[currAngle];
  }

  if (!stringPos) return;

  let posX = stringPos.left;

  if (i === 0 || i === 2) {
    posX -= cupWidth / 2;
  }

  string.setPositionByOrigin({ x: posX, y: stringPos.top }, "left", "bottom");
}

function updateCups(cup, i) {
  if (!cup.relationship) {
    return;
  }

  const currAngle = scaleLine.angle.toFixed(2);
  let cupPos = null;

  if (!i) {
    cupPos = savedAngleResults.left[currAngle];
  } else {
    cupPos = savedAngleResults.right[currAngle];
  }

  if (!cupPos) return;

  cup.setPositionByOrigin(
    { x: cupPos.left, y: cupPos.top },
    "center",
    "center"
  );
}

function updateBall(ball) {
  const zoom = ball.zoomX;

  let leftVal = null;
  let topVal = null;

  if (ball.fill === "red") {
    leftVal = leftCup.left;
    topVal = leftCup.top - leftBallRadius * zoom;

    leftBallVal = leftBallRadius * zoom;
  } else if (ball.fill === "green") {
    leftVal = rightCup.left;
    topVal = rightCup.top - rightBallRadius * zoom;

    rightBallVal = rightBallRadius * zoom;
  } else {
    return;
  }

  ball.set("left", leftVal);
  ball.set("top", topVal);
  ball.set("zoomX", zoom);
  ball.set("zoomY", zoom);
}
