// Utility for handling file uploads (mock)

// Convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Compress image using Canvas API (to fit in localStorage)
export const compressImage = (base64Str, maxWidth = 800, maxHeight = 800) => {
  return new Promise((resolve) => {
    let img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height *= maxWidth / width));
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width *= maxHeight / height));
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      let ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality JPEG
    };
    img.onerror = () => resolve(base64Str); // Fallback to original if error
  });
};

// Validation for Design Files
export const validateDesignFile = (file) => {
  const allowedExtensions = ['application/pdf', 'application/postscript', 'application/illustrator', 'image/png', 'image/jpeg'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB for mock localStorage limits, normally 50MB

  if (!allowedExtensions.includes(file.type)) {
    // Note: CDR might not have a reliable mime type in browsers, might need filename check
    if (!file.name.toLowerCase().endsWith('.cdr') && !file.name.toLowerCase().endsWith('.ai')) {
      return { valid: false, error: 'Format file tidak didukung. Gunakan PDF, AI, CDR, PNG, atau JPG.' };
    }
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, error: 'Ukuran file terlalu besar untuk simulasi (Maks 5MB).' };
  }

  return { valid: true };
};

// Validation for Payment Proof
export const validatePaymentProof = (file) => {
  const allowedExtensions = ['image/jpeg', 'image/png'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB

  if (!allowedExtensions.includes(file.type)) {
    return { valid: false, error: 'Format file tidak didukung. Gunakan JPG atau PNG.' };
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, error: 'Ukuran file terlalu besar (Maks 5MB).' };
  }

  return { valid: true };
};
