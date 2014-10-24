'use strict';

// Add Canvas to demo element
var container = document.getElementById('particles-demo-container');
var canvas = container.appendChild(document.createElement('canvas'));
var ctx = canvas.getContext('2d');
canvas.width = container.clientWidth;
canvas.height = 0.66 * canvas.width;

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

var Vector = function (x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

Vector.prototype.add = function (v) {
  this.x += v.x;
  this.y += v.y;
  return this;
};
Vector.prototype.sqLength = function () {
  return (this.x * this.x + this.y * this.y);
};
Vector.prototype.length = function () {
  return Math.sqrt(this.sqLength());
};
Vector.prototype.angle = function () {
  return Math.atan2(this.y, this.x);
};
Vector.prototype.mul = function (s) {
  return new Vector(this.x * s, this.y * s);
};
Vector.prototype.clone = function () {
  return new Vector(this.x, this.y);
};
Vector.prototype.zero = function () {
  this.x = 0;
  this.y = 0;
  return this;
};
Vector.fromAngle = function (angle, distance) {
  return new Vector(distance * Math.cos(angle), distance * Math.sin(angle));
};
var World = function (emitters, fields) {
  this.particles = [];
  this.emitters = emitters || [];
  this.fields = fields || [];

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
    return (pos.x < 0 || pos.x > 1 || pos.y < 0 || pos.y > 1) ? false : true;
  });
  this.particles = aliveParticles;
};


var Particle = function (position, velocity, acceleration) {
  this.position = position || new Vector(0, 0);
  this.velocity = velocity || new Vector(0, 0);
  this.acceleration = acceleration || new Vector(0, 0);
  this.radius = 2;
  this.fill = 'black';
};

Particle.prototype.integrate = function (delta) {
  this.velocity.add(this.acceleration.mul(delta * 0.5));
  this.position.add(this.velocity.mul(delta));
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
