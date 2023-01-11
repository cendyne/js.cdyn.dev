for (let element of document.querySelectorAll('[data-background]')) {
  let background = element.dataset['background'];
  element.style.backgroundImage = `url('${background}')`;
}
for (let element of document.querySelectorAll('[data-ratio]')) {
  let width = element.dataset['width'];
  let height = element.dataset['height'];
  element.style.aspectRatio = `${width} / ${height}`;
}
for (let element of document.querySelectorAll('[data-set-width]')) {
  let width = element.dataset['width'];
  element.style.width = `${width}px`;
}
