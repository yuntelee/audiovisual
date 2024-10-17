class DraggableCircle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.dragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.hovered = false;
  }

  display() {
    stroke(0);
    if (this.hovered) {
      fill(200, 100, 100);
    } else {
      fill(100, 200, 100);
    }
    ellipse(this.x, this.y, this.r * 2);
  }

  hover(px, py) {
    let d = dist(px, py, this.x, this.y);
    this.hovered = d < this.r;

    if (this.dragging) {
      this.x = px + this.offsetX;
      this.y = py + this.offsetY;
    }
  }

  pressed(px, py) {
    let d = dist(px, py, this.x, this.y);
    if (d < this.r) {
      this.dragging = true;
      this.offsetX = this.x - px;
      this.offsetY = this.y - py;
    }
  }

  released() {
    this.dragging = false;
  }
}



function mousePressed() {
  circle.pressed(mouseX, mouseY);
}

function mouseReleased() {
  circle.released();
}