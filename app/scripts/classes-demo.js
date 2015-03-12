"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

function applyConfig(obj, config) {
  var priv = arguments[2] === undefined ? {} : arguments[2];

  Object.keys(config).forEach(function (key) {
    if (priv && priv.hasOwnProperty(key) && priv[key] instanceof Function) {
      priv[key].call(obj, config[key]);
    } else {
      obj[key] = config[key];
    }
  });
}

var Module = (function () {
  function Module(id, config) {
    var _this = this;

    var priv = arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, Module);

    this.id = id;
    this.config = config;
    this.behaviors = [];
    this.properties = [];

    priv.behaviors = priv.behaviors || function (arr) {
      arr.forEach(function (b) {
        return Behavior.find(b).applyTo(_this);
      });
      return _this.behaviors;
      //return arr.reduce((acc, b) => {
      //return acc.concat.apply(acc, Behavior.find(b).applyTo(this));
      //}, this.behaviors);
    };
    priv.properties = priv.properties || function (arr) {
      _this.addProperties(arr);
    };
    applyConfig(this, config, priv);
  }

  _prototypeProperties(Module, {
    load: {
      value: function load(config) {
        var _this = this;

        Object.keys(config).forEach(function (k) {
          _this.create(k, config[k]);
        });
      },
      writable: true,
      configurable: true
    },
    find: {
      value: function find(id) {
        return this._children[id];
      },
      writable: true,
      configurable: true
    },
    children: {
      value: function children() {
        var _this = this;

        return Object.keys(this._children).map(function (k) {
          return _this._children[k];
        });
      },
      writable: true,
      configurable: true
    },
    create: {
      value: function create(id, config) {
        this._children = this._children || {};
        this._children[id] = new this(id, config);
        return this._children[id];
      },
      writable: true,
      configurable: true
    }
  }, {
    addProperties: {
      value: function addProperties(props) {
        var _this = this;

        props.forEach(function (p) {
          if (_this.properties.indexOf(p) < 0) {
            _this.properties.push(p);
          }
        });
        return this.properties;
      },
      writable: true,
      configurable: true
    }
  });

  return Module;
})();

var Canvas = (function (Module) {
  function Canvas(id, config) {
    _classCallCheck(this, Canvas);

    this.canvas = document.body.appendChild(document.createElement("canvas"));
    this.ctx = this.canvas.getContext("2d");
    _get(Object.getPrototypeOf(Canvas.prototype), "constructor", this).call(this, id, config);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  _inherits(Canvas, Module);

  _prototypeProperties(Canvas, null, {
    update: {
      value: function update() {
        var _this = this;

        this.render();
        BodyType.children().forEach(function (t) {
          t.drawAll(_this.ctx);
        });
      },
      writable: true,
      configurable: true
    }
  });

  return Canvas;
})(Module);

function BodyFactory(parent, properties, methods) {
  var _body = function Body(config) {
    var _this = this;

    properties.forEach(function (p) {
      _this[p] = config[p] ? config[p] : parent[p];
    });
  };
  var proto = {};
  methods.forEach(function (m) {
    proto[m] = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      args.unshift(this);
      console.log(args);

      parent[m].apply(this, args);
    };
  });
  _body.prototype = Object.create(proto);
  return _body;
}

var BodyType = (function (Module) {
  function BodyType(id, config) {
    var _this = this;

    _classCallCheck(this, BodyType);

    this._children = [];
    _get(Object.getPrototypeOf(BodyType.prototype), "constructor", this).call(this, id, config, {});
    //this.ivars = this.properties.filter(p => {
    //return this.hasOwnProperty(p);
    //});
    var proto = {};
    this.methods.forEach(function (k) {
      proto[k] = _this[k];
    });
    this._body = BodyFactory(this, this.properties, this.methods);
  }

  _inherits(BodyType, Module);

  _prototypeProperties(BodyType, null, {
    get: {
      value: function get(body) {
        var _this = this;

        for (var _len = arguments.length, vars = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          vars[_key - 1] = arguments[_key];
        }

        return vars.map(function (v) {
          return body.hasOwnProperty(v) ? body[v] : _this[v];
        });
      },
      writable: true,
      configurable: true
    },
    children: {

      //addProperties(props) {
      //props.forEach(p => {
      //if (this.properties.indexOf(p) < 0) {
      //this.properties.push(p);
      //}
      //});
      //}

      value: function children() {
        return this._children;
      },
      writable: true,
      configurable: true
    },
    createBody: {
      value: function createBody(config) {
        var body = new this._body(config);
        this._children.push(body);
        return body;
      },
      writable: true,
      configurable: true
    },
    drawAll: {
      value: function drawAll(ctx) {
        var _this = this;

        this._children.forEach(function (b) {
          _this.render(b, ctx);
        });
      },
      writable: true,
      configurable: true
    }
  });

  return BodyType;
})(Module);

var Behavior = (function (Module) {
  function Behavior(id, config) {
    var _this = this;

    _classCallCheck(this, Behavior);

    this.methods = Object.keys(config);
    _get(Object.getPrototypeOf(Behavior.prototype), "constructor", this).call(this, id, config, {
      requires: function (arr) {

        //return arr.reduce((acc, b) => {
        //return acc.concat.apply(acc, Behavior.find(b).applyTo(obj));
        //}, obj.behaviors);

        arr.forEach(function (bhvr) {
          console.log(_this);
          Behavior.find(bhvr).applyTo(_this);
        });
        return arr;
      } });
  }

  _inherits(Behavior, Module);

  _prototypeProperties(Behavior, null, {
    applyTo: {
      value: function applyTo(obj) {
        var _this = this;

        //console.log(obj);
        obj.methods = obj.methods || [];
        this.methods.forEach(function (k) {
          if (_this[k] instanceof Function) {
            if (obj instanceof Behavior) {
              console.log("adding behavior to behavior");
              obj[k] = _this[k];
            } else {

              obj[k] = _this[k](obj);
            }
            obj.methods.push(k);
          } else {
            if (k !== "properties") {
              obj[k] = _this[k];
            }
          }
        });
        //if (this.hasOwnProperty('requires') && this.requires instanceof Function) this.requires(obj);
        if (this.hasOwnProperty("properties")) {
          obj.addProperties(this.properties);
        }

        obj.behaviors.push(this.id);
        return obj;
      },
      writable: true,
      configurable: true
    }
  });

  return Behavior;
})(Module);

Behavior.create("point", {
  properties: ["x", "y"],
  move: function (obj) {
    return function (body, x, y) {
      body.x = x;
      body.y = y;
    };
  } });
Behavior.create("canvas", {
  properties: ["x", "y", "width", "height", "fillStyle"],
  render: function (obj) {
    return function (_) {
      obj.ctx.fillStyle = obj.fillStyle;
      obj.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    };
  }
});
Behavior.create("circle", {
  requires: ["point"],
  properties: ["radius", "fillStyle"],
  render: function (obj) {
    return function (body, ctx) {
      var _obj$get = obj.get(body, "x", "y", "radius", "fillStyle");

      var _obj$get2 = _slicedToArray(_obj$get, 4);

      var x = _obj$get2[0];
      var y = _obj$get2[1];
      var radius = _obj$get2[2];
      var fillStyle = _obj$get2[3];

      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 6.28, 0);
      ctx.closePath();
      ctx.fill();
    };
  },
  doCircleStuff: function (_) {
    console.log("circle stuff");
  } });

Behavior.create("rect", {
  requires: ["point"],
  properties: ["width", "height", "fillStyle"],
  render: function (obj) {
    return function (body, ctx) {
      var _obj$get = obj.get(body, "x", "y", "width", "height", "fillStyle");

      var _obj$get2 = _slicedToArray(_obj$get, 5);

      var x = _obj$get2[0];
      var y = _obj$get2[1];
      var width = _obj$get2[2];
      var height = _obj$get2[3];
      var fillStyle = _obj$get2[4];

      ctx.fillStyle = fillStyle;
      ctx.fillRect(x, y, width, height);
    };
  },
  doRectStuff: function (_) {
    console.log("rect stuff");
  } });

var config = {
  BodyType: {
    circle: {
      behaviors: ["circle"],
      fillStyle: "red",
      radius: 15 },
    rect: {
      behaviors: ["rect"],
      width: 100,
      height: 100,
      fillStyle: "green" } },
  Canvas: {
    canvas: {
      behaviors: ["canvas"],
      x: 0,
      y: 0,
      width: 500,
      height: 500,
      fillStyle: "blue" } } };

function load(config) {
  Object.keys(config).forEach(function (k) {
    window[k].load(config[k]);
  });
}

load(config);

var circle = BodyType.find("circle");
var rect = BodyType.find("rect");
var canvas = Canvas.find("canvas");
var ctx = canvas.ctx;

var c1 = circle.createBody({ x: 150, y: 150 });
var r1 = rect.createBody({ x: 10, y: 10 });

canvas.update();

//properties: props => {
//this.addProperties(props);
//},
//behaviors: arr => {
//return arr.map(b => {
//Behavior.get(b).applyTo(this._body.prototype);
//});
//},