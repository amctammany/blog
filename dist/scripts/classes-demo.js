"use strict";

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

function applyConfig(obj, config) {
  var priv = arguments[2] === undefined ? {} : arguments[2];

  Object.keys(config).forEach(function (key) {
    if (priv && priv.hasOwnProperty(key) && priv[key] instanceof Function) {
      obj[key] = priv[key].call(obj, config[key]);
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

    priv.behaviors = priv.behaviors || function (arr) {
      return arr.map(function (b) {
        Behavior.get(b).applyTo(_this);
      });
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
    get: {
      value: function get(id) {
        return this._children[id];
      },
      writable: true,
      configurable: true
    },
    children: {
      value: function children() {
        return this._children;
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
  });

  return Module;
})();

var Canvas = (function (Module) {
  function Canvas(id, config) {
    _classCallCheck(this, Canvas);

    this.canvas = document.body.appendChild(document.createElement("canvas"));
    this.ctx = this.canvas.getContext("2d");
    _get(Object.getPrototypeOf(Canvas.prototype), "constructor", this).call(this, id, config);
  }

  _inherits(Canvas, Module);

  return Canvas;
})(Module);

var BodyType = (function (Module) {
  function BodyType(id, config) {
    var _this = this;

    _classCallCheck(this, BodyType);

    this.properties = [];
    this._children = [];
    _get(Object.getPrototypeOf(BodyType.prototype), "constructor", this).call(this, id, config, {
      properties: function (props) {
        _this.addProperties(props);
      } });
    this.ivars = this.properties.filter(function (p) {
      return _this.hasOwnProperty(p);
    });
  }

  _inherits(BodyType, Module);

  _prototypeProperties(BodyType, null, {
    addProperties: {
      value: function addProperties(props) {
        var _this = this;

        props.forEach(function (p) {
          if (_this.properties.indexOf(p) < 0) {
            _this.properties.push(p);
          }
        });
      },
      writable: true,
      configurable: true
    },
    createBody: {
      value: function createBody(config) {
        //let body = new this._body(config);
        return this._children.push(config);
      },
      writable: true,
      configurable: true
    },
    drawAll: {
      value: function drawAll(ctx) {
        var _this = this;

        this._children.forEach(function (b) {
          _this.render(ctx, b);
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
    _classCallCheck(this, Behavior);

    _get(Object.getPrototypeOf(Behavior.prototype), "constructor", this).call(this, id, config);
    this.keys = Object.keys(config);
  }

  _inherits(Behavior, Module);

  _prototypeProperties(Behavior, null, {
    applyTo: {
      value: function applyTo(obj) {
        var _this = this;

        this.keys.forEach(function (k) {
          if (_this[k] instanceof Function) {
            obj[k] = _this[k](obj);
          } else {
            obj[k] = _this[k];
          }
        });
      },
      writable: true,
      configurable: true
    }
  });

  return Behavior;
})(Module);

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
  properties: ["x", "y", "radius", "fillStyle"],
  render: function (obj) {
    return function (ctx) {
      ctx.fillStyle = obj.fillStyle;
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, obj.radius, 0, 6.28, 0);
      ctx.closePath();
      ctx.fill();
    };
  } });

Behavior.create("rect", {
  properties: ["x", "y", "width", "height", "fillStyle"],
  render: function (obj) {
    return function (ctx) {
      ctx.fillStyle = obj.fillStyle;
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    };
  } });

var config = {
  BodyType: {
    circle: {
      behaviors: ["circle"],
      x: 10,
      y: 10,
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
BodyType.get("circle").createBody({ x: 100, y: 100 });
BodyType.get("rect").createBody({ x: 10, y: 10 });

var circle = BodyType.get("circle");
var rect = BodyType.get("rect");
var canvas = Canvas.get("canvas");
var ctx = canvas.ctx;

//behaviors: arr => {
//return arr.map(b => {
//Behavior.get(b).applyTo(this._body.prototype);
//});
//},