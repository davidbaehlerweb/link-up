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
 
  const [unreadMessages, setUnreadMessages] = useState(0); // Compteur de messages non lus
 
  const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showUserList, setShowUserList] = useState(false);
    const [showFriendRequestPopup, setShowFriendRequestPopup] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [requestCount, setRequestCount] = useState(0); // État pour le nombre de demandes d'amis
    const [sentRequests, setSentRequests] = useState([]);

  const startChat = (userId) => {
    setCurrentChat(userId);
  };

  useEffect(() => {
    const storedRequests = JSON.parse(localStorage.getItem('sentRequests')) || [];
    setSentRequests(storedRequests);
}, []);


useEffect(() => {
    const fetchUser = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/user', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUser(response.data.user);
        } catch (err) {
            console.error('Unable to fetch user data', err);
        } finally {
            setLoading(false);
        }
    };

    fetchUser();
}, []);

useEffect(() => {
    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Unable to fetch users', err);
        }
    };

    fetchUsers();
}, []);
const [sendingRequest, setSendingRequest] = useState(null);
const sendFriendRequest = async (friendId) => {
    const isAlreadyFriend = friends.some(friend => friend.id === friendId);
    const hasPendingRequest = sentRequests.includes(friendId);

    if (isAlreadyFriend) {
        alert("Vous êtes déjà amis avec cet utilisateur.");
        return;
    }

    // Marquer la demande comme en cours d'envoi
    setSendingRequest(friendId);

    try {
        await axios.post(`http://localhost:8000/api/friend-requests`, {
            friend_id: friendId,
        }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const updatedRequests = [...sentRequests, friendId];
        setSentRequests(updatedRequests);
        localStorage.setItem('sentRequests', JSON.stringify(updatedRequests));
        fetchFriendRequests();
    } catch (error) {
        console.error("Erreur lors de l'envoi de la demande d'amis:", error);
    } finally {
        // Réinitialiser le statut d'envoi après une seconde pour simuler le retour à l'état normal
        setTimeout(() => {
            setSendingRequest(null);
        }, 2000);
    }
};


const fetchFriendRequests = async () => {
    try {
        const response = await axios.get('http://localhost:8000/api/friend-requests/retrieve', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const requestsWithUserData = await Promise.all(response.data.map(async (request) => {
            const userResponse = await axios.get(`http://localhost:8000/api/users/${request.sender_id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return { ...request, sender: userResponse.data };
        }));
        setReceivedRequests(requestsWithUserData);
        setRequestCount(requestsWithUserData.length); // Met à jour le compteur de demandes
    } catch (err) {
        console.error('Unable to fetch friend requests', err);
    }
};

const fetchFriends = async () => {
    try {
        const response = await axios.get('http://localhost:8000/api/friends', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        setFriends(response.data);
    } catch (err) {
        console.error('Unable to fetch friends', err);
    }
};

useEffect(() => {
    fetchFriendRequests();
    fetchFriends();
}, []);

useEffect(() => {
    if (searchTerm.trim() === "") {
        setFilteredUsers([]);
    } else {
        const results = users.filter(userItem =>
            userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) && userItem.id !== user.id // Exclure l'utilisateur connecté
        );
        setFilteredUsers(results);
    }
}, [searchTerm, users, user]); // Ajoute `user` comme dépendance




const navigateToProfile = (userId) => {
    if (userId) {
        navigate(`/profile/${userId}`);
    }
};

const navigateToSettings = (userId) => {
    if (userId) {
        navigate('/settings');
    }
};

const handleAcceptRequest = async (requestId) => {
    try {
        await axios.post(`http://localhost:8000/api/friend-requests/${requestId}/accept`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        fetchFriendRequests();
        fetchFriends();
    } catch (error) {
        console.error("Erreur lors de l'acceptation de la demande:", error);
    }
};

const handleRejectRequest = async (requestId) => {
    try {
        await axios.post(`http://localhost:8000/api/friend-requests/${requestId}/reject`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        // Mettre à jour sentRequests pour enlever la demande rejetée
        setSentRequests((prevRequests) => prevRequests.filter(request => request !== requestId));

        fetchFriendRequests();
    } catch (error) {
        console.error("Erreur lors du refus de la demande:", error);
    }
};


const navigateToUserProfile = (userId) => {
    navigate(`/profile-user/${userId}`);
};
const navigateToChat = () => {
if (user?.id) {
  navigate(`/chat`);
}
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
        <div className="relative">
                            <UserCircleIcon
                                className="h-6 w-6 text-gray-500 cursor-pointer"
                                onClick={() => setShowFriendRequestPopup(true)}
                            />
                            {requestCount > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">
                                    {requestCount}
                                </span>
                            )}
                        </div>
                        <PlusIcon
                            className="h-6 w-6 text-gray-500 cursor-pointer"
                            onClick={() => setShowUserList(true)}
                        />
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
            <UserCircleIcon className="h-6 w-6 text-gray-500 cursor-pointer"
                                    onClick={() => navigateToProfile(user.id)} />
          )
        )}
        <Cog6ToothIcon className="h-6 w-6 text-gray-500 cursor-pointer" onClick={navigateToSettings} />
        <PowerIcon onClick={handleLogout} className="h-6 w-6 text-red-500 cursor-pointer" />
        {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-5 shadow-lg max-w-sm">
                        <h3 className="text-xl font-bold">Déconnexion réussie !</h3>
                        <p className="mt-2">Vous êtes déconnecté avec succès.</p>
                    </div>
                </div>
            )}

            {showUserList && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-5 shadow-lg max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4">Recherche d'utilisateurs</h3>
                        <input
                            type="text"
                            placeholder="Rechercher par email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded p-2 w-full mb-4"
                        />
                        <div className="max-h-60 overflow-y-auto">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const isAlreadyFriend = friends.some(friend => friend.id === user.id);
                                    const hasPendingRequest = sentRequests.includes(user.id);
                                    const isSending = sendingRequest === user.id; // Vérifier si une demande est en cours pour cet utilisateur

                                    return (
                                        <div key={user.id} className="flex justify-between items-center mb-2">
                                            <span>{user.email}</span>
                                            <div>
                                                {isAlreadyFriend ? (
                                                    <p className="text-green-500">Déjà amis</p>
                                                ) : isSending ? (
                                                    <button className="bg-gray-300 text-black px-4 py-2 rounded">
                                                        Demande envoyée...
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="bg-blue-500 text-white px-4 py-2 rounded"
                                                        onClick={() => sendFriendRequest(user.id)}
                                                    >
                                                        Ajouter
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p>Aucun utilisateur trouvé.</p>
                            )}


                        </div>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
                            onClick={() => setShowUserList(false)}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            {showFriendRequestPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-5 shadow-lg max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4">Demandes d'amis</h3>
                        {receivedRequests.length === 0 ? (
                            <p>Aucune demande d'amis reçue.</p>
                        ) : (
                            receivedRequests.map(request => (
                                <div key={request.id} className="flex items-center justify-between p-2 border-b border-gray-200">
                                    {/* Vérifie si request.sender est valide */}

                                    {request.sender ? (
                                        <>
                                            {request.sender.profile_image ? (
                                                <img
                                                    src={`http://localhost:8000/storage/${request.sender.profile_image}`}
                                                    alt="Profile"
                                                    className="h-8 w-8 rounded-full"
                                                />
                                            ) : (
                                                <UserCircleIcon className="h-8 w-8 text-gray-500 rounded-full" />
                                            )}
                                            <span className="flex-grow ml-2">{request.sender.email}</span>
                                            <div>
                                                <button
                                                    onClick={() => handleAcceptRequest(request.id)}
                                                    className="bg-green-500 text-white rounded px-2 py-1 text-sm mr-2"
                                                >
                                                    Accepter
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(request.id)}
                                                    className="bg-red-500 text-white rounded px-2 py-1 text-sm"
                                                >
                                                    Refuser
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="flex-grow ml-2">Utilisateur non trouvé</span>
                                    )}
                                </div>
                            ))
                        )}
                        <h3 className="text-xl font-bold mb-4">Mes amis</h3>
                        {friends.length === 0 ? (
                            <p>Aucun ami trouvé.</p>
                        ) : (
                            friends.map(friend => (
                                <div key={friend.id} className="flex items-center p-2 border-b border-gray-200">
                                    {friend.profile_image ? (
                                        <img
                                            src={`http://localhost:8000/storage/${friend.profile_image}`}
                                            alt="Profile"
                                            className="h-8 w-8 rounded-full"
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-8 w-8 text-gray-500 rounded-full" />
                                    )}
                                    <span className="flex-grow ml-2">{friend.email}</span>
                                </div>
                            ))
                        )}
                        <button
                            onClick={() => setShowFriendRequestPopup(false)}
                            className="mt-4 bg-red-500 text-white rounded px-4 py-2"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
      
      </div>
    </div>
  );
};

export default Chat;
