import React, { useState, useEffect } from 'react';
import { useAuthContext } from './auth/context'; // Adjust path as needed
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from './configuration'; // Adjust path as needed
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  Users 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ItemView({ id }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  
  useEffect(() => {
    async function fetchItems() {
      try {
        if (!user) return;
        
        const itemsRef = collection(db, 'items');
        const q = query(itemsRef, where(documentId(), '==', id));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          console.log("Document data:", docData);
          setItem(docData);
        } else {
          console.log("No item data found!");
        }
      } catch (error) {
        console.error("Error fetching item:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchItems();
  }, [user, id]);
  
  function formatDate(timestamp) {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-xl">Loading item details...</div>
      </div>
    );
  }
  
  if (!item) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Item Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">The requested item could not be found or you don't have permission to view it.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Calculate a cost percentage for progress bar (assuming max cost of 1000)
  // Adjust the max value based on your expected cost range
  const costPercentage = Math.min(Math.round((item.cost / 1000) * 100), 100);

  console.log("Image URL:", item.imageUrl); // Debug log
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-bold">{item.itemName}</CardTitle>
            <Badge variant="outline" className="bg-blue-100">
              ${item.cost}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column with image */}
            <div className="md:col-span-2 h-full flex items-center justify-center">
              {item.imageUrl ? (
                <a 
                  href={item.itemLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={item.imageUrl} 
                      alt={item.itemName}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error("Image failed to load");
                        e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
                      }}
                    />
                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-tl-md">
                      <ExternalLink size={14} className="inline mr-1" /> Visit Link
                    </div>
                  </div>
                </a>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
            
            {/* Right column with details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <DollarSign size={18} className="text-green-600" /> Cost
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cost Amount</span>
                    <span className="font-semibold">${item.cost}</span>
                  </div>
                  <Progress value={costPercentage} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {costPercentage}% of expected cost range
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-600" /> Created
                </h3>
                <p>{formatDate(item.createdAt)}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Users size={18} className="text-purple-600" /> Group Members
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.groupMembers && item.groupMembers.length > 0 ? (
                    item.groupMembers.map((member, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger>
                            <Avatar className="h-8 w-8 bg-slate-200">
                              <AvatarFallback>
                                {member.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{member}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No group members</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            Back
          </Button>
          
          <Button 
            onClick={() => window.open(item.itemLink, '_blank')}
            className="flex items-center gap-2"
          >
            Visit Item <ExternalLink size={16} />
          </Button>
        </CardFooter>
      </Card>

      {/* Debug section - remove in production 
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium mb-2">Debug Information:</h3>
        <p>Image URL: {item.imageUrl || "No image URL"}</p>
        <p>Item Link: {item.itemLink || "No link"}</p>
      </div>
      */}
    </div>
  );
}