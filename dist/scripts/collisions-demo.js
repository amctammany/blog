'use strict';

// Add Canvas to demo element
var collisionTable = document.getElementById('collision-listing');
var collisions = [];
Object.observe(collisions, function (change) {
  collisionTable.innerHTML = collisions.map(function (c) {
    return '<p>s1: ' + c.pair[0].uid + '; s2: ' + c.pair[1].uid + '; penetration: ' + c.penetration + '; </p>'
  }).join('\n');
});

var container = document.getElementById('collisions-demo-container');
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
  return false;
};
canvas.onmousemove = function (e) {
  if (!selectedObj) {
    return;
  }
  var pos = getMousePosition(e);
  var diff = dragStart.sub(new Vector(pos.x, pos.y));
  console.log(diff)
  dragStart = new Vector(pos.x, pos.y);
  selectedObj.move(diff.mul(-1));
  return false;
};
canvas.onmouseup = function (e) {
  selectedObj = void 0;
  return false;
};
canvas.onmouseout = function (e) {
  selectedObj = void 0;
  return false;
};
var clear = function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

var update = function update() {
  world.update(0.01);
  world.detectCollisions();
};
var render = function render() {
  world.shapes.forEach(function (s) {s.draw(ctx);});
};

var loop = function loop() {
  clear();
  update();
  render();
  window.requestAnimationFrame(loop);
};

var Shape = function () {
  this.fillStyle = '#FF0';
  this.strokeStyle = 'white';
};

Shape.prototype = {
  move: function (v) {
    throw 'move(v) not implemented';
  },
  createPath: function (ctx) {
    throw 'createPath(ctx) not implemented';
  },
  boundingBox: function () {
    throw 'boundingBox() not implemented';
  },
  fill: function (ctx) {
    ctx.save();
    ctx.fillStyle = this.fillStyle;
    this.createPath(ctx);
    ctx.fill();
    ctx.restore();
  },
  stroke: function (ctx) {
    ctx.save();
    ctx.strokeStyle = this.strokeStyle;
    this.createPath(ctx);
    ctx.stroke();
    ctx.restore();
  },
  text: function (ctx) {
    ctx.save();
    ctx.fillStyle = 'green';
    ctx.font = '12px Arial';
    ctx.fillText(this.uid, this.position.x - 6, this.position.y + 3);
    ctx.restore();
  },
  draw: function (ctx) {
    this.fill(ctx);
    this.stroke(ctx);
    this.text(ctx);
  },
  collidesWith: function (shape, displacement) {
    throw 'collidesWith(shape, displacement) not implemented';
  },
  isPointInPath: function (ctx, x, y) {
    this.createPath(ctx);
    return ctx.isPointInPath(x, y);
  },
  project: function (axis) {
    throw 'project(axis) not implemented';
  },
  minimumTranslationVector: function (axes, shape, displacement) {
    return getMTV(this, shape, displacement, axes);
  }
};

var Circle = function (x, y, radius) {
  this.position = (new Vector(x, y)).mul(canvas.width, canvas.height);
  this.radius = radius;
  this.fillStyle = 'black';
  this.strokeStyle = 'red';
};
Circle.prototype = Object.create(Shape.prototype);

Circle.prototype.centroid = function () {
};
Circle.prototype.move = function (v) {
  this.position.iadd(v);
};
Circle.prototype.createPath = function (ctx) {
  ctx.beginPath();
  ctx.arc(this.position.x, this.position.y, this.radius, 0, 6.28);
};
Circle.prototype.project = function (axis) {
  var scalars = [],
      dotProduct = this.position.dot(axis);
  scalars.push(dotProduct);
  scalars.push(dotProduct + this.radius);
  scalars.push(dotProduct - this.radius);

  return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
};

Circle.prototype.collidesWith = function (shape, displacement) {
  if (shape.radius === undefined) {
    return polygonCollidesWithCircle(shape, this, displacement);
  } else {
    return circleCollidesWithCircle(this, shape, displacement);
  }
};


var Polygon = function () {
  this.position = new Vector();
  this.points = [];
  this.strokeStyle = 'blue';
  this.fillStyle = 'red';
};
Polygon.prototype = Object.create(Shape.prototype);

Polygon.prototype.project = function (axis) {
  var scalars = [],
    v = new Vector();
  this.points.forEach( function (point) {
    v.x = point.x;
    v.y = point.y;
    scalars.push(v.dotProduct(axis));
  });
  return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
};
Polygon.prototype.getAxes = function () {
  var v1 = new Vector(),
      v2 = new Vector(),
      axes = [];

  for (var i = 0, l = this.points.length - 1; i < l; i++) {
    v1.x = this.points[i].x;
    v1.y = this.points[i].y;

    v2.x = this.points[i + 1].x;
    v2.y = this.points[i + 1].y;

    axes.push(v1.edge(v2).normal());
  }
  v1.x = this.points[this.points.length - 1].x;
  v1.y = this.points[this.points.length - 1].y;

  v2.x = this.points[0].x;
  v2.y = this.points[0].y;

  axes.push(v1.edge(v2).normal());
  return axes;
};
Polygon.prototype.project = function (axis) {
  var scalars = [],
      v = new Vector();

  this.points.forEach(function (p) {
    v.x = p.x;
    v.y = p.y;
    scalars.push(v.dotProduct(axis));
  });

  return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
};
Polygon.prototype.addPoint = function (x, y) {
  this.points.push((new Vector(x, y)).mul(canvas.width, canvas.height));
  this.getPosition();
};

//Polygon.prototype.draw = function (ctx) {
  //this.fill(ctx);
  //this.stroke(ctx);
//};
Polygon.prototype.getPosition = function () {
  var minX = Math.min.apply(Math, this.points.map(function (p) { return p.x; }))
  var maxX = Math.max.apply(Math, this.points.map(function (p) { return p.x; }))
  var dx = maxX - minX;
  var minY = Math.min.apply(Math, this.points.map(function (p) { return p.y; }))
  var maxY = Math.max.apply(Math, this.points.map(function (p) { return p.y; }))
  var dy = maxY - minY;
  this.position = new Vector((dx / 2) + minX, (dy / 2) + minY);
  this.radius = Math.max(dx, dy) / 2;
};
Polygon.prototype.createPath = function (ctx) {
  if (this.points.length === 0) {return;}

  ctx.beginPath();
  ctx.moveTo(this.points[0].x, this.points[0].y);

  for (var i = 0, l = this.points.length; i < l; ++i) {
    ctx.lineTo(this.points[i].x, this.points[i].y);
  }
  ctx.closePath();
};

Polygon.prototype.move = function (v) {
  console.log('polygon move');
  this.points.forEach(function (p) {
    p.iadd(v);
  });
  this.getPosition();
};
var World = function () {
  this.shapes = [];
  this.uid = -1;
};

World.prototype.addShape = function (shape) {
  shape.uid = ++this.uid;
  this.shapes.push(shape);
};
World.prototype.select = function (x, y) {
  var v = new Vector(x, y);
  return this.shapes.filter(function (s) {
    return s.position.sub(v).length() <= s.radius;
  });
};

World.prototype.update = function (delta) {

};

World.prototype.detectCollisions = function () {

  var shapes = world.shapes;
  collisions.length = 0;

  shapes.forEach(function (s1) {
    shapes.forEach(function (s2) {
      if (s1 === s2) { return; }
      var distance = s1.position.sub(s2.position).length();
      if (distance < (s1.radius + s2.radius)) {
        collisions.push({pair: [s1, s2], penetration: (s1.radius + s2.radius - distance) });
      }
    });
  });
  return collisions;

};


var c1 = new Circle(0.2, 0.2, 10);
var c2 = new Circle(0.3, 0.3, 20);
var polygon = new Polygon();
polygon.addPoint(0.1, 0.1);
polygon.addPoint(0.1, 0.2);
polygon.addPoint(0.2, 0.2);
polygon.addPoint(0.2, 0.1);

var world = new World();
world.addShape(polygon);
world.addShape(c1);
world.addShape(c2);

loop();
