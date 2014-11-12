'use strict';

// Add Canvas to demo element
var container = document.getElementById('particles-demo-container');
var canvas = container.appendChild(document.createElement('canvas'));
var ctx = canvas.getContext('2d');
canvas.width = container.clientWidth;
canvas.height = 0.66 * canvas.width;
function getMousePosition(e) {
  var bbox = canvas.getBoundingClientRect();
  return {
    x: e.clientX - bbox.left * (canvas.width / bbox.width),
    y: e.clientY - bbox.top * (canvas.height / bbox.height)
  };
}
var selectedObj, dragStart;
canvas.onmousedown = function (e) {
  var pos = getMousePosition(e);
  var obj = world.select(pos.x, pos.y);
  if (obj) {
    selectedObj = obj[0];
    dragStart = new Vector(pos.x, pos.y);
  }
  console.log(obj);
};
canvas.onmousemove = function (e) {
  if (!selectedObj) {
    return;
  }
  var pos = getMousePosition(e);
  var diff = dragStart.add(pos);
  dragStart = new Vector(pos.x, pos.y);
  selectedObj.position = new Vector(pos.x / canvas.width, pos.y / canvas.height);
};
canvas.onmouseup = function (e) {
  selectedObj = void 0;
};
canvas.onmouseout = function (e) {
  selectedObj = void 0;
};

var clear = function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

var update = function update() {
  world.generateParticles();
  world.update(0.01);
};

function drawCircle(obj) {
  ctx.fillStyle = obj.fill;
  ctx.beginPath();
  ctx.arc(obj.position.x * canvas.width, obj.position.y * canvas.height, obj.radius, 0, 6.28);
  ctx.closePath();
  ctx.fill();
}
var render = function render() {
  world.particles.forEach(drawCircle);
  world.emitters.forEach(drawCircle);
  world.fields.forEach(drawCircle);
};

var loop = function loop() {
  clear();
  update();
  render();
  window.requestAnimationFrame(loop);
};

var World = function (emitters, fields) {
  this.particles = [];
  this.emitters = emitters || [];
  this.fields = fields || [];

  this.shapes = this.emitters.concat(this.fields);

  this.maxParticles = 500;
};

World.prototype.generateParticles = function () {
  if (this.particles.length > this.maxParticles) {
    return;
  }
  this.emitters.forEach(function (emitter) {
    this.particles.push(emitter.emit());
  }.bind(this));
};

World.prototype.update = function (delta) {
  var pos;
  var aliveParticles = this.particles.filter(function (particle) {
    particle.applyFields(world.fields);
    particle.integrate(delta);
    pos = particle.position;
    return (pos.x < 0 || pos.x > canvas.width || pos.y < 0 || pos.y > canvas.height) ? false : true;
  });
  this.particles = aliveParticles;
};

World.prototype.select = function (x, y) {
  var v = new Vector(x / canvas.width, y / canvas.height);
  return this.shapes.filter(function (s) {
    return s.position.sub(v).length() <= s.radius / canvas.width;
  });
};



var Particle = function (position, velocity, acceleration) {
  this.position = position || new Vector(0, 0);
  this.velocity = velocity || new Vector(0, 0);
  this.acceleration = acceleration || new Vector(0, 0);
  this.radius = 2;
  this.fill = 'black';
};

Particle.prototype.integrate = function (delta) {
  this.velocity.iadd(this.acceleration.mul(delta * 0.5));
  this.position.iadd(this.velocity.mul(delta));
  //this.acceleration.zero();
};
Particle.prototype.applyFields = function (fields) {
  var aX = 0, aY = 0;
  var vX, vY, force;

  fields.forEach(function (f) {
    vX = f.position.x - this.position.x;
    vY = f.position.y - this.position.y;

    force = f.mass / Math.pow(vX*vX + vY*vY, 1/2);
    aX += vX * force;
    aY += vY * force;
  }.bind(this));
  this.acceleration = new Vector(aX, aY);
};


var Emitter = function (position, velocity, sigma) {
  this.position = position;
  this.velocity = velocity;
  this.sigma = sigma || Math.PI / 16;
  this.radius = 10;
  this.fill = '#9A9';
};

Emitter.prototype.emit = function () {
  var angle = this.velocity.angle() + this.sigma * (1 - (Math.random() * 2));
  var length = this.velocity.length();
  var position = this.position.clone();
  var velocity = Vector.fromAngle(angle, length);
  return new Particle(position, velocity);
};

var Field = function (position, mass) {
  this.position = position;
  this.setMass(mass);
  this.radius = 10;
};
Field.prototype.setMass = function (mass) {
  this.mass = mass || 1;
  this.fill = mass < 0 ? '#f00' : '#0f0';
};
var fields = [new Field(new Vector(0.5, 0.5), -0.1), new Field(new Vector(0.5, 0.15), 0.25)];
var emitters = [new Emitter(new Vector(0.25, 0.45), Vector.fromAngle(Math.PI / 4, 0.15), Math.PI / 16)];
var world = new World(emitters, fields);
loop();
