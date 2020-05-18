import * as CSS from './lib/css';
import * as DOM from './lib/dom';
import cls from './lib/class-names';
import EventManager from './lib/event-manager';
import processScrollDiff from './process-scroll-diff';
import updateGeometry from './update-geometry';
import { toInt, outerWidth } from './lib/util';

import clickRail from './handlers/click-rail';
import dragThumb from './handlers/drag-thumb';
import keyboard from './handlers/keyboard';
import wheel from './handlers/mouse-wheel';
import touch from './handlers/touch';

const defaultSettings = () => ({
  handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch'],
  maxScrollbarLength: null,
  minScrollbarLength: null,
  scrollingThreshold: 1000,
  scrollXMarginOffset: 0,
  scrollYMarginOffset: 0,
  suppressScrollX: false,
  suppressScrollY: false,
  swipeEasing: true,
  useBothWheelAxes: false,
  wheelPropagation: true,
  wheelSpeed: 1,
});

const handlers = {
  'click-rail': clickRail,
  'drag-thumb': dragThumb,
  keyboard,
  wheel,
  touch,
};

export default class PerfectScrollbar {
  constructor(element, contentElement, userSettings = {}) {

    if (typeof element === 'string') {
      element = document.querySelector(element);
    }

    if (!element || !element.nodeName) {
      throw new Error('no element is specified to initialize PerfectScrollbar');
    }

    const content = document.querySelector(contentElement);

    if(!content || !content.nodeName){
      throw new Error('no element content is specified to initialize PerfectScrollbar');
    }

    this.element = element;
    this.content = content;
    
    element.classList.add(cls.main);

    this.settings = defaultSettings();
    for (const key in userSettings) {
      this.settings[key] = userSettings[key];
    }

    this.updateRectangle();

    const focus = () => element.classList.add(cls.state.focus);
    const blur = () => element.classList.remove(cls.state.focus);

    this.isRtl = CSS.get(element).direction === 'rtl';

    if (this.isRtl === true) {
      element.classList.add(cls.rtl);
    }

    this.isNegativeScroll = (() => {
      const originalScrollLeft = element.scrollLeft;
      let result = null;
      element.scrollLeft = -1;
      result = element.scrollLeft < 0;
      element.scrollLeft = originalScrollLeft;
      return result;
    })();

    this.negativeScrollAdjustment = this.isNegativeScroll
      ? element.scrollWidth - element.clientWidth
      : 0;

    this.event = new EventManager();
    this.ownerDocument = element.ownerDocument || document;

    if(!this.settings.suppressScrollX){
      this.scrollbarXRail = DOM.div(cls.element.rail('x'));
      element.appendChild(this.scrollbarXRail);
      this.scrollbarX = DOM.div(cls.element.thumb('x'));
      this.scrollbarXRail.appendChild(this.scrollbarX);
      this.scrollbarX.setAttribute('tabindex', 0);
      this.event.bind(this.scrollbarX, 'focus', focus);
      this.event.bind(this.scrollbarX, 'blur', blur);
      this.scrollbarXActive = null;
      this.scrollbarXWidth = null;
      this.scrollbarXLeft = null;
      const railXStyle = CSS.get(this.scrollbarXRail);
      this.scrollbarXBottom = parseInt(railXStyle.bottom, 10);
      if (isNaN(this.scrollbarXBottom)) {
        this.isScrollbarXUsingBottom = false;
        this.scrollbarXTop = toInt(railXStyle.top);
      } else {
        this.isScrollbarXUsingBottom = true;
      }
      this.railBorderXWidth =
        toInt(railXStyle.borderLeftWidth) + toInt(railXStyle.borderRightWidth);
      // Set rail to display:block to calculate margins
      CSS.set(this.scrollbarXRail, { display: 'block' });
      this.railXMarginWidth =
        toInt(railXStyle.marginLeft) + toInt(railXStyle.marginRight);
      CSS.set(this.scrollbarXRail, { display: '' });
      this.railXWidth = null;
      this.railXRatio = null;
    }

    if(!this.settings.suppressScrollY){
      this.scrollbarYRail = DOM.div(cls.element.rail('y'));
      element.appendChild(this.scrollbarYRail);
       this.scrollbarY = DOM.div(cls.element.thumb('y'));
       this.scrollbarYRail.appendChild(this.scrollbarY);
       this.scrollbarY.setAttribute('tabindex', 0);
       this.event.bind(this.scrollbarY, 'focus', focus);
       this.event.bind(this.scrollbarY, 'blur', blur);
       this.scrollbarYActive = null;
       this.scrollbarYHeight = null;
       this.scrollbarYTop = null;
       const railYStyle = CSS.get(this.scrollbarYRail);
       this.scrollbarYRight = parseInt(railYStyle.right, 10);
       if (isNaN(this.scrollbarYRight)) {
         this.isScrollbarYUsingRight = false;
         this.scrollbarYLeft = toInt(railYStyle.left);
       } else {
         this.isScrollbarYUsingRight = true;
       }
       this.scrollbarYOuterWidth = this.isRtl ? outerWidth(this.scrollbarY) : null;
       this.railBorderYWidth =
         toInt(railYStyle.borderTopWidth) + toInt(railYStyle.borderBottomWidth);
       CSS.set(this.scrollbarYRail, { display: 'block' });
       this.railYMarginHeight =
         toInt(railYStyle.marginTop) + toInt(railYStyle.marginBottom);
       CSS.set(this.scrollbarYRail, { display: '' });
       this.railYHeight = null;
       this.railYRatio = null;
    }
  
    this.reach = {
      x:
        content.scrollLeft <= 0
          ? 'start'
          : element.scrollLeft >= this.contentWidth - this.containerWidth
          ? 'end'
          : null,
      y:
      content.scrollTop <= 0
          ? 'start'
          : content.scrollTop >= this.contentHeight - this.containerHeight
          ? 'end'
          : null,
    };

    this.isAlive = true;

    this.settings.handlers.forEach(handlerName => handlers[handlerName](this));

    this.lastScrollTop = Math.floor(content.scrollTop); // for onScroll only
    this.lastScrollLeft = content.scrollLeft; // for onScroll only
    this.event.bind(content, 'scroll', e => this.onScroll(e));
    updateGeometry(this);
  }

  update() {
    if (!this.isAlive) {
      return;
    }

    // Recalcuate negative scrollLeft adjustment
    this.negativeScrollAdjustment = this.isNegativeScroll
      ? this.element.scrollWidth - this.element.clientWidth
      : 0;

    // Recalculate rail margins
    CSS.set(this.scrollbarXRail, { display: 'block' });
    CSS.set(this.scrollbarYRail, { display: 'block' });
    this.railXMarginWidth =
      toInt(CSS.get(this.scrollbarXRail).marginLeft) +
      toInt(CSS.get(this.scrollbarXRail).marginRight);
    this.railYMarginHeight =
      toInt(CSS.get(this.scrollbarYRail).marginTop) +
      toInt(CSS.get(this.scrollbarYRail).marginBottom);

    // Hide scrollbars not to affect scrollWidth and scrollHeight
  
    if(!this.suppressScrollY){
      CSS.set(this.scrollbarYRail, { display: 'none' });
    }

    if(!this.suppressScrollX){
      CSS.set(this.scrollbarXRail, { display: 'none' });
    }

    updateGeometry(this);

    if(!this.suppressScrollY){
      processScrollDiff(this, 'top', 0, false, true);
    }

    if(!this.suppressScrollX){
      processScrollDiff(this, 'left', 0, false, true);
    }

    if(!this.suppressScrollY){
      CSS.set(this.scrollbarYRail, { display: '' });
    }

    if(!this.suppressScrollX){
      CSS.set(this.scrollbarXRail, { display: '' });
    }
  }

  onScroll(e) {
    if (!this.isAlive) {
      return;
    }

    updateGeometry(this);
    
    if(!this.suppressScrollY){
      processScrollDiff(this, 'top', this.scrollbarYTop - this.lastScrollTop);
      this.lastScrollTop = Math.floor(this.scrollbarYTop);
    }

    if(!this.suppressScrollX){
      processScrollDiff(this,'left',  this.scrollbarXLeft - this.lastScrollLeft);
      this.lastScrollLeft = this.scrollbarXLeft;
    }
  }

  updateRectangle(){
    const rect = this.content.getBoundingClientRect();

    this.containerWidth = Math.round(rect.width);
    this.containerHeight = Math.round(rect.height);
    this.contentWidth = this.content.scrollWidth;
    this.contentHeight = this.content.scrollHeight;
  }

  destroy() {
    if (!this.isAlive) {
      return;
    }

    this.event.unbindAll();
    DOM.remove(this.scrollbarX);
    DOM.remove(this.scrollbarY);
    DOM.remove(this.scrollbarXRail);
    DOM.remove(this.scrollbarYRail);
    this.removePsClasses();

    // unset elements
    this.element = null;
    this.scrollbarX = null;
    this.scrollbarY = null;
    this.scrollbarXRail = null;
    this.scrollbarYRail = null;

    this.isAlive = false;
  }

  removePsClasses() {
    this.element.className = this.element.className
      .split(' ')
      .filter(name => !name.match(/^ps([-_].+|)$/))
      .join(' ');
  }
}
