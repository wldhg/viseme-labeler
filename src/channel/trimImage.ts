import getPixels from 'get-pixels';
import savePixels from 'save-pixels';
import fs from 'fs';

export default (
  filename: string,
  filenameOut: string,
  cb: (err: Error | null) => void
) => {
  getPixels(filename, (err, pixels) => {
    if (err) {
      cb(new Error(`Bad image path: ${filename}`));
      return;
    }

    const w = pixels.shape[0];
    const h = pixels.shape[1];

    let i;
    let j;
    let a;

    const cropData = {
      top: 0,
      right: w,
      bottom: h,
      left: 0,
    };

    let breakSign = false;

    for (j = 0; j < h; j += 1) {
      cropData.top = j;

      for (i = 0; i < w; i += 1) {
        a = pixels.get(i, j, 3);

        if (a !== 0) {
          breakSign = true;
          break;
        }
      }

      if (breakSign) {
        breakSign = false;
        break;
      }
    }

    for (i = w - 1; i >= 0; i -= 1) {
      for (j = h - 1; j >= 0; j -= 1) {
        a = pixels.get(i, j, 3);

        if (a !== 0) {
          breakSign = true;
          break;
        }
      }

      if (breakSign) {
        breakSign = false;
        break;
      }

      cropData.right = i;
    }

    for (j = h - 1; j >= 0; j -= 1) {
      for (i = w - 1; i >= 0; i -= 1) {
        a = pixels.get(i, j, 3);

        if (a !== 0) {
          breakSign = true;
          break;
        }
      }

      if (breakSign) {
        breakSign = false;
        break;
      }

      cropData.bottom = j;
    }

    for (i = 0; i < w; i += 1) {
      cropData.left = i;

      for (j = 0; j < h; j += 1) {
        a = pixels.get(i, j, 3);

        if (a !== 0) {
          breakSign = true;
          break;
        }
      }

      if (breakSign) {
        breakSign = false;
        break;
      }
    }

    // Check error
    if (cropData.left > cropData.right || cropData.top > cropData.bottom) {
      cb(new Error(`Crop coordinates overflow: ${filename}`));
    } else {
      savePixels(
        pixels
          .hi(cropData.right, cropData.bottom)
          .lo(cropData.left, cropData.top),
        'png'
      )
        .pipe(fs.createWriteStream(filenameOut))
        .on('finish', () => {
          cb(null);
        });
    }
  });
};
