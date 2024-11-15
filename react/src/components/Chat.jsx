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
  const [unreadMessages, setUnreadMessages] = useState(0); // Compteur de messages non lus
  const navigate = useNavigate();

  const startChat = (userId) => {
    setCurrentChat(userId);
  };

  // Récupération des informations de l'utilisateur connecté
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

  // Récupération du nombre de messages non lus
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/messages/unread-count", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUnreadMessages(response.data.unreadCount);
      } catch (error) {
        console.error("Erreur lors de la récupération des messages non lus :", error);
      }
    };

    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 5000); // Rafraîchissement toutes les 5 secondes

    return () => clearInterval(interval); // Nettoyage de l'intervalle
  }, []);

  // Mise à jour du compteur de messages non lus lorsque l'utilisateur ouvre une conversation
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!currentChat) return;

      try {
        await axios.post(`http://localhost:8000/api/messages/${currentChat}/mark-as-read`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUnreadMessages(0); // Réinitialiser le compteur
      } catch (error) {
        console.error("Erreur lors de la mise à jour des messages :", error);
      }
    };

    markMessagesAsRead();
  }, [currentChat]);

  // Récupération de la liste des amis
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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
        <UserCircleIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
        <PlusIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
        <div className="relative">
          <InboxIcon className="h-6 w-6 text-gray-500 cursor-pointer" onClick={() => navigate('/chat')} />
          {unreadMessages > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">
              {unreadMessages}
            </span>
          )}
        </div>
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
