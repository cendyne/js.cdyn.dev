(function(){
  let latestEvent, iframeId;
  const update = (rect) => {
    if (latestEvent && iframeId) {
      latestEvent.source.postMessage(JSON.stringify({
        type: 'height',
        id: iframeId,
        height: Math.ceil(rect.height + rect.top * 2)
      }), latestEvent.origin)
    }
  };
  const calcRect = () => {
    let bodyRect = document.body.getClientRects()[0];
    let height = 0;
    for (let elem of document.body.children) {
      let rect = elem.getClientRects()[0];
      if (rect) {
        height += rect.top + rect.height;
      }
    }
    return new DOMRect(0, 0, bodyRect.width, height);
  }
  const observer = new MutationObserver(() => {
    update(calcRect())
  });

  observer.observe(document.body, {subtree: true, attributes: true});
  window.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      const type = data.type;
      if (!type) {
        return;
      }
      latestEvent = event;
      iframeId = data.id;
      if (type == 'loaded' || type == 'resized' || type == 'intersection') {
        window.requestAnimationFrame(()=>{
          update(calcRect());
        });
      }
      if (type == 'intersection') {
        let counter = 0;
        let interval;
        // Watch out for lazy loading for the next few seconds
        interval = setInterval(() => {
          update(calcRect())
          counter++;
          if (counter > 20) {
            clearInterval(interval);
          }
        }, 200);
      }
    } catch (e) {
      console.error(e);
    }
  });
  let loadingInterval = setInterval(() => {
    update(calcRect());
  }, 100);
  document.addEventListener("readystatechange", (event) => {
    window.requestAnimationFrame(()=>{
      update(calcRect());
    });
    if (event.target.readyState === "complete") {
      clearInterval(loadingInterval);
    }
  });

})();
