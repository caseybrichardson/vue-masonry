import Vue from 'vue';
import Masonry from 'masonry-layout';
import ImageLoaded from 'imagesloaded';

const attributesMap = {
  'column-width': 'columnWidth',
  'transition-duration': 'transitionDuration',
  'item-selector': 'itemSelector',
  'origin-left': 'originLeft',
  'origin-top': 'originTop',
  'stamp': 'stamp',
  'gutter': 'gutter'
};

const typeMap = {
  'columnWidth': {
    type: Number
  },
  'gutter': {
    type: Number
  },
  'origin-left': {
    type: Boolean
  },
  'origin-right': {
    type: Boolean
  }
};

const EVENT_ADD = 'vuemasonry.itemAdded';
const EVENT_REMOVE = 'vuemasonry.itemRemoved';
const EVENT_IMAGE_LOADED = 'vuemasonry.imageLoaded';

const collectOptions = attrs => {
  let res = {};
  let attributesArray = Array.prototype.slice.call(attrs);
  attributesArray.forEach(attr => {
    if (Object.keys(attributesMap).indexOf(attr.name) > -1) {
      const name = attributesMap[attr.name];
      if(typeMap[name]) {
        let typeFunc = typeMap[name].type;
        let value = typeFunc(attr.value);
        if(!isNaN(value)) {
          res[name] = value;
        } else {
          res[name] = attr.value;
        }
      } else {
        res[name] = attr.value;
      }
    }
  });
  return res;
};

let Events = new Vue({});

export let VueMasonryPlugin = function () {};

VueMasonryPlugin.install = function (Vue, options) {

  Vue.redrawVueMasonry = function () {
    Events.$emit(EVENT_ADD)
  };

  Vue.directive('masonry', {
    props: [ 'transitionDuration', ' itemSelector' ],

    inserted: function (el, nodeObj) {
      if (!Masonry) {
        throw new Error('Masonry plugin is not defined. Please check it\'s connected and parsed correctly.');
      }
      let masonry = new Masonry(el, collectOptions(el.attributes));
      let masonryDraw = () => {
        masonry.reloadItems();
        masonry.layout();
      };

      Vue.nextTick(function () {
        masonryDraw();
      });

      Events.$on(EVENT_ADD, function (eventData) {
        masonryDraw();
      });

      Events.$on(EVENT_REMOVE, function (eventData) {
        masonryDraw();
      });

      Events.$on(EVENT_IMAGE_LOADED, function (eventData) {
        masonryDraw();
      })
    }
  });

  Vue.directive('masonryTile', {

    inserted: function (el) {
      Events.$emit(EVENT_ADD, { 'element': el });

      new ImageLoaded(el, function () {
        Events.$emit(EVENT_IMAGE_LOADED, { 'element': el });
      })
    },
    beforeDestroy: function (el) {
      Events.$emit(EVENT_REMOVE, { 'element': el });
    }
  })
};
