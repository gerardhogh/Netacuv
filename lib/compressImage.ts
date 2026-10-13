/**
 * Compresse une image côté client via un Canvas HTML5 avant l'envoi HTTP.
 * Réduit les fichiers de 5-10 Mo à ~25-45 Ko en quelques millisecondes.
 */
export async function compressImage(
  file: File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.85
): Promise<File> {
  // Si le fichier est déjà léger (< 50 Ko), pas besoin de retraiter
  if (file.size <= 50 * 1024) return file;

  return new Promise((resolve) => {
    // Si nous ne sommes pas dans un navigateur, retourner le fichier tel quel
    if (typeof window === "undefined" || !window.FileReader) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFileName = file.name.replace(/\.[^.]+$/, ".webp");
              const compressedFile = new File([blob], newFileName, {
                type: "image/webp",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
