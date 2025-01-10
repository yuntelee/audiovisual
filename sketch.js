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
let filterNodeBeef;
let limiterNodeMaster;
let gainNodeBeef;
let gainNodeGtr;
let gainNodeInst;
let convolverNodeMaster;

let chrousNodeMaster;
let chorusDryNodeMaster;
let chorusWetNodeMaster;

let fadeInNode;

let customFont;

// Add these variables at the top with other global variables
let buttonOpacity = 255; // For button fade
let buttonColor = [100, 150, 255]; // Default color
let targetColor = [100, 150, 255]; // Target color for transitions
let colorLerpAmount = 0; // For smooth color transitions

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  
  // Initialize draggable circles with accurate labels
  c7 = new DraggableCircle(canvasWidth * 0.05, canvasHeight * 0.7, 20, 4 * perspective, 0, "Reverb Mix");
  c1 = new DraggableCircle(canvasWidth * 0.57, canvasHeight * 0.67, 20, 6 * perspective, 0, "Drum and Bass Volume");
  c2 = new DraggableCircle(canvasWidth * 0.75, canvasHeight * 0.53, 20, 4 * perspective, 0, "Guitar Volume");
  c6 = new DraggableCircle(canvasWidth * 1.35, canvasHeight * 0.5, 20, 6 * perspective, 0, "Master Filter");
  c3 = new DraggableCircle(canvasWidth, canvasHeight * 0.47, 20, 3 * perspective, 0, "Drum and Bass Filter");
  c4 = new DraggableCircle(canvasWidth * 0.33, canvasHeight * 0.53, 20, 3 * perspective, 0, "Instrument Volume");
  c5 = new DraggableCircle(canvasWidth * 0.25, canvasHeight * 0.73, 20, 1 * perspective, canvasHeight/2, "Master Volume");
}

function draw() {
  background(100);
  strokeWeight(0);

  drawRectangles();
  drawTriangles();

  // Always draw button if it's still visible
  if (!audioPlaying || buttonOpacity > 0.1) {
    drawPlayButton();
  }

  // Play audio if the button is pressed
  if (clickPlayButton()) {
    if (!audioLoaded) {
      loadAudio();
    }
    if (audioLoaded && !audioPlaying) {
      startAudioWithFade();
      audioPlaying = true;  // Set this immediately when clicked
    }
  }

  // Update audio parameters
  if (audioLoaded) {
    updateGainBasedOnY(c5, gainNodeMaster, 0.5, 0);
    updateGainBasedOnY(c2, gainNodeGtr, 5, 0);
    updateGainBasedOnY(c1, gainNodeBeef, 5, 0);
    updateGainBasedOnY(c4, gainNodeInst, 5, 0);
    updateFilterBasedOnY(c6, filterNodeMaster, 20000, 0);
    updateFilterBasedOnY(c3, filterNodeBeef, 20000, 0);
    if (convolverNodeMaster) {
      updateConvolverBasedOnY(c7, 1, 0);
    }
  }
}




function drawPlayButton() {
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  
  // Update button opacity when audio is playing
  if (audioPlaying) {
    buttonOpacity = lerp(buttonOpacity, 0, 0.1);
  }
  
  // Handle hover state and color transitions
  if (mouseX < width / 2 + width / 12 &&
      mouseX > width / 2 - width / 12 &&
      mouseY < height / 2 + height / 12 &&
      mouseY > height / 2 - height / 12) {
    targetColor = [199, 199, 199];
  } else {
    targetColor = [240, 240, 240];
  }
  
  // Smooth color transition
  buttonColor[0] = lerp(buttonColor[0], targetColor[0], 0.4);
  buttonColor[1] = lerp(buttonColor[1], targetColor[1], 0.4);
  buttonColor[2] = lerp(buttonColor[2], targetColor[2], 0.4);
  
  stroke(0, buttonOpacity);
  fill(buttonColor[0], buttonColor[1], buttonColor[2], buttonOpacity);
  rect(canvasWidth / 2, canvasHeight / 2, canvasWidth / 6, canvasHeight / 6, 20);

  fill(50, buttonOpacity);
  textFont('Didact Gothic');
  textStyle(NORMAL);
  textSize(65);
  text('Play', canvasWidth / 2, canvasHeight / 2);
  textSize(25);
  text('Drag the peak of the mountains to change the sound.\nHeadphones are recommended.', canvasWidth / 2, canvasHeight / 1/4);

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

      gainNodeGtr = audiocontext.createGain();
      gainNodeGtr.gain.value = 1;

      gainNodeInst = audiocontext.createGain();
      gainNodeInst.gain.value = 1;

      beefSrc.connect(gainNodeBeef);
      gtrSrc.connect(gainNodeGtr);
      instSrc.connect(gainNodeInst);

      gainNodeMaster = audiocontext.createGain();
      gainNodeMaster.gain.value = 1;

      filterNodeMaster = audiocontext.createBiquadFilter();
      filterNodeMaster.type = "lowpass";
      filterNodeMaster.Q.value = 1;
      filterNodeMaster.detune.value = 0;
      filterNodeMaster.frequency.value = 350;

      filterNodeBeef = audiocontext.createBiquadFilter();
      gainNodeBeef.connect(filterNodeBeef);
      filterNodeBeef.connect(filterNodeMaster);

      // Basic routing
      // gtrSrc.connect(filterNodeMaster);
      // instSrc.connect(filterNodeMaster);
      gainNodeInst.connect(filterNodeMaster);
      gainNodeGtr.connect(filterNodeMaster);
      
      filterNodeMaster.connect(gainNodeMaster);
      gainNodeInst.connect(gainNodeMaster);
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


      // Add inside loadAudio() function, after creating other nodes but before final connections
      try {
        // Create convolver node
        convolverNodeMaster = audiocontext.createConvolver();
        
        // Create wet/dry controls for convolver
        convolverDryNodeMaster = audiocontext.createGain();
        convolverWetNodeMaster = audiocontext.createGain();
        
        // Set initial values
        convolverDryNodeMaster.gain.value = 1;
        convolverWetNodeMaster.gain.value = 0;

        // Load impulse response
        fetch('BOB.wav')
          .then(response => response.arrayBuffer())
          .then(buffer => audiocontext.decodeAudioData(buffer))
          .then(decodedData => {
            convolverNodeMaster.buffer = decodedData;
            
            // Connect convolver chain
            gainNodeMaster.connect(convolverNodeMaster);
            gainNodeMaster.connect(convolverDryNodeMaster);
            convolverNodeMaster.connect(convolverWetNodeMaster);
            convolverWetNodeMaster.connect(limiterNodeMaster);
            convolverDryNodeMaster.connect(limiterNodeMaster);
          })
          .catch(error => {
            console.warn('Convolver initialization failed:', error);
            gainNodeMaster.connect(limiterNodeMaster);
          });
      } catch (error) {
        console.warn('Convolver setup failed:', error);
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

function updateConvolverBasedOnY(circle, max, min) {
  // Normalize the y value to a range between 0 and 1
  const maxY = canvasHeight;
  const minY = circle.getMinY();
  
  // Map the y position to wet/dry mix
  const normalizedY = map(circle.getY(), minY, maxY, max, min);
  
  // Update wet/dry mix
  convolverWetNodeMaster.gain.value = normalizedY;
  convolverDryNodeMaster.gain.value = 1 - normalizedY;
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
  // Soft purple
  fill(142, 114, 181);
  quad(0, 0, canvasWidth, 0, canvasWidth, canvasHeight, 0, canvasHeight);

  // Soft peach
  fill(238, 139, 133);
  quad(
    0 - (Math.abs(mouseX * 2 / factor)), canvasHeight * 0.05,
    canvasWidth + (Math.abs(mouseX * 2 / factor)), canvasHeight * 0.08,
    canvasWidth, canvasHeight,
    0, canvasHeight
  );

  // Soft orange
  fill(246, 171, 125);
  quad(
    0 - (Math.abs(mouseX * 3 / factor)), canvasHeight * 0.25,
    canvasWidth + (Math.abs(mouseX * 3 / factor)), canvasHeight * 0.22,
    canvasWidth, canvasHeight,
    0, canvasHeight
  );

  // Soft yellow-orange
  fill(248, 208, 143);
  quad(
    0 - (Math.abs(mouseX * 4 / factor)), canvasHeight * 0.40,
    canvasWidth + (Math.abs(mouseX * 4 / factor)), canvasHeight * 0.42,
    canvasWidth, canvasHeight,
    0, canvasHeight
  );

  // Soft yellow
  fill(252, 242, 165);
  quad(
    0 - (Math.abs(mouseX * 4 / factor)), canvasHeight * 0.60,
    canvasWidth + (Math.abs(mouseX * 4 / factor)), canvasHeight * 0.57,
    canvasWidth, canvasHeight,
    0, canvasHeight
  );
  
  
}




function drawTriangles() {
  // Draw triangles
  fill(65, 66, 66);
  triangle(
    canvasWidth * 0.22 - (mouseX * c1.getMoveFactor() / factor), canvasHeight,
    c1.getX(), c1.y,
    canvasWidth * 0.9 - (mouseX * c1.getMoveFactor() / factor), canvasHeight
  );

  fill(72, 82, 82);
  triangle(
    canvasWidth * 0.8 - (mouseX * c6.getMoveFactor() / factor), canvasHeight,
    c6.getX(), c6.y,
    canvasWidth * 1.6 - (mouseX * c6.getMoveFactor() / factor), canvasHeight
  );

  fill(89, 92, 92);
  triangle(
    canvasWidth * -0.4 - (mouseX * c7.getMoveFactor() / factor), canvasHeight,
    c7.getX(), c7.y,
    canvasWidth * 0.4 - (mouseX * c7.getMoveFactor() / factor), canvasHeight
  );

  fill(116, 130, 130);
  triangle(
    canvasWidth * 0.5 - (mouseX * c2.getMoveFactor() / factor), canvasHeight,
    c2.getX(), c2.y,
    canvasWidth - (mouseX * c2.getMoveFactor() / factor), canvasHeight
  );

  fill(134, 138, 138);
  triangle(
    canvasWidth * 0.58 - (mouseX * c3.getMoveFactor() / factor), canvasHeight,
    c3.getX(), c3.y,
    canvasWidth * 1.25 - (mouseX * c3.getMoveFactor() / factor), canvasHeight
  );

  fill(148, 161, 161);
  triangle(
    canvasWidth * -0.17 - (mouseX * c4.getMoveFactor() / factor), canvasHeight,
    c4.getX(), c4.y,
    canvasWidth * 0.67 - (mouseX * c4.getMoveFactor() / factor), canvasHeight
  );

  fill(161, 181, 181);
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
      fill(40, this.opacity * 255);
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

function startAudioWithFade() {
  const fadeTime = 3.0; // 3 second fade
  
  // Create fade-in node if it doesn't exist
  fadeInNode = audiocontext.createGain();
  fadeInNode.gain.value = 0;
  
  // Connect fadeInNode in the chain before destination
  limiterNodeMaster.disconnect();
  limiterNodeMaster.connect(fadeInNode);
  fadeInNode.connect(audiocontext.destination);
  
  // Schedule the fade
  const currentTime = audiocontext.currentTime;
  fadeInNode.gain.setValueAtTime(0, currentTime);
  fadeInNode.gain.linearRampToValueAtTime(1, currentTime + fadeTime);
  
  // Start playing all tracks
  Promise.all([
    gtr.play().catch(e => console.error('Error playing gtr:', e)),
    inst.play().catch(e => console.error('Error playing inst:', e)),
    beef.play().catch(e => console.error('Error playing beef:', e))
  ]).then(() => {
    audioPlaying = true;
  });
}
