import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "./configuration"; // Your Firebase config

// Function to handle image upload and save image URL to Firestore
interface FormData {
    [key: string]: any; // Adjust this based on the expected structure of formData
}

interface UploadResult {
    success: boolean;
    id: string;
    imageUrl: string;
}

export async function uploadImageAndSaveData(
    file: File,
    formData: FormData,
    userId: string,
): Promise<UploadResult> {
    try {
        // 1. Upload image to Firebase Storage
        const storage = getStorage();
        
        // Create a unique path for the file
        const filePath = `items/${userId}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, filePath);
        
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);
        console.log("File uploaded successfully");
        
        // 2. Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("File URL:", downloadURL);
        
        // 3. Save the form data with the image URL to Firestore
        const itemData = {
            ...formData,
            imageUrl: downloadURL,
            imagePath: filePath, // Store the path for future reference or deletion
            createdAt: new Date(),
            userId: userId
        };
        
        // Add to a collection
        const docRef = await addDoc(collection(db, "items"), itemData);
        
        return {
            success: true,
            id: docRef.id,
            imageUrl: downloadURL
        };
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}