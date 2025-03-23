import React, { useState, useEffect } from "react";
import { useAuthContext } from "./auth/context"; // Adjust path as needed
import {
  collection,
  query,
  where,
  getDocs,
  documentId,

  Timestamp, doc, arrayUnion, updateDoc,
} from "firebase/firestore";
import { db } from "./configuration"; // Adjust path as needed
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {ExternalLink, Calendar, DollarSign, Users, Gamepad2, Trophy} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {GAME_SERVER_CREATE, GAME_SERVER_PLAY} from "@/GAME_SERVER.ts";
import {SnakeGame, SnakeGameProps} from "@/snake/SnakeGame.tsx";

// Define the prop interface
interface ItemViewProps {
  id: string;
}

// Define the item interface
interface Item {
  itemName: string;
  cost: number;
  imageUrl?: string;
  itemLink?: string;
  // mapping of user ids to amount contributed
  contributions?: { [user_id: string]: number };
  createdAt: Timestamp;
  groupMembers?: string[];
  gameIds?: { created_by: string, game_id: string, time_created: number, prize: string }[];
  gameResults?: { winner: string, prize: string }[];
}

export default function ItemView({ id }: ItemViewProps) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuthContext();

  const [snakeProps, setSnakeProps] = useState<{
    didCreate: boolean,
    props: Omit<SnakeGameProps, "onOver">
  } | undefined>(undefined);

  console.log(snakeProps);

  const [allUsers, setAllUsers] = useState<{ [key: string]: string; } | undefined>(undefined);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const usersCollectionRef = collection(db, "users");
        const querySnapshot = await getDocs(usersCollectionRef);

        const usersMapping: { [key: string]: string } = {}; // Mapping of user IDs to display names
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.displayName) {
            usersMapping[doc.id] = data.displayName;
          }
        });

        setAllUsers(usersMapping);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);


  useEffect(() => {
    async function fetchItems() {
      try {
        if (!user) return;

        const itemsRef = collection(db, "items");
        const q = query(itemsRef, where(documentId(), "==", id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data() as Item;
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

  function formatDate(timestamp: Timestamp | undefined): string {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
            <CardTitle className="text-center text-red-500">
              Item Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">
              The requested item could not be found or you don't have permission
              to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate a cost percentage for progress bar (assuming max cost of 1000)
  // Adjust the max value based on your expected cost range
  const costPercentage = (item.contributions ? Object.values(item.contributions).reduce((s, t) => s + t, 0) / item.cost * 100: 0).toFixed(0);

  console.log("Image URL:", item.imageUrl); // Debug log

  function dailyPlay() {
    if (!item?.groupMembers) alert("No group members found");
    else {
      const prize = prompt("What will the prize for this game be?");
      if (!prize) return;

      fetch(
          GAME_SERVER_CREATE,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({"api_token": "secret_token", "user_ids": item.groupMembers})
          }
      ).then(res => res.json()).then(async (data) => {
        if (data.type !== "Success") alert("error: " + JSON.stringify(data));
        else {
          const game_id: Item['gameIds'][number] = { prize, created_by: user?.uid, game_id:  data.game_id, time_created: Date.now() };

          if (id) {
            const itemDocRef = doc(db, "items", id);

            await updateDoc(itemDocRef, {
              gameIds: arrayUnion(game_id),
            });

            // playgame
            setSnakeProps({
              didCreate: true,
              props: {
                game_id: game_id.game_id,
                all_users: Object.fromEntries(Object.entries(allUsers || {}).filter(([uuid]) => item.groupMembers!.includes(uuid))),
                access_token: user!.uid!,
                user_id: user!.uid!,
                url: GAME_SERVER_PLAY,
                prize
              }
            });
          } else {
            console.error("Item ID is missing. Unable to update gameIds.");
            alert("Error: Unable to link game to the item.");
          }
        }
      })
    }
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-bold">
              {item.itemName}
            </CardTitle>
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
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        console.error("Image failed to load");
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://via.placeholder.com/400x300?text=Image+Not+Available";
                      }}
                    />
                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-tl-md">
                      <ExternalLink size={14} className="inline mr-1" /> Visit
                      Link
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

              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Gamepad2 size={18} className="text-blue-600" /> Play Now
                </h3>
                <div style={{display: 'flex', flexDirection: 'column', placeItems: 'flex-start'}}>
                  <Button onClick={dailyPlay}>Create a Lobby</Button>

                  {item && allUsers && item.gameIds && item.gameIds.map(({game_id, created_by, time_created, prize}) => (
                    <a key={game_id} style={{textDecoration: 'underline'}} onClick={() => {
                      setSnakeProps({
                        didCreate: false,
                        props: {
                          prize,
                          game_id,
                          user_id: user!.uid!,
                          access_token: user!.uid!,
                          url: GAME_SERVER_PLAY,
                          all_users: Object.fromEntries(Object.entries(allUsers).filter(([uuid]) => item.groupMembers!.includes(uuid)))
                        }
                      })
                    }}>
                      <b>Prize: {prize}</b><br/>
                  Game created by {allUsers[created_by]} at {new Date(time_created).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
                </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div>
            
            <div className="">
              <div className="flex justify-between text-sm">
                <span>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <DollarSign size={18} className="text-green-600" /> Amount Raised
                  </h3>
                </span>
                <span className="font-semibold">Goal: ${item.cost}</span>
              </div>
              <Progress value={costPercentage} className="h-2" />
              <p className="text-xs text-gray-500">
                {costPercentage}% of expected goal reached
              </p>


              <div className="mt-4 border-t pt-4">
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Trophy size={18} className="text-purple-600"/> Prizes
                </h3>
                {item?.gameResults && Object.keys(item.gameResults).length > 0 ? (
                    <table className="table-auto w-full border-collapse border border-gray-200 text-sm">
                      <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Winner</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Prize</th>
                      </tr>
                      </thead>
                      <tbody>
                      {Object.entries(item.gameResults).map(([_, {winner, prize}], index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border border-gray-300 px-4 py-2">
                              {allUsers[winner] || "Unknown"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-right">
                              {prize}
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                ) : (
                    <p className="text-sm text-gray-500">No games yet</p>
                )}
              </div>
              
              <div className="mt-4 border-t pt-4">
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Users size={18} className="text-blue-600"/> Contributions
                </h3>
                {item?.contributions && Object.keys(item.contributions).length > 0 ? (
                    <table className="table-auto w-full border-collapse border border-gray-200 text-sm">
                      <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Contributor</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Amount ($)</th>
                      </tr>
                      </thead>
                      <tbody>
                      {Object.entries(item.contributions).map(([contributorId, amount], index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border border-gray-300 px-4 py-2">
                              {allUsers[contributorId] || "Unknown"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-right">
                              {amount.toFixed(2)}
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                ) : (
                    <p className="text-sm text-gray-500">No contributions yet</p>
                )}
              </div>

            </div>


          </div>
        </CardContent>

        <CardFooter className="pt-2 flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>

          <Button
            onClick={() => window.open(item.itemLink, "_blank")}
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

      {
        snakeProps && (
            <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'grid', placeItems: 'center'}}>
              <SnakeGame {...snakeProps.props} onOver={({winner,results}) => setTimeout(async () => {
                
                setSnakeProps(undefined);
                if (snakeProps?.didCreate) {
                  const itemDocRef = doc(db, "items", id);

                  const newContibutions = {...(item?.contributions || {})};
                  for (const contrib of results) {
                    newContibutions[contrib.user_id] = (newContibutions[contrib.user_id] || 0) + contrib.amount_spent;
                  }

                  console.log(newContibutions, {winner, prize: snakeProps.props.prize});

                  await updateDoc(itemDocRef, {
                    contributions: newContibutions,
                    gameIds: [],
                    gameResults: arrayUnion({winner, prize: snakeProps.props.prize}),

                  });
                }

                window.location.reload();
              }, 5000)} />
            </div>
          )
      }
    </div>
  );
}