/**
 * Updates multiple user documents in Firestore by appending new items to their items array
 * @param {Array<string>} emails - List of user emails to find and update
 * @param {string} itemId - ID of the item to append
 * @param {string} itemName - Name of the item to append
 * @returns {Promise<{success: Array<string>, failed: Array<string>}>} - Lists of successful and failed updates
 */
import { db } from "./configuration"; // Adjust path as needed
import {collection, query, where, updateDoc,getDocs, arrayUnion, doc} from "firebase/firestore";

async function updateUserItems(emails:Array<string> , itemId:string, itemName:string) {
    try {
        const q = query(collection(db, "users"), where("name", "==", "John Doe"));
        const querySnapshot = await getDocs(q);
    
        querySnapshot.forEach(async (document) => {
            const docRef = doc(db, "users", document.id);
            await updateDoc(docRef, { 
                items: arrayUnion({ id: itemId, name: itemName })
             }); // Updating a field
            console.log(`Updated document: ${document.id}`);
        });
    }catch (error) {
        console.error("Error updating user items:", error);
        throw error;
    }

        
}
  
  // Example usage:
  // const emails = ['user1@example.com', 'user2@example.com', 'user3@example.com'];
  // const itemId = 'item123';
  // const itemName = 'Premium Subscription';
  // updateUserItems(emails, itemId, itemName)
  //   .then(results => {
  //     console.log('Update completed.');
  //     console.log(`${results.success.length} users updated successfully.`);
  //     console.log(`${results.failed.length} users failed to update.`);
  //   })
  //   .catch(error => {
  //     console.error('Error in batch update:', error);
  //   });