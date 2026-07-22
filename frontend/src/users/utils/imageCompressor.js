/**
 * Utility to compress and resize image files client-side before uploading.
 * Prevents payload/upload size limits from being exceeded, speeds up uploads,
 * and preserves aspect ratio.
 */
export const compressImage = (
  file,
  { maxWidth = 1920, maxHeight = 1920, quality = 0.85 } = {}
) => {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      return resolve(file);
    }

    if (file.type === "image/svg+xml" || file.type === "image/gif") {
      return resolve(file);
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to WebP for maximum storage savings (~80% smaller) and instant loading
        const targetType = "image/webp";

        canvas.toBlob(
          (blob) => {
            if (!blob || (blob.size >= file.size && file.type === "image/webp")) {
              resolve(file);
            } else {
              const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
              const compressedFile = new File([blob], newName, {
                type: blob.type || targetType,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            }
          },
          targetType,
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};
