// Chat.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  HomeIcon,
  PlusIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  PowerIcon,
  InboxIcon,
} from "@heroicons/react/24/solid";
import ChatSidebar from "./chat/chatSideBar";
import ChatRoom from "./chat/chatRoom";

const Chat = () => {
  const [currentChat, setCurrentChat] = useState(null);
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  const startChat = (userId) => {
    setCurrentChat(userId);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/friends", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setFriends(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération de la liste d'amis :", error);
      }
    };
    fetchFriends();
  }, []);

  return (
    <div className="flex h-screen">
      {/* ChatSidebar collée à la ChatRoom */}
      <div className="w-64 h-full bg-gray-100 shadow-md overflow-y-auto">
        <ChatSidebar friends={friends} onSelectUser={startChat} />
      </div>

      {/* ChatRoom */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <ChatRoom userId={currentChat} />
        ) : (
          <p className="text-center text-gray-500 mt-20">Sélectionnez un utilisateur pour démarrer une conversation</p>
        )}
      </div>

      {/* Barre de navigation inférieure */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-4 flex justify-around">
        <a href="/home">
          <HomeIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
        </a>
        <UserCircleIcon
          className="h-6 w-6 text-gray-500 cursor-pointer"
          onClick={() => {}}
        />
        <PlusIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
        <InboxIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
        {user && (
          user.profile_image ? (
            <img
              src={`http://localhost:8000/storage/${user.profile_image}`}
              alt="Profile"
              className="h-6 w-6 rounded-full cursor-pointer"
              onClick={() => navigate(`/profile/${user.id}`)}
            />
          ) : (
            <UserCircleIcon className="h-6 w-6 text-gray-500 cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)} />
          )
        )}
        <Cog6ToothIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
        <PowerIcon onClick={handleLogout} className="h-6 w-6 text-red-500 cursor-pointer" />
      </div>
    </div>
  );
};

export default Chat;
