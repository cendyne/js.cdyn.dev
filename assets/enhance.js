for (let element of document.querySelectorAll('[data-background],[data-background-color]')) {
  let background = element.dataset['background'];
  let color = element.dataset['backgroundColor'];
  if (background) {
    element.style.backgroundImage = `url('${background}')`;
  }
  if (color) {
    element.style.backgroundColor = color;
  }
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
