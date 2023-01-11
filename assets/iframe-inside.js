window.addEventListener('message', (event) => {
  try {
    const data = JSON.parse(event.data);
    const type = data.type;
    if (type == 'resized' || type == 'loaded') {
      requestAnimationFrame(() => {
        const rect = document.getElementById('body').getBoundingClientRect();
        event.source.postMessage(JSON.stringify({
          type: 'height',
          id: data.id,
          height: rect.height + rect.top * 2
        }), event.origin)
      })
    }
  } catch (e) {
    console.error(e);
  }
});
