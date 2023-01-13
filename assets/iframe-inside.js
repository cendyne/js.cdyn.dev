(function(){
  let latestEvent, iframeId;
  const update = (rect) => {
    if (latestEvent && iframeId) {
      latestEvent.source.postMessage(JSON.stringify({
        type: 'height',
        id: iframeId,
        height: rect.height + rect.top * 2
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

  window.addEventListener('load', () => {
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
        switch (type) {
          case 'loaded':
          case 'resized': {
            update(calcRect());
            break;
          }
        }
      } catch (e) {
        console.error(e);
      }
    });
  })

})();
