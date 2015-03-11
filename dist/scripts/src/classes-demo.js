function applyConfig(obj, config, priv = {}) {
  Object.keys(config).forEach(key => {
    if (priv && priv.hasOwnProperty(key) && priv[key] instanceof Function) {
      obj[key] = priv[key].call(obj, config[key]);
    } else {
      obj[key] = config[key];
    }
  });
}
class Module {
  constructor(id, config, priv = {}) {
    this.id = id;
    this.config = config;

    priv.behaviors = priv.behaviors || arr => {
      return arr.map(b => {
        Behavior.find(b).applyTo(this)
      })
    }
  applyConfig(this, config, priv);
  }

  static load(config) {
    Object.keys(config).forEach(k => {
      this.create(k, config[k]);
    });
  }

  static find(id) {
    return this._children[id];
  }
  static children() {
    return Object.keys(this._children).map(k => this._children[k]);
  }
  static create(id, config) {
    this._children = this._children || {};
    this._children[id] = new this(id, config);
    return this._children[id];
  }
}

class Canvas extends Module {
  constructor(id, config) {
    this.canvas = document.body.appendChild(document.createElement('canvas'));
    this.ctx = this.canvas.getContext('2d');
    super(id, config);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  update() {
    this.render();
    BodyType.children().forEach(t => {
      t.drawAll(this.ctx);
    });
  }
}

class BodyType extends Module {
  constructor(id, config) {
    this.properties = [];
    this._children = [];
    super(id, config, {
      properties: props => {
        this.addProperties(props);
      },
      //behaviors: arr => {
        //return arr.map(b => {
          //Behavior.get(b).applyTo(this._body.prototype);
        //});
      //},
    });
    this.ivars = this.properties.filter(p => {
      return this.hasOwnProperty(p);
    });
  }

  get(body, ...vars) {
    return vars.map(v => {
      return body.hasOwnProperty(v) ? body[v] : this[v];
    });
  }

  addProperties(props) {
    props.forEach(p => {
      if (this.properties.indexOf(p) < 0) {
        this.properties.push(p);
      }
    });
  }
  children() {
    return this._children;
  }
  createBody(config) {
    //let body = new this._body(config);
    this._children.push(config);
    return config;
  }
  drawAll(ctx) {
    this._children.forEach(b => {
      this.render(ctx, b);
    });
  }
}

class Behavior extends Module {
  constructor(id, config) {
    super(id, config, {
      requires: arr => {
        return obj => {
          arr.forEach(bhvr => {
            Behavior.find(bhvr).applyTo(obj);
          });
          return arr;
        };
      },
    });
    this.keys = Object.keys(config);
  }
  applyTo(obj) {
    this.keys.forEach(k => {
      if (this[k] instanceof Function) {
        obj[k] = this[k](obj);
      } else {
        obj[k] = this[k];
      }
    });
  }
}
Behavior.create('point', {
  properties: ['x', 'y'],
  move: obj => {
    return (body, x, y) => {
      body.x = x;
      body.y = y;
    }
  },
});
Behavior.create('canvas', {
  properties: ['x', 'y', 'width', 'height', 'fillStyle'],
  render: obj => {
    return _ => {
      obj.ctx.fillStyle = obj.fillStyle;
      obj.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
  }
});
Behavior.create('circle', {
  requires: ['point'],
  properties: ['radius', 'fillStyle'],
  render: obj => {
    return (ctx, body) => {
      var [x, y, radius, fillStyle] = obj.get(body, 'x', 'y', 'radius', 'fillStyle');
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 6.28, 0);
      ctx.closePath();
      ctx.fill();
    };
  },
});

Behavior.create('rect', {
  requires: ['point'],
  properties: ['width', 'height', 'fillStyle'],
  render: obj => {
    return (ctx, body) => {
      var [x, y, width, height, fillStyle] = obj.get(body, 'x', 'y', 'width', 'height', 'fillStyle');
      ctx.fillStyle = fillStyle;
      ctx.fillRect(x, y, width, height);
    }
  },
})

let config = {
  BodyType: {
    'circle': {
      behaviors: ['circle'],
      fillStyle: 'red',
      radius: 15,
    },
    'rect': {
      behaviors: ['rect'],
      width: 100,
      height: 100,
      fillStyle: 'green',
    },
  },
  Canvas: {
    'canvas': {
      behaviors: ['canvas'],
      x: 0,
      y: 0,
      width: 500,
      height: 500,
      fillStyle: 'blue',
    },
  },
}

function load(config) {
  Object.keys(config).forEach(k => {
    window[k].load(config[k]);
  });
}

load(config);

let circle = BodyType.find('circle');
let rect = BodyType.find('rect');
let canvas = Canvas.find('canvas');
let ctx = canvas.ctx;

let c1 = circle.createBody({x: 150, y: 150});
let r1 = rect.createBody({x: 10, y: 10});

canvas.update();
