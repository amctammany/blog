var expect = require('chai').expect;
var tocular = require('../index.js');

var path = require('path');
var fs = require('fs');

var simple = './test/fixtures/simple.md';
var complex = './test/fixtures/complex.md';
var supercomplex = './test/fixtures/super-complex.md';
//var complex = tocular.open('./test/fixtures/complex.md');
//var supercomplex = tocular.open('./test/fixtures/super-complex.md');

describe('tocular', function () {
  it('should be true', function () {
    expect(!!tocular).to.equal(true);
    expect(tocular).to.be.a('function');
  });

  it('should load markdown text', function () {
    tocular('./fixtures/simple.md');
  });
  it('should get header from line', function () {
    var line = '# Introduction to Chemistry!';
    var line2 = '## Fun!';
    var header = tocular.getHeader(line);
    expect(!!header).to.equal(true);
    expect(header.title).to.equal('Introduction to Chemistry!');
    expect(header.anchor).to.equal('#introductiontochemistry');
    expect(header.children).to.be.a('array');
    expect(header.children.length).to.equal(0);
    expect(header.indent).to.equal(1);
    header = tocular.getHeader(line2);
    expect(!!header).to.equal(true);
    expect(header.title).to.equal('Fun!');
    expect(header.anchor).to.equal('#fun');
    expect(header.children).to.be.a('array');
    expect(header.children.length).to.equal(0);
    expect(header.indent).to.equal(2);


  });

  it('should collapse stack', function () {
    expect(tocular.collapse).to.be.a('function');
    var h1 = {title: 'h1', children: []};
    var h2 = {title: 'h2', children: []};
    var h2a = {title: 'h2a', children: []};
    var h2b = {title: 'h2b', children: []};
    var h3a = {title: 'h3a', children: []};
    var h3b = {title: 'h3b', children: []};

    var stack = [h1, h2, h2a, h3a];

    stack = tocular.collapse(stack, 2);
    expect(stack.length).to.equal(2);
    expect(h2.children.length).to.equal(1);
    expect(h2a.children.length).to.equal(1);

    stack = [h1, h2, h2b, h3b];
    stack = tocular.collapse(stack, 1);
    expect(stack.length).to.equal(1);
    expect(h2.children.length).to.equal(2);
    expect(h2b.children.length).to.equal(1);

    expect(h1.children.length).to.equal(1);

    //var stack
  });

  it('should find simple headers', function () {
    var headers = tocular.open(simple);
    expect(headers.length).to.equal(3);
    expect(headers[0].title).to.equal('Introduction');
    expect(headers[0].anchor).to.equal('#introduction');
    expect(headers[0].children.length).to.equal(2);
    expect(headers[0].children[0].title).to.equal('Intro One');
    expect(headers[0].children[1].title).to.equal('Intro Two');

    expect(headers[1].title).to.equal('Second Paragraph');
    expect(headers[1].anchor).to.equal('#secondparagraph');
    expect(headers[1].children.length).to.equal(1);
    expect(headers[1].children.length).to.equal(1);
    expect(headers[2].title).to.equal('The Finale?');
    expect(headers[2].anchor).to.equal('#thefinale');
    expect(headers[2].children.length).to.equal(0);
  });

  it('should create simple TOC', function () {
    var toc = tocular.open(simple);
    expect(!!toc).to.equal(true);

  });
  it('should find complex headers', function () {
    var headers = tocular.open(complex);
    expect(headers.length).to.equal(4);
    expect(headers[0].title).to.equal('Introduction');
    expect(headers[0].anchor).to.equal('#introduction');
    expect(headers[0].children.length).to.equal(1);
    expect(headers[1].title).to.equal('Particle System');
    expect(headers[1].anchor).to.equal('#particlesystem');
    expect(headers[1].children.length).to.equal(5);
    expect(headers[1].children[0].title).to.equal('Vectors');
    expect(headers[1].children[1].title).to.equal('Particles');
    expect(headers[1].children[2].title).to.equal('Emitters');
    expect(headers[1].children[3].title).to.equal('Fields');
    expect(headers[1].children[4].title).to.equal('World');
    expect(headers[2].title).to.equal('Demonstration');
    expect(headers[2].anchor).to.equal('#demonstration');
    expect(headers[2].children.length).to.equal(3);
    expect(headers[3].title).to.equal('Conclusion');
    expect(headers[3].anchor).to.equal('#conclusion');
    expect(headers[3].children.length).to.equal(0);
  });

  it('should find super complex headers', function () {
    var headers = tocular.open(supercomplex);
    var intro = headers[0];
    var subintro = intro.children[0];
    var body = headers[1];
    var subbody = body.children[0];
    var conclusion = headers[2];

    expect(headers.length).to.equal(3);
    expect(intro.children.length).to.equal(1);
    expect(subintro.children.length).to.equal(2);
    expect(subintro.children[0].title).to.equal('Sub-Sub-Intro');
    expect(subintro.children[1].title).to.equal('Sub-Alt-Intro');
    expect(body.title).to.equal('Body');
    expect(body.children.length).to.equal(2);
    expect(subbody.title).to.equal('Sub-Body');
    expect(subbody.children[0].title).to.equal('Sub-Sub-Body');
    expect(subbody.children[0].children.length).to.equal(2);
    expect(subbody.children[0].children[0].title).to.equal('Sub-Sub-Sub-Body');
    expect(subbody.children[0].children[1].title).to.equal('Sub-Sub-Sub-Body-2');
    expect(subbody.children[1].title).to.equal('Sub-Alt-Body');
    expect(subbody.children[1].children.length).to.equal(1);
    expect(subbody.children[1].children[0].title).to.equal('Sub-Alt-Sub-Body');
    expect(subbody.children.length).to.equal(2);
    expect(conclusion.title).to.equal('Conclusion');
    expect(conclusion.children.length).to.equal(2);


  });
});
