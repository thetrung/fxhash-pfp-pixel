const jsondata = require('../tmp/layers.json');

String.replacei = String.prototype.replacei = function (rep, rby) {
  var pos = this.toLowerCase().indexOf(rep.toLowerCase());
  return pos == -1 ? this : this.substr(0, pos) + rby + this.substr(pos + rep.length);
};

const pick = (arr) => arr[(fxrand() * arr.length) | 0];

const getWeightedOption = function (options) {
  let choices = [];
  for (let i in options)
    choices = choices.concat(new Array(options[i][1]).fill(options[i][0]));
  return pick(choices);
};

/*
layeredCanvas v0.1
by Federico Jacobi
federicojacobi.com
Abstraction layer on canvas to mimic the use of layers
*/

layeredCanvas = function (id) {
  this.layers = [];

  var extend = function (defaults, options) {
    var extended = {}, prop;
    for (prop in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, prop))
        extended[prop] = defaults[prop];
    }
    for (prop in options) {
      if (Object.prototype.hasOwnProperty.call(options, prop))
        extended[prop] = options[prop];
    }
    return extended;
  };

  this.addLayer = function (obj) {

    layer = extend({
      id: Math.random().toString(36).substr(2, 5),
      show: true,
      render: function (canvas, ctx) { }
    }, obj);

    if (this.getLayer(layer.id) !== false) {
      console.log('Layer already exists');
      console.log(obj);
      return false;
    }

    this.layers.push(layer);
    return this;
  };

  this.getLayer = function (id) {
    var length = this.layers.length;
    for (var i = 0; i < length; i++) {
      if (this.layers[i].id === id)
        return this.layers[i];
    }
    return false;
  };

  this.removeLayer = function (id) {
    var length = this.layers.length;
    for (var i = 0; i < length; i++) {
      if (this.layers[i].id === id) {
        removed = this.layers[i];
        this.layers.splice(i, 1);
        return removed;
      }
    }
    return false;
  };

  this.render = function () {
    var canvas = this.canvas;
    var ctx = this.ctx2d;
    this.layers.forEach(function (item, index, array) {
      if (item.show)
        item.render(canvas, ctx);
    });
  };

  this.canvas = document.getElementById(id);
  this.ctx2d = this.canvas.getContext('2d');
};

document.body.insertAdjacentHTML('beforeend', '<canvas id="theCanvas" width="0" height="0">');
const layered = new layeredCanvas('theCanvas');

let aspectRatio = null;

//----------------------
// defining features
//----------------------
// You can define some token features by populating the $fxhashFeatures property
// of the window object.
// More about it in the guide, section features:
// [https://fxhash.xyz/articles/guide-mint-generative-token#features]
window.$fxhashFeatures = {};

// https://stackoverflow.com/a/14731922/953010
/**
 * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 *
 * @param {Number} srcWidth width of source image
 * @param {Number} srcHeight height of source image
 * @param {Number} maxWidth maximum available width
 * @param {Number} maxHeight maximum available height
 * @return {Object} { width, height }
 */
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
  var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

  return { width: srcWidth * ratio, height: srcHeight * ratio };
}

function onWindowResize() {
  sideLength = Math.min(window.innerWidth, window.innerHeight);

  let ratio = calculateAspectRatioFit(aspectRatio * 100, 100, window.innerWidth, window.innerHeight);

  layered.canvas.width = ratio.width;
  layered.canvas.height = ratio.height;

  layered.render();
}
window.addEventListener('resize', onWindowResize, false);

let toLoad = 0;

Object.keys(jsondata)
  .filter(key => jsondata[key].length)
  .sort((a, b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]))
  .forEach(key => {
    toLoad++;

    let options = [];
    jsondata[key].forEach(elem => {
      // If no aspect ratio is set,
      // use first image to determine
      if (aspectRatio == null) {
        aspectRatio = 1;

        let image = new Image();

        image.addEventListener('load', function () {
          aspectRatio = image.width / image.height;
          window.dispatchEvent(new Event('resize'));
        }, false);

        image.src = './layers/' + key + '/' + elem;
      }

      options.push([elem, parseInt(elem.split('-')[0])]);
    });

    // Select value for attribute
    let selected = getWeightedOption(options);

    let layer = new Image();
    layer.addEventListener('load', function () {
      layered.render();

      toLoad--;
      if (toLoad == 0) {
        fxpreview();
      }
    }, false);
    layer.src = './layers/' + key + '/' + selected;

    let layerObj = {
      id: key,
      show: true,
      render: function (canvas, ctx) {
        ctx.drawImage(layer, 0, 0, canvas.width, canvas.height);
      }
    };
    layered.addLayer(layerObj);

    let layerNameArray = key.split('-').splice(1);
    if (layerNameArray[0] != 'hide') {
      window.$fxhashFeatures[layerNameArray.join('-').replaceAll('_', ' ')] = selected.split('-').splice(1).join('-').replacei('.png', '').replaceAll('_', ' ');
    }
  });

console.log(window.$fxhashFeatures);
