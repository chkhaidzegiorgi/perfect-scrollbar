import updateGeometry from '../update-geometry';

export default function(i) {
  const element = i.element;

  if(!i.settings.suppressScrollY){
    i.event.bind(i.scrollbarY, 'mousedown', e => e.stopPropagation());
    i.event.bind(i.scrollbarYRail, 'mousedown', e => {

      const positionTop =
        e.pageY -
        window.pageYOffset -
        i.scrollbarYRail.getBoundingClientRect().top;
      const direction = positionTop > i.scrollbarYTop ? 1 : -1;

      i.content.scrollTop += direction * i.containerHeight;

      updateGeometry(i);

      e.stopPropagation();
    });
  }

  if(!i.settings.suppressScrollX){
    i.event.bind(i.scrollbarX, 'mousedown', e => e.stopPropagation());
    i.event.bind(i.scrollbarXRail, 'mousedown', e => {
      const positionLeft =
        e.pageX -
        window.pageXOffset -
        i.scrollbarXRail.getBoundingClientRect().left;
      const direction = positionLeft > i.scrollbarXLeft ? 1 : -1;
  
      i.content.scrollLeft += direction * i.containerWidth;
      updateGeometry(i);
  
      e.stopPropagation();
    });
  }
 
}
