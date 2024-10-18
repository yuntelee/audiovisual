
let canvasWidth = screen.availWidth;
let canvasHeight = screen.availHeight;

let perspective = screen.availWidth / 600;
let factor = canvasWidth / 50;
let c1, c2, c3, c4, c5, c6, c7;

let gtr, inst, beef; // Audio elements
let gtrSrc, instSrc, beefSrc; // Media element sources
let gtrContext, instContext, beefContext; // Audio contexts
let audioLoaded = false; // Track whether audio has been loaded
let audioPlaying = false;

// Declare gainNode globally
let gainNodeMaster;
let filterNodeGtr

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  
  // Initialize draggable circles
  c7 = new DraggableCircle(canvasWidth * 0, canvasHeight * 0.55, 20, 4 * perspective, 0);
  c1 = new DraggableCircle(canvasWidth * 0.57, canvasHeight * 0.67, 20, 6 * perspective, 0);
  c2 = new DraggableCircle(canvasWidth * 0.75, canvasHeight * 0.53, 20, 4 * perspective, 0);
  c6 = new DraggableCircle(canvasWidth * 1.35, canvasHeight * 0.5, 20, 6 * perspective, 0);
  c3 = new DraggableCircle(canvasWidth, canvasHeight * 0.47, 20, 3 * perspective, 0);
  c4 = new DraggableCircle(canvasWidth * 0.33, canvasHeight * 0.53, 20, 3 * perspective, 0);
  c5 = new DraggableCircle(canvasWidth * 0.25, canvasHeight * 0.73, 20, 1 * perspective, canvasHeight/2);
}

function draw() {
  background(100);
  strokeWeight(0);

  // Draw quads
  drawRectangles();
  drawTriangles();

  if (!audioPlaying) {
    drawPlayButton();
  }

  // Play audio if the button is pressed
  if (clickPlayButton()) {
    loadAudio();
    gtr.play();
    // inst.play();
    // beef.play();
    audioPlaying = true;
  }

  // Update gain node dynamically based on c5's Y position
  if (audioLoaded) {
    updateGainBasedOnY(c5, gainNodeMaster, 2, 0);
    updateFilterBasedOnY(c6, filterNodeGtr, 20000,0)

  }
}




function drawPlayButton() {
  rectMode(CENTER);
  
  // Change color if hovering over the button
  if (mouseX < width / 2 + width / 12 &&
      mouseX > width / 2 - width / 12 &&
      mouseY < height / 2 + height / 12 &&
      mouseY > height / 2 - height / 12) {
    fill(39, 3, 3); // Hover color
  } else {
    fill(100, 150, 255); // Default color
  }
  
  stroke(0);
  rect(canvasWidth / 2, canvasHeight / 2, canvasWidth / 6, canvasHeight / 6, 20);

  fill(0, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(100);
  text('play', canvasWidth / 2, canvasHeight / 2);
}

function clickPlayButton() {
  // Check if play button was clicked
  if (mouseX < width / 2 + width / 12 &&
      mouseX > width / 2 - width / 12 &&
      mouseY < height / 2 + height / 12 &&
      mouseY > height / 2 - height / 12 &&
      mouseIsPressed) {
    loadAudio(); // Load audio when the button is clicked
    return true; // Return true if the mouse is pressed
  }
  
  return false; // Return false if conditions are not met
}

function loadAudio() {
  // Only load audio once
  if (!audioLoaded) {
    audiocontext = new AudioContext();

    gtr = new Audio("gtr.mp3");
    inst = new Audio("inst.mp3");
    beef = new Audio("beef.mp3");

    // Create media element sources
    gtrSrc = audiocontext.createMediaElementSource(gtr);
    instSrc = audiocontext.createMediaElementSource(inst);
    beefSrc = audiocontext.createMediaElementSource(beef);

    // Initialize global gainNode
    gainNodeMaster = new GainNode(audiocontext, {
      gain: 1, // Default gain value
    });

    filterNodeGtr = new BiquadFilterNode( audiocontext, {type: "lowpass",
       Q :1,
       detune : 0,
      frequency : 350
      }   )

    // Connect the source to the gainNode and the gainNode to the destination
    gtrSrc.connect(filterNodeGtr);
    
    filterNodeGtr.connect(gainNodeMaster);
    instSrc.connect(gainNodeMaster);
    beefSrc.connect(gainNodeMaster);

    gainNodeMaster.connect(audiocontext.destination);


    // Set audio loaded to true
    audioLoaded = true;
    console.log("Audio loaded.");
  }
}

function updateFilterBasedOnY(circle, filterNode, max, min) {
  // Normalize the y value to a range between 0 and 1
  const maxY = canvasHeight; // Assuming your canvas height is the max value for y
  const minY = circle.getMinY();            // Assuming the minimum y is 0
  
  // Map the y position of the circle to a gain value between 0 and 1
  normalizedY = map(circle.getY(), minY, maxY, -1, 1);

  if (normalizedY <= 0) {
    normalizedY = 0-44.51*Math.pow(Math.E,6.11*Math.abs(normalizedY))-44.51;
  } else {
    normalizedY = 44.51*Math.pow(Math.E,-6.11*(Math.abs(normalizedY)-1))-44.51;
  }

  
  
  if (normalizedY > -0.05 && normalizedY < 0.05 ) {
    filterNode.type = "peaking";
  } else if (normalizedY <= -0.05) {
    filterNode.type = "highpass";
    filterNode.frequency.value = Math.abs(normalizedY);
  } else if (normalizedY >= 0.05) {
    filterNode.type = "lowpass";
    filterNode.frequency.value = normalizedY;
    console.log(filterNode.frequency);
  }
  
  // Optional: Log the current gain and y position
  console.log("Y Position:", circle.getY(), "NormalisedY:",  normalizedY,"Filter Frequency:", filterNode.frequency.value, "Filter Ty[e]:", filterNode.type);
}

function updateGainBasedOnY(circle, gainNode, max, min) {
  // Normalize the y value to a range between 0 and 1
  const maxY = canvasHeight; // Assuming your canvas height is the max value for y
  const minY = circle.getMinY();            // Assuming the minimum y is 0
  
  // Map the y position of the circle to a gain value between 0 and 1
  const normalizedY = map(circle.getY(), minY, maxY, max, min);
  
  // Set the gain value
  gainNode.gain.value = normalizedY;
  
  // Optional: Log the current gain and y position
  console.log("Y Position:", circle.getY(), "Gain Value:", gainNode.gain.value);
}

function mouseClicked() {
  // Check if play button was clicked
  if (mouseX > width / 2 - width / 12 &&
      mouseX < width / 2 + width / 12 &&
      mouseY > height / 2 - height / 12 &&
      mouseY < height / 2 + height / 12
  ) {
    loadAudio(); // Load audio when the button is clicked
  }
}

function drawRectangles() {
  fill(255, 249, 201);
  quad(0, 0, canvasWidth, 0, canvasWidth, canvasHeight, 0, canvasHeight);

  fill(255, 212, 151);
  quad(
    0 - (Math.abs(mouseX * 2 / factor)), canvasHeight * 0.13,
    canvasWidth + (Math.abs(mouseX * 2 / factor)), canvasHeight * 0.2,
    canvasWidth, canvasHeight,
    0, canvasHeight
  );

  fill(251, 165, 139);
  quad(
    0 - (Math.abs(mouseX * 3 / factor)), canvasHeight * 0.37,
    canvasWidth + (Math.abs(mouseX * 3 / factor)), canvasHeight * 0.33,
    canvasWidth, canvasHeight,
    0, canvasHeight
  );

  fill(251, 145, 143);
  quad(
    0 - (Math.abs(mouseX * 4 / factor)), canvasHeight * 0.57,
    canvasWidth + (Math.abs(mouseX * 4 / factor)), canvasHeight * 0.53,
    canvasWidth, canvasHeight,
    0, canvasHeight
  );
}

function drawTriangles() {
  // Draw triangles
  fill(73, 73, 75);
  triangle(
    canvasWidth * 0.22 - (mouseX * c1.getMoveFactor() / factor), canvasHeight,
    c1.getX(), c1.y,
    canvasWidth * 0.9 - (mouseX * c1.getMoveFactor() / factor), canvasHeight
  );

  fill(73, 73, 75);
  triangle(
    canvasWidth * 0.8 - (mouseX * c6.getMoveFactor() / factor), canvasHeight,
    c6.getX(), c6.y,
    canvasWidth * 1.6 - (mouseX * c6.getMoveFactor() / factor), canvasHeight
  );

  fill(114, 118, 123);
  triangle(
    canvasWidth * -0.4 - (mouseX * c7.getMoveFactor() / factor), canvasHeight,
    c7.getX(), c7.y,
    canvasWidth * 0.4 - (mouseX * c7.getMoveFactor() / factor), canvasHeight
  );

  fill(114, 118, 123);
  triangle(
    canvasWidth * 0.5 - (mouseX * c2.getMoveFactor() / factor), canvasHeight,
    c2.getX(), c2.y,
    canvasWidth - (mouseX * c2.getMoveFactor() / factor), canvasHeight
  );

  fill(130, 134, 138);
  triangle(
    canvasWidth * 0.58 - (mouseX * c3.getMoveFactor() / factor), canvasHeight,
    c3.getX(), c3.y,
    canvasWidth * 1.25 - (mouseX * c3.getMoveFactor() / factor), canvasHeight
  );

  fill(130, 134, 138);
  triangle(
    canvasWidth * -0.17 - (mouseX * c4.getMoveFactor() / factor), canvasHeight,
    c4.getX(), c4.y,
    canvasWidth * 0.67 - (mouseX * c4.getMoveFactor() / factor), canvasHeight
  );

  fill(166, 169, 172);
  triangle(
    canvasWidth * -0.08 - (mouseX * c5.getMoveFactor() / factor), canvasHeight,
    c5.getX(), c5.y,
    canvasWidth * 0.55 - (mouseX * c5.getMoveFactor() / factor), canvasHeight
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
  constructor(x, y, r, moveFactor,minY) {
    this.initialX = x;
    this.x = x;
    this.y = y;
    this.r = r;
    this.dragging = false;
    this.offsetY = 0;
    this.hovered = false;
    this.moveFactor = moveFactor;
    this.finalY = y;
    this.minY = minY;
  }

  getMinY() {
    return this.minY;
  }

getFinalY() {
  return this.finalY;
}

  getMoveFactor() {
    return this.moveFactor;
  }

  getX() {
    return this.x - (mouseX * this.moveFactor / factor);
  }

  getY() {
    return this.y;
  }

  getSliderY() {
    return this.y/(canvasHeight - this.r * 2-this.r * 4);
  }

  getDragging() {
    return this.dragging;
  }

  display() {
    stroke(0);
    if (this.dragging || this.hovered) {
      fill(255, 249, 201, 128);
      ellipse(this.getX(), this.y, this.r * 2);
    } 
  }

  hover(px, py) {
    let d = dist(px, py, this.getX(), this.y);
    this.hovered = d < this.r;

    if (this.dragging) {
      this.y = constrain(lerp(this.y, py, 0.1), this.minY, canvasHeight - this.r * 2);
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