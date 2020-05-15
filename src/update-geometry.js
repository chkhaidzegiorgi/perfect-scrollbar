import * as CSS from './lib/css';
import * as DOM from './lib/dom';
import cls from './lib/class-names';
import { toInt } from './lib/util';

export default function(i) {
  const element = i.element;
  const roundedScrollTop = Math.floor(element.scrollTop);

  // if (!element.contains(i.scrollbarXRail)) {
  //   // clean up and append
  //   DOM.queryChildren(element, cls.element.rail('x')).forEach(el =>
  //     DOM.remove(el)
  //   );
  //   element.appendChild(i.scrollbarXRail);
  // }
  // if (!element.contains(i.scrollbarYRail)) {
  //   // clean up and append
  //   DOM.queryChildren(element, cls.element.rail('y')).forEach(el =>
  //     DOM.remove(el)
  //   );
  //   element.appendChild(i.scrollbarYRail);
  // }

  if (
    !i.settings.suppressScrollX &&
    i.containerWidth + i.settings.scrollXMarginOffset < i.contentWidth
  ) {
    i.scrollbarXActive = true;
    i.railXWidth = i.containerWidth - i.railXMarginWidth;
    i.railXRatio = i.containerWidth / i.railXWidth;
    i.scrollbarXWidth = getThumbSize(
      i,
      toInt((i.railXWidth * i.containerWidth) / i.contentWidth)
    );
    i.scrollbarXLeft = toInt(
      ((i.negativeScrollAdjustment + element.scrollLeft) *
        (i.railXWidth - i.scrollbarXWidth)) /
        (i.contentWidth - i.containerWidth)
    );
  } else {
    i.scrollbarXActive = false;
  }

  if (
    !i.settings.suppressScrollY &&
    i.containerHeight + i.settings.scrollYMarginOffset < i.contentHeight
  ) {
    i.scrollbarYActive = true;
    i.railYHeight = i.containerHeight - i.railYMarginHeight;
    i.railYRatio = i.containerHeight / i.railYHeight;
    i.scrollbarYHeight = getThumbSize(
      i,
      toInt((i.railYHeight * i.containerHeight) / i.contentHeight)
    );
    i.scrollbarYTop = toInt(
      (roundedScrollTop * (i.railYHeight - i.scrollbarYHeight)) /
        (i.contentHeight - i.containerHeight)
    );
  } else {
    i.scrollbarYActive = false;
  }

  if (i.scrollbarXLeft >= i.railXWidth - i.scrollbarXWidth) {
    i.scrollbarXLeft = i.railXWidth - i.scrollbarXWidth;
  }
  if (i.scrollbarYTop >= i.railYHeight - i.scrollbarYHeight) {
    i.scrollbarYTop = i.railYHeight - i.scrollbarYHeight;
  }

  updateCss(i);

  if( !i.settings.suppressScrollX){
    if (i.scrollbarXActive) {
      element.classList.add(cls.state.active('x'));
    } 
    else {
      element.classList.remove(cls.state.active('x'));
      i.scrollbarXWidth = 0;
      i.scrollbarXLeft = 0;
      element.scrollLeft = i.isRtl === true ? i.contentWidth : 0;
    }
  }

  if(!i.settings.suppressScrollY){
    if (i.scrollbarYActive) {
      element.classList.add(cls.state.active('y'));
    } else {
      element.classList.remove(cls.state.active('y'));
      i.scrollbarYHeight = 0;
      i.scrollbarYTop = 0;
      element.scrollTop = 0;
    }
  }

}

function getThumbSize(i, thumbSize) {
  if (i.settings.minScrollbarLength) {
    thumbSize = Math.max(thumbSize, i.settings.minScrollbarLength);
  }
  if (i.settings.maxScrollbarLength) {
    thumbSize = Math.min(thumbSize, i.settings.maxScrollbarLength);
  }
  return thumbSize;
}

function updateCss(i) {

  if(!i.settings.suppressScrollX){
    CSS.set(i.scrollbarX, {
      left: i.scrollbarXLeft,
    //  width: i.scrollbarXWidth - i.railBorderXWidth,
    });
  }

  if(!i.settings.suppressScrollY){
    CSS.set(i.scrollbarY, {
      top: i.scrollbarYTop,
    //  height: i.scrollbarYHeight - i.railBorderYWidth,
    });
  }
 
}
