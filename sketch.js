// Define variables for canvas size
let canvasWidth = 1920;
let canvasHeight = 1080;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
}

function draw() {
  background(100);
  strokeWeight(0);

  // Top quad (First layer)
  fill(255, 249, 201);
  quad(0, 0, canvasWidth, 0, canvasWidth, canvasHeight * 0.2, 0, canvasHeight * 0.13);
  
  // Second quad
  fill(255, 212, 151);
  quad(0, canvasHeight * 0.13, canvasWidth, canvasHeight * 0.2, canvasWidth, canvasHeight * 0.33, 0, canvasHeight * 0.37);

  // Third quad
  fill(251, 165, 139);
  quad(0, canvasHeight * 0.37, canvasWidth, canvasHeight * 0.33, canvasWidth, canvasHeight * 0.53, 0, canvasHeight * 0.57);

  // Bottom quad
  fill(251, 145, 143);
  quad(0, canvasHeight * 0.57, canvasWidth, canvasHeight * 0.53, canvasWidth, canvasHeight, 0, canvasHeight);

  // Most back middle small triangle
  fill(65, 68, 75);
  triangle(canvasWidth * 0.22, canvasHeight, 
           canvasWidth * 0.57, canvasHeight * 0.67, 
           canvasWidth * 0.9, canvasHeight);

  // Second back middle big triangle
  fill(114, 118, 123);
  triangle(canvasWidth * 0.5, canvasHeight, 
           canvasWidth * 0.75, canvasHeight * 0.53, 
           canvasWidth, canvasHeight);

  // Big right triangle
  fill(130, 134, 138);
  triangle(canvasWidth * 0.58, canvasHeight, 
           canvasWidth, canvasHeight * 0.47, 
           canvasWidth * 1.25, canvasHeight);

  // Front big left triangle
  fill(130, 134, 138);
  triangle(canvasWidth * -0.17, canvasHeight, 
           canvasWidth * 0.33, canvasHeight * 0.53, 
           canvasWidth * 0.67, canvasHeight);

  // Most front big left triangle
  fill(166, 169, 172);
  triangle(canvasWidth * -0.08, canvasHeight, 
           canvasWidth * 0.25, canvasHeight * 0.73, 
           canvasWidth * 0.55, canvasHeight);
}

