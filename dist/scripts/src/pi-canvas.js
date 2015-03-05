class PiCanvas {
  constructor(id) {
    this.id = id;
    this.method = 'random';

    this.$div = document.getElementById(this.id);
    this.$output = this.$div.appendChild(document.createElement('div'));
    this.$canvas = this.$div.appendChild(document.createElement('canvas'));
    this.ctx = this.$canvas.getContext('2d');

    this.$canvas.width = 500;
    this.$canvas.height = 500;

    this.reset();

  }
  changeMethod(method) {
    this.reset();
    this.method = method;
  }

  reset() {
    this.hitCount = 0;
    this.totalCount = 0;
    this.testPoints = [];
    this.update();
  }

  drawOutline() {
    let ctx = this.ctx;


    ctx.strokeStyle = 'black';
    ctx.font = '10pt Arial';
    // Outer Square
    ctx.beginPath();
    ctx.rect(50, 50, 400, 400)
    ctx.closePath();
    ctx.stroke();
    // Inner Circle
    ctx.beginPath();
    ctx.arc(250, 250, 200, 0, 6.28, 0);
    ctx.closePath();
    ctx.stroke();
    // X-Axis
    ctx.beginPath();
    ctx.fillRect(0, 249, 500, 2);
    // X-Axis top label
    ctx.fillText('(0, 1)', 255, 35);
    // X-Axis bottom label
    ctx.fillText('(0, -1)', 255, 475);

    // Y-Axis left label
    ctx.fillText('(-1, 0)', 5, 235);
    // X-Axis bottom label
    ctx.fillText('(1, 0)', 460, 235);
    // Y-Axis
    ctx.beginPath();
    ctx.fillRect(249, 0, 2, 500);
  }

  drawPoint(p) {
    let x = ((p.x + 1) / 2) * 400 + 50
    let y = ((p.y + 1) / 2) * 400 + 50
    //let y = p.y * 400 + 450;
    //console.log(`x: ${x}; y: ${y}`);
    this.ctx.beginPath();
    this.ctx.arc(x, y, 2, 0, 6.28, 0);
    this.ctx.closePath();
    this.ctx.fill();
  }
  draw() {
    this.drawOutline();
    this.testPoints.forEach(p => {
      this.drawPoint(p);
    });
  }
  update() {
    this.ctx.clearRect(0, 0, 500, 500);
    this.draw();
    this.$output.innerHTML = 4 * (this.hitCount / this.totalCount);
  }

  addInstance(l) {
    if (this.method === 'random') {
      return this.addRandom(l);
    } else if (this.method === 'sequential') {
      return this.addMarkov(l);
    } else {
      console.warn('Invalid method selected');
    }
  }

  addRandom(l) {
    for (var i = 0; i < l; i++) {
      let x = 2 * Math.random() - 1;
      let y = 2 * Math.random() - 1;
      let p = {x:x, y:y};
      if (Math.sqrt(x * x + y * y) < 1) {
        this.hitCount++;
      }
      this.totalCount++;
      this.testPoints.push(p);
    }
    this.update();
    return 4 * (this.hitCount / this.totalCount);
  }
  addMarkov(l) {
    let x = this.x || 0.0;
    let y = this.y || 0.0;
    let delta = 0.1;
    for (var i = 0; i < l; i++) {
      let dx = 2 * delta * Math.random() - delta;
      let dy = 2 * delta * Math.random() - delta;
      if (Math.abs(x + dx) < 1.0 && Math.abs(y + dy) < 1) {
        x += dx;
        y += dy;
      }
      if (x*x + y*y < 1) {
        this.hitCount++;
      }
      this.totalCount++;
      this.testPoints.push({x: x, y: y});
    }
    this.x = x;
    this.y = y;
    this.update();
    return 4 * (this.hitCount / this.totalCount);
  }
}

let canvas = new PiCanvas('pi-demo-container');

canvas.update();
