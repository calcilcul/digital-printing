import { useState } from 'react';
import { fileToBase64, compressImage, validateDesignFile, validatePaymentProof } from '../utils/fileUpload';
import toast from 'react-hot-toast';

export function useFileUpload(type = 'design') { // 'design' or 'payment'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileData, setFileData] = useState(null);

  const handleUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Validation
      const validation = type === 'design' ? validateDesignFile(file) : validatePaymentProof(file);
      if (!validation.valid) {
        toast.error(validation.error);
        setIsUploading(false);
        return false;
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // 2. Convert to Base64
      let base64Str = await fileToBase64(file);

      // 3. Compress if it's an image
      if (file.type.startsWith('image/')) {
        base64Str = await compressImage(base64Str);
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = {
        name: file.name,
        type: file.type,
        size: file.size,
        base64: base64Str,
        uploadedAt: new Date().toISOString()
      };

      setFileData(result);
      setIsUploading(false);
      return result;

    } catch (error) {
      console.error("Upload error:", error);
      toast.error('Gagal mengupload file. Silakan coba lagi.');
      setIsUploading(false);
      return false;
    }
  };

  const clearFile = () => {
    setFileData(null);
    setUploadProgress(0);
  };

  return {
    isUploading,
    uploadProgress,
    fileData,
    handleUpload,
    clearFile
  };
}
