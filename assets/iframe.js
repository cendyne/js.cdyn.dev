(function(){
  function debounce(func, delay) {
    let debounceTimer;
    let tailing = false;
    return function() {
      const context = this
      const args = arguments

      if (!debounceTimer) {
        func.apply(context, args);
        tailing = false;
      } else {
        clearTimeout(debounceTimer);
        trailing = true;
      }
      debounceTimer = setTimeout(() => {
        if (tailing) {
          func.apply(context, args);
          debounceTimer = null;
        }
      }, delay);
    }
  }
  const iframeMap = {}
  function iframeLoaded(event) {
    const element = event.target;
    id = element.dataset['iframeId'];
    if (!id) {
      return;
    }
    element.contentWindow.postMessage(JSON.stringify({type: 'loaded', id}), '*');
  }
  function iframeIntersection(changes) {
    for (let change of changes) {
      const element = change.target;
      id = element.dataset['iframeId'];
      if (!id) {
        return;
      }
      let {isIntersecting, intersectionRatio} = change;
      element.contentWindow.postMessage(JSON.stringify({type: 'intersection', id, isIntersecting, intersectionRatio}), '*');
    }
  }
  let intersectionOptions = {
    root: document,
    threshold: [0, 0.1, 0.5, 0.8, 1]
  };

  let observer = new IntersectionObserver(iframeIntersection, intersectionOptions);

  for (let element of document.querySelectorAll('[data-resizing-iframe]')) {
    const id = `iframe-${crypto.randomUUID()}`;
    if (!element.id) {
      element.id = id;
    }
    element.dataset['iframeId'] = id;
    iframeMap[id] = element.id;
    element.addEventListener('load', iframeLoaded);
    observer.observe(element);
  }

  const resizeDebounced = debounce(() => {
    for (let element of document.querySelectorAll('[data-resizing-iframe]')) {
      id = element.dataset['iframeId']
      if (!id) {
        return;
      }
      element.contentWindow.postMessage(JSON.stringify({type: 'resized', id}), '*');
    }
  }, 32);

  window.addEventListener('resize', function () {
    resizeDebounced();
  });

  window.addEventListener('message', function (event) {
    try {
      let data = JSON.parse(event.data);
      let synthId = data.id;
      if (!synthId) {
        return;
      }

      let id = iframeMap[synthId];
      if (!id) {
        return;
      }
      let element = document.getElementById(id);
      if (!element) {
        return;
      }
      if (data.type == 'height') {
        let height = data.height;
        if (typeof height == 'number') {
          element.style.height = `${height}px`;
        }
      }
    } catch (e) {
      console.error(e);
    }
  });
})()