// src/services/imageService.js
// Encapsulates Firebase Storage operations

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseApp } from "../../firebase/firebaseConfig";

class ImageService {
  constructor() {
    this.storage = getStorage(firebaseApp);
  }

  /**
   * Upload multiple files and return their download URLs
   * @param {string} productId
   * @param {FileList|File[]} files
   * @returns {Promise<string[]>}
   */
  async uploadImages(productId, files) {
    // Convert FileList to Array if needed
    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(async (file) => {
      // Create a storage ref under products/{productId}/filename_timestamp
      const path = `products/${productId}/${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, path);
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      // Get download URL
      return getDownloadURL(snapshot.ref);
    });
    return Promise.all(uploadPromises);
  }
}

export const imageService = new ImageService();
