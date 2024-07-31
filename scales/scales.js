const canvas = new fabric.Canvas("scales");
canvas.selection = false;

const multiply = fabric.util.multiplyTransformMatrices;
const invert = fabric.util.invertTransform;

let scaleLine = null;

let leftCup = null;
let rightCup = null;

let leftBall = null;
let rightBall = null;

const scaleLineWidth = 300;
const cupWidth = 80;

let leftBallRadius = 40;
let rightBallRadius = 40;

let rightBallVal = 40;
let leftBallVal = 40;

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

function objectsBinding() {
  const cups = [leftCup, rightCup];
  const scaleLineTransform = scaleLine.calcTransformMatrix();
  const invertedScaleLineTransform = invert(scaleLineTransform);
  cups.forEach((o) => {
    const desiredTransform = multiply(
      invertedScaleLineTransform,
      o.calcTransformMatrix()
    );
    // save the desired relation here.
    o.relationship = desiredTransform;
  });
}

let angleValue = 15;

canvas.on("mouse:down", (o) => {
  console.log("mouse:down", o);
});

function replaceCups() {
  const cups = [leftCup, rightCup];
  cups.forEach((o, i) => {
    if (!o.relationship) {
      return;
    }
    const relationship = o.relationship;
    const newTransform = multiply(
      scaleLine.calcTransformMatrix(),
      relationship
    );
    const opt = fabric.util.qrDecompose(newTransform);
    o.set({
      flipX: false,
      flipY: false,
    });

    const radians = (angleValue * Math.PI) / 180;
    const cosOf = Math.cos(radians);

    const xPos = !i
      ? canvas.height / 2 - (scaleLineWidth / 2) * cosOf - cupWidth / 2
      : canvas.height / 2 + (scaleLineWidth / 2) * cosOf - cupWidth / 2;

    o.setPositionByOrigin({ x: xPos, y: opt.translateY }, "center", "center");
    o.set(opt);
    o.setCoords();
  });
}

function replaceBall(ball) {
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

  console.log("leftBallVal", leftBallVal);
  console.log("rightBallVal", rightBallVal);

  scaleLine.animate("top", topVal, {
    duration: 1000,
    onChange: canvas.renderAll.bind(canvas),
    easing: fabric.util.ease["easeOutBack"],
  });
  scaleLine.rotate(scaleAngle);

  ball.set("left", leftVal);
  ball.set("top", topVal);
}

const replaceScaleLine = () => {
  let scaleAngle;

  if (leftBallVal > rightBallVal) {
    scaleAngle = angleValue;
  } else if (leftBallVal < rightBallVal) {
    scaleAngle = -angleValue;
  } else {
    scaleAngle = 0;
  }

  console.log("angleValue", scaleAngle);

  scaleLine.animate("angle", scaleAngle, {
    duration: 1000,
    onChange: canvas.renderAll.bind(canvas),
    easing: fabric.util.ease["easeOutBack"],
  });
  scaleLine.rotate(scaleAngle);

  replaceCups();

  const cups = [leftCup, rightCup];
  cups.forEach((cup) => cup.rotate(0));

  const balls = [leftBall, rightBall];
  balls.forEach((ball) => replaceBall(ball));

  // console.log("cups", cups);

  // console.log("OBJS", canvas.getObjects());
};

function onObjectHandler(options) {
  if (options.target && options.target.type === "circle") {
    replaceBall(options.target);
    replaceScaleLine();
  }
  canvas.renderAll();
}

// canvas.on("mouse:move", onObjectHandler);
canvas.on("object:resize", onObjectHandler);
canvas.on("object:modified", onObjectHandler);

console.log("OBJS", canvas.getObjects());

function timer() {
  setTimeout(() => timer(), 10);
  canvas.requestRenderAll();
}
