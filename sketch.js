// Define variables for canvas size
let canvasWidth = 600;
let canvasHeight = canvasWidth/2;
let factor = canvasWidth / 50;
let c1, c2, c3, c4, c5, c6;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  c1 = new DraggableCircle(canvasWidth * 0.57, canvasHeight * 0.67, 20, 4);
  c2 = new DraggableCircle(canvasWidth * 0.75, canvasHeight * 0.53, 20, 3);
  c6 = new DraggableCircle(canvasWidth * 1.2, canvasHeight * 0.4, 20, 3);
  c3 = new DraggableCircle(canvasWidth, canvasHeight * 0.47, 20, 2);
  c4 = new DraggableCircle(canvasWidth * 0.33, canvasHeight * 0.53, 20, 1);
  c5 = new DraggableCircle(canvasWidth * 0.25, canvasHeight * 0.73, 20, 1);
  
  
}

function draw() {
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

  drawTriangles();
}

function drawTriangles() {
  // Most back middle small triangle
  fill(65, 68, 75);
  triangle(
    canvasWidth * 0.22 - (mouseX*4 /factor), canvasHeight,
    c1.getX(), c1.y,
    canvasWidth * 0.9 - (mouseX*4 /factor), canvasHeight
  );

  // Second back middle big triangle
  fill(114, 118, 123);
  triangle(
    canvasWidth * 0.5 - (mouseX*3 /factor), canvasHeight,
    c2.getX(), c2.y,
    canvasWidth - (mouseX*3 /factor), canvasHeight
  );
  
    // t back middle big triangle6
  fill(114, 118, 123);
  triangle(
    canvasWidth * 0.8 - (mouseX*3 /factor), canvasHeight,
    c6.getX(), c6.y,
    canvasWidth * 1.6 - (mouseX*3 /factor), canvasHeight
  );

  // Big right triangle
  fill(130, 134, 138);
  triangle(
    canvasWidth * 0.58 - (mouseX*2 /factor), canvasHeight,
    c3.getX(), c3.y,
    canvasWidth * 1.25 - (mouseX*2 /factor), canvasHeight
  );

  // Front big left triangle
  fill(130, 134, 138);
  triangle(
    canvasWidth * -0.17 - (mouseX /factor), canvasHeight,
    c4.getX(), c4.y,
    canvasWidth * 0.67 - (mouseX /factor), canvasHeight
  );

  // Last triangle (m5)
  fill(166, 169, 172);
  triangle(
    canvasWidth * -0.08 - (mouseX /factor), canvasHeight,
    c5.getX(), c5.y,
    canvasWidth * 0.55 - (mouseX /factor), canvasHeight
  );

  // Display and update all circles
  c1.display();
  c1.hover(mouseX, mouseY);
  c2.display();
  c2.hover(mouseX, mouseY);
  c3.display();
  c3.hover(mouseX, mouseY);
  c4.display();
  c4.hover(mouseX, mouseY);
  c5.display();
  c5.hover(mouseX, mouseY);
  c6.display();
  c6.hover(mouseX, mouseY);
}

class DraggableCircle {
  constructor(x, y, r, moveFactor) {
    this.initialX = x;
    this.x = x;
    this.y = y;
    this.r = r;
    this.dragging = false;
    this.offsetY = 0;
    this.hovered = false;
    this.moveFactor = moveFactor;
  }

  getX() {
    return this.x - (mouseX * this.moveFactor / factor);
  }

  display() {
    stroke(0);
    if (this.dragging || this.hovered) {
      fill(255, 249, 201);
      ellipse(this.getX(), this.y, this.r * 2);
    } 
  }

  hover(px, py) {
    let d = dist(px, py, this.getX(), this.y);
    this.hovered = d < this.r;

    if (this.dragging) {
      this.y = lerp(this.y, py, 0.1);
    }
  }

  pressed(px, py) {
    let d = dist(px, py, this.getX(), this.y);
    if (d < this.r) {
      this.dragging = true;
      this.offsetY = this.y - py;
    }
  }

  released() {
    this.dragging = false;
  }
}

function mousePressed() {
  c1.pressed(mouseX, mouseY);
  c2.pressed(mouseX, mouseY);
  c3.pressed(mouseX, mouseY);
  c4.pressed(mouseX, mouseY);
  c5.pressed(mouseX, mouseY);
  c6.pressed(mouseX, mouseY);
}

function mouseReleased() {
  c1.released();
  c2.released();
  c3.released();
  c4.released();
  c5.released();
  c6.released();
}