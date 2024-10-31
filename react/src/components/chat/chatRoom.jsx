import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiSend } from "react-icons/fi";

const ChatRoom = ({ userId }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [authUserId, setAuthUserId] = useState(null); // ID de l'utilisateur authentifié
  const messagesEndRef = useRef(null); // Référence pour le dernier message

  useEffect(() => {
    // Récupérer l'ID de l'utilisateur authentifié
    const fetchAuthUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAuthUserId(response.data.user);
        console.log("Utilisateur authentifié:", response.data.user); // Log pour vérifier l'utilisateur authentifié
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur authentifié :", error.response || error.message);
      }
    };

    fetchAuthUser();
  }, []);

  useEffect(() => {
    // Récupérer les messages uniquement si l'ID de l'utilisateur authentifié est défini
    const fetchMessages = async () => {
      if (userId) {
        try {
          const response = await axios.get(`http://localhost:8000/api/messages/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          console.log("Messages reçus du serveur :", response.data);
          setMessages([...response.data]);
        } catch (error) {
          console.error("Erreur lors de la récupération des messages :", error.response || error.message);
        }
      }
    };

    fetchMessages();

    // Sondage régulier toutes les 5 secondes
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [userId, authUserId]);

  useEffect(() => {
    // Faire défiler vers le bas à chaque fois que messages est mis à jour
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      const response = await axios.post(
        "http://localhost:8000/api/messages",
        { receiver_id: userId, content: newMessage },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      console.log("Message envoyé :", response.data);
      setMessages([...messages, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error.response || error.message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Liste des messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-white border rounded-lg pb-20" style={{ maxHeight: "80vh" }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 ${msg.sender_id === authUserId.id ? "text-right" : "text-left"}`}
          >
            <p
              className={`p-2 rounded-lg inline-block ${
                msg.sender_id === userId ? "bg-blue-100" : "bg-gray-200"
              }`}
            >
              {msg.content}
            </p>
          </div>
        ))}
        {/* Référence pour faire défiler jusqu'à ce point */}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie de message */}
      <div
        className="p-4 bg-gray-100 border-t rounded-full border-gray-300 flex items-center fixed bottom-16"
        style={{ left: "16rem", right: "0" }}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-full mr-2"
          placeholder="Écrire un message..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center justify-center">
          <FiSend className="text-white" size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
