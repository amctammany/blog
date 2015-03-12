function applyConfig(obj, config, priv = {}) {
  Object.keys(config).forEach(key => {
    if (priv && priv.hasOwnProperty(key) && priv[key] instanceof Function) {
      priv[key].call(obj, config[key]);
    } else {
      obj[key] = config[key];
    }
  });
}
class Module {
  constructor(id, config, priv = {}) {
    this.id = id;
    this.config = config;
    this.behaviors = [];
    this.properties = [];

    priv.behaviors = priv.behaviors || arr => {
      arr.forEach(b => Behavior.find(b).applyTo(this));
      return this.behaviors;
      //return arr.reduce((acc, b) => {
        //return acc.concat.apply(acc, Behavior.find(b).applyTo(this));
      //}, this.behaviors);
    };
    priv.properties = priv.properties || arr => {
      this.addProperties(arr);
    }
    applyConfig(this, config, priv);
  }
  addProperties(props) {
    props.forEach(p => {
      if (this.properties.indexOf(p) < 0) {
        this.properties.push(p);
      }
    });
    return this.properties;
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
function BodyFactory(parent, properties, methods) {
  let _body = function Body(config) {
    properties.forEach(p => {
      this[p] = config[p] ? config[p] : parent[p];
    });
  };
  let proto = {};
  methods.forEach(m => {
    proto[m] = function(...args) {

      args.unshift(this);
      console.log(args)

      parent[m].apply(this, args);
    };
  });
  _body.prototype = Object.create(proto);
  return _body;
}
class BodyType extends Module {
  constructor(id, config) {
    this._children = [];
    super(id, config, {
      //properties: props => {
        //this.addProperties(props);
      //},
      //behaviors: arr => {
        //return arr.map(b => {
          //Behavior.get(b).applyTo(this._body.prototype);
        //});
      //},
    });
    //this.ivars = this.properties.filter(p => {
      //return this.hasOwnProperty(p);
    //});
    let proto = {};
    this.methods.forEach(k => {
      proto[k] = this[k]
    })
    this._body = BodyFactory(this, this.properties, this.methods);
  }


  get(body, ...vars) {
    return vars.map(v => {
      return body.hasOwnProperty(v) ? body[v] : this[v];
    });
  }

  //addProperties(props) {
    //props.forEach(p => {
      //if (this.properties.indexOf(p) < 0) {
        //this.properties.push(p);
      //}
    //});
  //}
  children() {
    return this._children;
  }
  createBody(config) {
    let body = new this._body(config);
    this._children.push(body);
    return body;
  }
  drawAll(ctx) {
    this._children.forEach(b => {
      this.render(b, ctx);
    });
  }
}

class Behavior extends Module {
  constructor(id, config) {
    this.methods = Object.keys(config);
    super(id, config, {
      requires: arr => {


          //return arr.reduce((acc, b) => {
            //return acc.concat.apply(acc, Behavior.find(b).applyTo(obj));
          //}, obj.behaviors);


          arr.forEach(bhvr => {
            console.log(this);
            Behavior.find(bhvr).applyTo(this);
          });
          return arr;
      },
    });
  }
  applyTo(obj) {
    //console.log(obj);
    obj.methods = obj.methods || [];
    this.methods.forEach(k => {
      if (this[k] instanceof Function) {
        if (obj instanceof Behavior) {
          console.log('adding behavior to behavior')
          obj[k] = this[k];
        } else {

          obj[k] = this[k](obj);
        }
        obj.methods.push(k);
      } else {
        if (k !== 'properties') {
          obj[k] = this[k];
        }
      }
    });
    //if (this.hasOwnProperty('requires') && this.requires instanceof Function) this.requires(obj);
    if (this.hasOwnProperty('properties')){
      obj.addProperties(this.properties);
    }

    obj.behaviors.push(this.id);
    return obj;
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
    return (body, ctx) => {
      var [x, y, radius, fillStyle] = obj.get(body, 'x', 'y', 'radius', 'fillStyle');
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 6.28, 0);
      ctx.closePath();
      ctx.fill();
    };
  },
  doCircleStuff: _ => {
    console.log('circle stuff');
  },
});

Behavior.create('rect', {
  requires: ['point'],
  properties: ['width', 'height', 'fillStyle'],
  render: obj => {
    return (body, ctx) => {
      var [x, y, width, height, fillStyle] = obj.get(body, 'x', 'y', 'width', 'height', 'fillStyle');
      ctx.fillStyle = fillStyle;
      ctx.fillRect(x, y, width, height);
    }
  },
  doRectStuff: _ => {
    console.log('rect stuff');
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
