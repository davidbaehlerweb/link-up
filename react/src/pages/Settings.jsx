import React, { useState, useEffect } from 'react';
import { HomeIcon, PlusIcon, UserCircleIcon, Cog6ToothIcon, PowerIcon, InboxIcon, PencilIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import DarkModeToggle from './DarkModeToggle';

function Settings() {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showFriendRequestPopup, setShowFriendRequestPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [users, setUsers] = useState([]);
  const [requestCount, setRequestCount] = useState(0);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false); // Pour afficher la popup
  const [editField, setEditField] = useState(""); // Le champ à modifier (nom, email, mot de passe)
  const [editValue, setEditValue] = useState(""); // La nouvelle valeur de l'input
  const navigate = useNavigate();
  const [receivedRequests, setReceivedRequests] = useState([]);
 // État pour le nombre de demandes d'amis
  const [sentRequests, setSentRequests] = useState([]);


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


const handleLogout = async () => {
    try {
        await axios.post('http://localhost:8000/api/logout', {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        localStorage.removeItem('token');
        setShowModal(true);
        setTimeout(() => {
            navigate('/');
        }, 2000);
    } catch (error) {
        console.error('Erreur lors de la déconnexion', error);
    }
};

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


  const navigateToChat = (userId) => {
    if (userId) {
      navigate(`/chat`);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get('http://localhost:8000/api/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUser(userResponse.data.user);
      } catch (err) {
        console.error('Unable to fetch user data', err);
      }
    };
    fetchUserData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const handleEdit = (field) => {
    setEditField(field);
    setEditValue(field === "password" ? "" : user[field]); // Vide pour les mots de passe
    setIsEditPopupOpen(true);
  };


  const handleDeleteAccount = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      try {
        await axios.delete('http://localhost:8000/api/user/delete', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        localStorage.removeItem('token');
        navigate('/');
      } catch (error) {
        console.error("Erreur lors de la suppression du compte", error);
        alert("Erreur lors de la suppression du compte.");
      }
    }
  };

  

  const [confirmPassword, setConfirmPassword] = useState(""); // État pour la confirmation

  const handleSaveEdit = async () => {
    try {
      // Vérifiez si le champ est "password"
      if (editField === "password") {
        if (editValue !== confirmPassword) {
          alert("Les mots de passe ne correspondent pas !");
          return;
        }
      }

      const updateData =
        editField === "password" && editValue
          ? { [editField]: editValue, password_confirmation: confirmPassword }
          : { [editField]: editValue };

      await axios.put('http://localhost:8000/api/user/update', updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setUser((prevUser) => ({ ...prevUser, ...updateData }));
      setIsEditPopupOpen(false);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de ${editField}`, error);
      alert(`Erreur lors de la mise à jour de ${editField}`);
    }
  };

  const [isDarkMode, setIsDarkMode] = useState(false); // État pour le mode sombre
  const [selectedFont, setSelectedFont] = useState("sans-serif","arial"); // État pour la police
  const fonts = ["sans-serif", "serif", "monospace", "cursive", "fantasy","arial","Times new roman"]; // Options de police


  /*useEffect(() => {
    // Appliquez le mode sombre
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Appliquez la police
    document.documentElement.style.fontFamily = selectedFont;
  }, [isDarkMode, selectedFont]);
*/



  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? "dark" : ""}`}>
      <div className="mx-4 max-w-screen-xl sm:mx-8 xl:mx-auto">
        <h1 className="text-2xl font-semibold py-6 border-l-2 border-transparent pl-2">Réglages</h1>
      </div>

      <div className="flex-1 mx-4 max-w-screen-xl sm:mx-8 xl:mx-auto flex">
        <div className="grid grid-cols-1 sm:grid-cols-10 gap-8 w-full">
          <div className="col-span-2 hidden sm:block">
            <ul>
              <li onClick={() => setActiveTab("general")} className={`mt-5 cursor-pointer border-l-2 px-2 py-2 font-semibold transition ${activeTab === "general" ? "border-l-blue-700 text-blue-700" : "border-transparent hover:border-l-blue-700 hover:text-blue-700"}`}>Général</li>
              <li onClick={() => setActiveTab("account")} className={`mt-5 cursor-pointer border-l-2 px-2 py-2 font-semibold transition ${activeTab === "account" ? "border-l-blue-700 text-blue-700" : "border-transparent hover:border-l-blue-700 hover:text-blue-700"}`}>Compte</li>
              <li onClick={() => setActiveTab("preferences")} className={`mt-5 cursor-pointer border-l-2 px-2 py-2 font-semibold transition ${activeTab === "preferences" ? "border-l-blue-700 text-blue-700" : "border-transparent hover:border-l-blue-700 hover:text-blue-700"}`}>Préférences</li>
            </ul>
          </div>

          <div className="col-span-8 sm:bg-gray-50 sm:shadow rounded-xl px-8 py-6 flex flex-col h-full">
            {activeTab === "general" && (
              <div className="flex-1">
                <h1 className="text-2xl mb-10 font-semibold">Informations Générales</h1>
                {user ? (
                  <div className="space-y-4 mt-4">
                    <div><p className="text-sm font-semibold">Nom :</p><p className="text-lg">{user.name || 'Non défini'}</p></div>
                    <div><p className="text-sm font-semibold">Email :</p><p className="text-lg">{user.email}</p></div>
                    <div><p className="text-sm font-semibold">Mot de passe :</p><p className="text-lg text-gray-500 italic">******</p></div>
                  </div>
                ) : (<p className="text-gray-500">Chargement des informations...</p>)}
              </div>
            )}
            {activeTab === "account" && (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h1 className="text-2xl mb-10 font-semibold">Informations du Compte</h1>
                  {user ? (
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center">
                        <p className="text-sm font-semibold">Nom d'utilisateur :</p>
                        <p className="text-lg ml-2">{user.name || 'Non défini'}</p>
                        <button onClick={() => handleEdit('name')} className="ml-2 text-blue-500"><PencilIcon className="h-5 w-5 inline" /></button>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm font-semibold">Adresse e-mail :</p>
                        <p className="text-lg ml-2">{user.email}</p>
                        <button onClick={() => handleEdit('email')} className="ml-2 text-blue-500"><PencilIcon className="h-5 w-5 inline" /></button>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm font-semibold">Mot de passe :</p>
                        <p className="text-lg ml-2 text-gray-500 italic">******</p>
                        <button onClick={() => handleEdit('password')} className="ml-2 text-blue-500"><PencilIcon className="h-5 w-5 inline" /></button>
                      </div>
                      <div className="mt-80 flex flex-col items-center justify-end">
                        <p className="text-sm font-semibold text-red-500 mb-2">Supprimer le compte</p>
                        <button onClick={handleDeleteAccount} className="flex items-center justify-center p-2 text-red-500 hover:text-red-700"><FaTrash className="h-7 w-7" /></button>
                      </div>
                    </div>
                  ) : (<p className="text-gray-500">Chargement des informations...</p>)}
                </div>
              </div>
            )}
             <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            {activeTab === "preferences" && (
              <div>
                <h1 className="text-2xl mb-10 font-semibold">Préférences</h1>

                {/* Mode sombre */}
               


                {/* Sélection de la police */}
                <div className="mb-6">
                  <p className="text-lg mb-4">Choisissez une police :</p>
                  <select
                    className="border rounded-lg p-2 w-full"
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-md p-4 flex justify-around">
                {loading ? (
                    <div className="flex justify-center items-center">
                        <div className="loader border-t-transparent border-blue-500 border-4 rounded-full w-8 h-8 animate-spin"></div>
                    </div>
                ) : (
                    <>
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
                        <InboxIcon className="h-6 w-6" onClick={navigateToChat}/>
                        {user && (
                            user.profile_image ? (
                                <img
                                    src={`http://localhost:8000/storage/${user.profile_image}`}
                                    alt="Profile"
                                    className="h-6 w-6 rounded-full cursor-pointer"
                                    onClick={() => navigateToProfile(user.id)}
                                />
                            ) : (
                                <UserCircleIcon className="h-6 w-6 text-gray-500 cursor-pointer"
                                    onClick={() => navigateToProfile(user.id)} />
                            )
                        )}
                        <Cog6ToothIcon className="h-6 w-6 text-gray-500 cursor-pointer" onClick={navigateToSettings} />
                        <PowerIcon onClick={handleLogout} className="h-6 w-6 text-red-500 cursor-pointer" />
                    </>
                )}
            </div>

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

      {/* Popup de modification */}
      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Modifier {editField}</h2>

            {/* Champ pour le nom ou l'email */}
            {editField !== "password" && (
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
            )}

            {/* Champs pour le mot de passe */}
            {editField === "password" && (
              <>
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditPopupOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

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
  );
}

export default Settings;
