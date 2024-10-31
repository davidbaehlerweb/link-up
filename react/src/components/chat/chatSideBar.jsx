// ChatSidebar.js
import React, { useState } from "react";
import { Card, List, ListItem, ListItemPrefix, Typography } from "@material-tailwind/react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { AiOutlineSearch } from "react-icons/ai";

const ChatSidebar = ({ friends, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les amis en fonction du terme de recherche
  const filteredFriends = friends.filter((friend) =>
    friend.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="relative h-full w-full p-4 shadow-xl">
      <Typography variant="h5" color="blue-gray" className="text-center font-bold mb-12">
        Utilisateurs
      </Typography>

      {/* Barre de recherche */}
      <div className="relative mb-4">
        <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <List className="flex-grow overflow-y-auto space-y-3">
        {filteredFriends.map((friend) => (
          <ListItem key={friend.id} onClick={() => onSelectUser(friend.id)} className="cursor-pointer p-3">
            <ListItemPrefix>
              {friend.profile_image ? (
                <img src={`http://localhost:8000/storage/${friend.profile_image}`} alt="Profile" className="h-12 w-12 rounded-full" />
              ) : (
                <UserCircleIcon className="h-12 w-12 text-gray-500" />
              )}
            </ListItemPrefix>
            <Typography className="text-lg font-semibold">{friend.name || friend.email}</Typography>
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export default ChatSidebar;
