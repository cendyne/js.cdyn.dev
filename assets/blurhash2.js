(function () {
  const blurhash = (function (context) {
    // in closure only

    const digitCharacters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~';

    const decode83 = str => {
      let value = 0;
      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        const digit = digitCharacters.indexOf(c);
        value = value * 83 + digit;
      }
      return value;
    };

    const sRGBToLinear = value => {
      let v = value / 255;
      if (v <= 0.04045) {
        return v / 12.92;
      } else {
        return Math.pow((v + 0.055) / 1.055, 2.4);
      }
    };

    const linearTosRGB = value => {
      let v = Math.max(0, Math.min(1, value));
      if (v <= 0.0031308) {
        return Math.round(v * 12.92 * 255 + 0.5);
      } else {
        return Math.round(
          (1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255 + 0.5
        );
      }
    };

    const sign = n => (n < 0 ? -1 : 1);

    const signPow = (val, exp) => sign(val) * Math.pow(Math.abs(val), exp);

    const validateBlurhash = blurhash => {
      if (!blurhash || blurhash.length < 6) {
        throw new Error(
          "The blurhash string must be at least 6 characters"
        );
      }

      const sizeFlag = decode83(blurhash[0]);
      const numY = Math.floor(sizeFlag / 9) + 1;
      const numX = (sizeFlag % 9) + 1;

      if (blurhash.length !== 4 + 2 * numX * numY) {
        throw new Error(
          `blurhash length mismatch: length is ${blurhash.length
          } but it should be ${4 + 2 * numX * numY}`
        );
      }
    };

    const decodeDC = value => {
      const intR = value >> 16;
      const intG = (value >> 8) & 255;
      const intB = value & 255;
      return [sRGBToLinear(intR), sRGBToLinear(intG), sRGBToLinear(intB)];
    };

    const decodeAC = (value, maximumValue) => {
      const quantR = Math.floor(value / (19 * 19));
      const quantG = Math.floor(value / 19) % 19;
      const quantB = value % 19;

      const rgb = [
        signPow((quantR - 9) / 9, 2.0) * maximumValue,
        signPow((quantG - 9) / 9, 2.0) * maximumValue,
        signPow((quantB - 9) / 9, 2.0) * maximumValue
      ];

      return rgb;
    };

    // context

    /**
     * @param {String} blurhash
     * @param {Number} width
     * @param {Number} height
     * @param {Number} punch
     * @returns {Promise<Uint8ClampedArray>}
     */
    context.decodePromise = (blurhash, width, height, punch = 1.0) => {
      return new Promise((resolve, reject) => {
        resolve(context.decode(blurhash, width, height, punch));
      });
    };

    /**
     * @param {String} blurhash
     * @param {Number} width
     * @param {Number} height
     * @param {Number} punch
     * @returns {Uint8ClampedArray}
     */
    context.decode = (blurhash, width, height, punch = 1.0) => {
      validateBlurhash(blurhash);

      punch = punch | 1;

      const sizeFlag = decode83(blurhash[0]);
      const numY = Math.floor(sizeFlag / 9) + 1;
      const numX = (sizeFlag % 9) + 1;

      const quantisedMaximumValue = decode83(blurhash[1]);
      const maximumValue = (quantisedMaximumValue + 1) / 166;

      const colors = new Array(numX * numY);

      for (let i = 0; i < colors.length; i++) {
        if (i === 0) {
          const value = decode83(blurhash.substring(2, 6));
          colors[i] = decodeDC(value);
        } else {
          const value = decode83(
            blurhash.substring(4 + i * 2, 6 + i * 2)
          );
          colors[i] = decodeAC(value, maximumValue * punch);
        }
      }

      const bytesPerRow = width * 4;
      const pixels = new Uint8ClampedArray(bytesPerRow * height);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let r = 0;
          let g = 0;
          let b = 0;

          for (let j = 0; j < numY; j++) {
            for (let i = 0; i < numX; i++) {
              const basis =
                Math.cos((Math.PI * x * i) / width) *
                Math.cos((Math.PI * y * j) / height);
              let color = colors[i + j * numX];
              r += color[0] * basis;
              g += color[1] * basis;
              b += color[2] * basis;
            }
          }

          let intR = linearTosRGB(r);
          let intG = linearTosRGB(g);
          let intB = linearTosRGB(b);

          pixels[4 * x + 0 + y * bytesPerRow] = intR;
          pixels[4 * x + 1 + y * bytesPerRow] = intG;
          pixels[4 * x + 2 + y * bytesPerRow] = intB;
          pixels[4 * x + 3 + y * bytesPerRow] = 255; // alpha
        }
      }
      return pixels;
    };

    return context;
  })({});

  const numRegex = /^\d+$/;
  let observer = new IntersectionObserver((entries) => {
    for (let entry of entries) {
      if (entry.isIntersecting && entry.target.cloned) {
        entry.target.cloned.loading = 'eager';
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.1 });

  for (let img of document.querySelectorAll('img[data-blurhash]')) {
    try {
      let hash = img.dataset['blurhash'];
      let rect = img.parentElement.getBoundingClientRect();
      let width = rect.width;
      let height = rect.width / 16 * 9;
      let sWidth = img.dataset['width'];
      if (sWidth && sWidth.match(numRegex)) {
        width = Number.parseInt(sWidth);
      }
      let sHeight = img.dataset['height'];
      if (sHeight && sHeight.match(numRegex)) {
        height = Number.parseInt(sHeight);
      }
      const w = Math.min(width, rect.width);
      let addStyle = img.dataset['noStyle'] === undefined;
      if (addStyle) {
        img.style.height = `${height / (width / w)}px`
        img.style.width = `${w}px`;
      }
      if (img.complete) {
        continue;
      }
      var loaded = false;
      var blurhashApplied = false;
      img.addEventListener('load', (event) => {
        if (!blurhashApplied) {
          loaded = true;
          // Remove temporary styling.
          if (addStyle) {
            requestAnimationFrame(() => {
              img.style.height = null;
              img.style.width = null;
            });
          }
        }
      })
      let cloned = img.cloneNode();
      img.cloned = cloned;
      if (img.loading == 'lazy') {
        observer.observe(img);
      }

      cloned.addEventListener('load', (event) => {
        img.replaceWith(cloned);
        loaded = true;
        // Remove temporary styling.
        if (addStyle) {
          event.target.style.height = null;
          event.target.style.width = null;
        }
      })
      requestAnimationFrame(() => {
        if (loaded || img.complete) {
          return;
        }
        let dim = 64;
        if ('ontouchstart' in window) {
          // Mobile devices have less CPU resources
          dim = 16;
        }
        const blurhashImgData = blurhash.decode(hash, dim, dim);
        if (blurhashImgData.length <= 0) {
          return;
        }
        const sourceCanvas = document.createElement("canvas");
        let ctx = sourceCanvas.getContext("2d");

        sourceCanvas.width = dim;
        sourceCanvas.height = dim;
        ctx.width = dim;
        ctx.height = dim;
        ctx.putImageData(new ImageData(blurhashImgData, dim, dim), 0, 0);
        sourceCanvas.toBlob(blob => {
          if (loaded || img.complete) {
            return;
          }
          const objectUrl = URL.createObjectURL(blob);
          img.src = objectUrl;
          blurhashApplied = true;

          var listener = () => {
            URL.revokeObjectURL(objectUrl);
            img.removeEventListener('load', listener);
          };
          img.addEventListener('load', listener);
        });
      });
    } catch (e) {
      if (console && console.error) {
        console.error(e)
      }
    }
  }
})()
