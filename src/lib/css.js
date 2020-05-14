export function get(element) {
  return getComputedStyle(element);
}

export function set(element, obj) {
  
  for (const key in obj) {
    let val = obj[key];
    if (typeof val === 'number') {
      val = `${val}px`;
    }

    if(key==='top'){
      let translate = 'translate3d(0, '+val+', 0)';
      console.log(translate);
      setWebkits(element, translate);
    }else{
      element.style[key] = val;
    }
  }
  return element;
}


function setWebkits(element,transform){
  element.style.webkitTransform = transform;
element.style.MozTransform = transform;
element.style.msTransform = transform;
element.style.OTransform = transform;
element.style.transform = transform;
}