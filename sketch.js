// Define variables for canvas size
let canvasWidth = 600;
let canvasHeight = canvasWidth/2;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
}

function draw() {
  let factor = canvasWidth / 30;
  
  background(100);
  strokeWeight(0);

  // Top quad (First layer)
  fill(255, 249, 201);
  quad(
    0, 0,
    canvasWidth, 0,
    canvasWidth, canvasHeight,
    0, canvasHeight
  );

  // Second quad
  fill(255, 212, 151);
  quad(
    0 - (Math.abs(mouseX*2 /factor)), canvasHeight * 0.13,
    canvasWidth + (Math.abs(mouseX*2 /factor)), canvasHeight * 0.2,
    canvasWidth, canvasHeight,
    0, canvasHeight
  );

  // Third quad
  fill(251, 165, 139);
  quad(
    0 - (Math.abs(mouseX*3 /factor)), canvasHeight * 0.37,
    canvasWidth + (Math.abs(mouseX*3 /factor)), canvasHeight * 0.33,
    canvasWidth, canvasHeight,
    0, canvasHeight
  );

  // Bottom quad
  fill(251, 145, 143);
  quad(
    0 - (Math.abs(mouseX*4 /factor)), canvasHeight * 0.57,
    canvasWidth + (Math.abs(mouseX*4 /factor)), canvasHeight * 0.53,
    canvasWidth, canvasHeight,
    0, canvasHeight
  );

  // Most back middle small triangle
  fill(65, 68, 75);
  triangle(
    canvasWidth * 0.22 - (mouseX*4 /factor), canvasHeight,
    canvasWidth * 0.57 - (mouseX*4 /factor), canvasHeight * 0.67,
    canvasWidth * 0.9 - (mouseX*4 /factor), canvasHeight
  );

  // Second back middle big triangle
  fill(114, 118, 123);
  triangle(
    canvasWidth * 0.5 - (mouseX*3 /factor), canvasHeight,
    canvasWidth * 0.75-(mouseX*3 /factor), canvasHeight * 0.53,
    canvasWidth - (mouseX*3 /factor), canvasHeight
  );

  // Big right triangle
  fill(130, 134, 138);
  triangle(
    canvasWidth * 0.58 - (mouseX*2 /factor), canvasHeight,
    canvasWidth-(mouseX*2 /factor), canvasHeight * 0.47,
    canvasWidth * 1.25 - (mouseX*2 /factor), canvasHeight
  );

  // Front big left triangle
  fill(130, 134, 138);
  triangle(
    canvasWidth * -0.17 - (mouseX /factor), canvasHeight,
    canvasWidth * 0.33-(mouseX*2 /factor), canvasHeight * 0.53,
    canvasWidth * 0.67 - (mouseX /factor), canvasHeight
  );

  // Most front  left triangle
  fill(166, 169, 172);
  triangle(
    canvasWidth * -0.08 - (mouseX /factor), canvasHeight,
    canvasWidth * 0.25-(mouseX /factor), canvasHeight * 0.73,
    canvasWidth * 0.55 - (mouseX /factor), canvasHeight
  );
}
