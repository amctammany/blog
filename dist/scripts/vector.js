'use strict';

var Vector = function (x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

Vector.prototype.add = function (v) {
  var x = this.x + v.x;
  var y = this.y + v.y;
  return new Vector(x, y);
};

Vector.prototype.iadd = function (v) {
  this.x += v.x;
  this.y += v.y;
  return this;
};
Vector.prototype.sub = function (v) {
  var x = this.x - v.x;
  var y = this.y - v.y;
  return new Vector(x, y);
};

Vector.prototype.isub = function (v) {
  this.x -= v.x;
  this.y -= v.y;
  return this;
};

Vector.prototype.mul = function (x, y) {
  y = y || x;
  this.x *= x;
  this.y *= y;
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


