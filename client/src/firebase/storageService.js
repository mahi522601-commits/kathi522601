import uploadApi from '../api/uploadApi';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadProductImages(files, productName = 'product') {
  if (!files?.length) {
    return [];
  }

  const prepared = await Promise.all(
    files.map(async (file, index) => ({
      base64: await fileToBase64(file),
      name: `${productName}-${index + 1}`,
    })),
  );

  return uploadApi.uploadMultiple(prepared, productName);
}

export async function uploadPaymentScreenshot(file, name = 'payment-proof') {
  if (!file) {
    return null;
  }

  const base64 = await fileToBase64(file);
  return uploadApi.uploadPaymentProof(base64, `${name}-${Date.now()}`);
}
