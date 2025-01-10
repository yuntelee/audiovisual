let canvasWidth = screen.availWidth;
let canvasHeight = screen.availHeight;

let perspective = screen.availWidth / 600;
let factor = canvasWidth / 50;
let c1, c2, c3, c4, c5, c6, c7;

let gtr, inst, beef; // Audio elements
let gtrSrc, instSrc, beefSrc; // Media element sources
let gtrContext, instContext, beefContext; // Audio contexts
let tuna;
let audioLoaded = false; // Track whether audio has been loaded
let audioPlaying = false;

// Declare gainNode globally
let gainNodeMaster;
let filterNodeGtr
let limiterNodeMaster;
let gainNodeBeef;
let convolverNodeMaster;

let chrousNodeMaster;
let chorusDryNodeMaster;
let chorusWetNodeMaster;


function setup() {
  createCanvas(canvasWidth, canvasHeight);
  
  // Initialize draggable circles with labels
  c7 = new DraggableCircle(canvasWidth * 0.05, canvasHeight * 0.55, 20, 4 * perspective, 0, "Reverb Mix");
  c1 = new DraggableCircle(canvasWidth * 0.57, canvasHeight * 0.67, 20, 6 * perspective, 0, "Drums and Bass Volume");
  c2 = new DraggableCircle(canvasWidth * 0.75, canvasHeight * 0.53, 20, 4 * perspective, 0, "Delay Time");
  c6 = new DraggableCircle(canvasWidth * 1.35, canvasHeight * 0.5, 20, 6 * perspective, 0, "Filter Cutoff");
  c3 = new DraggableCircle(canvasWidth, canvasHeight * 0.47, 20, 3 * perspective, 0, "Chorus Mix");
  c4 = new DraggableCircle(canvasWidth * 0.33, canvasHeight * 0.53, 20, 3 * perspective, 0, "Delay Feedback");
  c5 = new DraggableCircle(canvasWidth * 0.25, canvasHeight * 0.73, 20, 1 * perspective, canvasHeight/2, "Master Volume");
}

function draw() {
  background(100);
  strokeWeight(0);

  drawRectangles();
  drawTriangles();

  if (!audioPlaying) {
    drawPlayButton();
  }

  // Play audio if the button is pressed
  if (clickPlayButton()) {
    if (!audioLoaded) {
      loadAudio();
    }
    if (audioLoaded) {
      Promise.all([
        gtr.play().catch(e => console.error('Error playing gtr:', e)),
        inst.play().catch(e => console.error('Error playing inst:', e)),
        beef.play().catch(e => console.error('Error playing beef:', e))
      ]).then(() => {
        audioPlaying = true;
      });
    }
  }

  // Update audio parameters
  if (audioLoaded) {
    updateGainBasedOnY(c5, gainNodeMaster, 2, 0);
    updateGainBasedOnY(c1, gainNodeBeef, 5, 0);
    updateFilterBasedOnY(c6, filterNodeGtr, 20000, 0);
    if (chrousNodeMaster) {
      updateChorusBasedonY(c3, chrousNodeMaster, 1, 0);
    }
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
  if (!audioLoaded) {
    try {
      audiocontext = new AudioContext();

      gtr = new Audio("gtr.mp3");
      inst = new Audio("inst.mp3");
      beef = new Audio("beef.mp3");

      // Create media element sources
      gtrSrc = audiocontext.createMediaElementSource(gtr);
      instSrc = audiocontext.createMediaElementSource(inst);
      beefSrc = audiocontext.createMediaElementSource(beef);

      gainNodeBeef = audiocontext.createGain();
      gainNodeBeef.gain.value = 1;

      beefSrc.connect(gainNodeBeef);

      gainNodeMaster = audiocontext.createGain();
      gainNodeMaster.gain.value = 1;

      filterNodeGtr = audiocontext.createBiquadFilter();
      filterNodeGtr.type = "lowpass";
      filterNodeGtr.Q.value = 1;
      filterNodeGtr.detune.value = 0;
      filterNodeGtr.frequency.value = 350;

      // Basic routing
      gtrSrc.connect(filterNodeGtr);
      instSrc.connect(filterNodeGtr);
      gainNodeBeef.connect(filterNodeGtr);
      filterNodeGtr.connect(gainNodeMaster);

      limiterNodeMaster = audiocontext.createDynamicsCompressor();
      limiterNodeMaster.attack.value = 0.003;
      limiterNodeMaster.threshold.value = -4;

      try {
        chrousNodeMaster = new Macro_ChorusNode(audiocontext, {
          rate: 7,
          depth: 0.5,
          effect: true
        });

        chorusDryNodeMaster = audiocontext.createGain();
        chorusWetNodeMaster = audiocontext.createGain();

        chorusDryNodeMaster.gain.value = 1;
        chorusWetNodeMaster.gain.value = 0;

        // Connect chorus chain
        gainNodeMaster.connect(chrousNodeMaster);
        gainNodeMaster.connect(chorusDryNodeMaster);
        chrousNodeMaster.connect(chorusWetNodeMaster);
        chorusWetNodeMaster.connect(limiterNodeMaster);
        chorusDryNodeMaster.connect(limiterNodeMaster);
      } catch (error) {
        console.warn('Chorus initialization failed:', error);
        gainNodeMaster.connect(limiterNodeMaster);
      }

      limiterNodeMaster.connect(audiocontext.destination);
      audioLoaded = true;
      console.log("Audio loaded successfully");
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }
}

function updateChorusBasedonY(circle, filterNode, max, min) {
  // Normalize the y value to a range between 0 and 1
  const maxY = canvasHeight; // Assuming your canvas height is the max value for y
  const minY = circle.getMinY();            // Assuming the minimum y is 0
  
  // Map the y position of the circle to a gain value between 0 and 1
  normalizedY = map(circle.getY(), minY, maxY, 0, 1);
       // Assuming the minimum y is 0  
  // Map the y position of the circle to a gain value between 0 and 1
  const normalizedY = map(circle.getY(), minY, maxY, max, min);
  
  // Set the gain value
  chrousWetNodeMaster.gain = 1-normalizedY;
  chrousDryNodeMaster.gain = normalizedY;
  
  // Optional: Log the current gain and y position
  console.log("Y Position:", circle.getY(), "Gain Value:", gainNode.gain.value);
  
  // Optional: Log the current gain and y position
  console.log("Y Position:", circle.getY(), "NormalisedY:",  normalizedY,"Filter Frequency:", filterNode.frequency.value, "Filter Ty[e]:", filterNode.type);
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
  c7.display();
  c7.hover(mouseX, mouseY);
}

class DraggableCircle {
  constructor(x, y, r, moveFactor, minY, label) {
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
    // Add opacity property for fading
    this.opacity = 0;
    this.targetOpacity = 0;
    this.fadeSpeed = 0.1; // Controls fade speed (0.05 = ~1 second)
    this.label = label;  // Add label property
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
    // Update opacity with smooth transition
    this.opacity = lerp(this.opacity, this.targetOpacity, this.fadeSpeed);
    
    stroke(0, this.opacity * 255);
    if (this.dragging || this.hovered) {
      this.targetOpacity = 1;
      fill(255, 249, 201, this.opacity * 128);
      ellipse(this.getX(), this.y, this.r * 2);
      
      // Draw text label
      noStroke();
      fill(0, this.opacity * 255);
      textAlign(CENTER, BOTTOM);
      textSize(16);
      text(this.label, this.getX(), this.y - this.r - 5);
    } else {
      this.targetOpacity = 0;
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
  c7.pressed(mouseX, mouseY);
}

function mouseReleased() {
  c1.released();
  c2.released();
  c3.released();
  c4.released();
  c5.released();
  c6.released(); 
  c7.released();
}