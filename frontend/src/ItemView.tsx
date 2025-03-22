import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./configuration";
import { useAuthContext } from "./auth/context";


function ItemView(id:string) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  
  useEffect(() => {
    async function fetchItems() {
      try {
        if (!user) return;
        
        const querySnapshot = db.collection('items').doc(id).get();
        console.log()
        const itemsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setItems(itemsData);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchItems();
  }, [user]);
  
  if (loading) return <div>Loading items...</div>;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(item => (
        <div key={item.id} className="border rounded p-4">
          <h3 className="text-lg font-bold">{item.itemName}</h3>
          
          {/* Display the image */}
          {item.imageUrl && (
            <img 
              src={item.imageUrl} 
              alt={item.itemName}
              className="w-full h-48 object-cover my-2 rounded"
            />
          )}
          
          <p>Cost: ${item.cost}</p>
          {/* Other item details */}
        </div>
      ))}
    </div>
  );
}