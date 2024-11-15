import React, { useState, useEffect } from 'react';
import { HomeIcon, PlusIcon, UserCircleIcon, Cog6ToothIcon, PowerIcon, InboxIcon, PencilIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

function Settings() {
  const [showUserList, setShowUserList] = useState(false);
  const [showFriendRequestPopup, setShowFriendRequestPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requestCount, setRequestCount] = useState(0);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false); // Pour afficher la popup
  const [editField, setEditField] = useState(""); // Le champ à modifier (nom, email, mot de passe)
  const [editValue, setEditValue] = useState(""); // La nouvelle valeur de l'input
  const navigate = useNavigate();

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
    setEditValue(user[field]);
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

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:8000/api/logout',
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updateData = { [editField]: editValue };
      await axios.put('http://localhost:8000/api/user/update', updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUser((prevUser) => ({ ...prevUser, ...updateData })); // Mettre à jour l'utilisateur localement
      setIsEditPopupOpen(false);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de ${editField}`, error);
      alert(`Erreur lors de la mise à jour de ${editField}`);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="mx-4 max-w-screen-xl sm:mx-8 xl:mx-auto">
        <h1 className="text-2xl font-semibold py-6 border-l-2 border-transparent pl-2">Réglages</h1>
      </div>

      <div className="flex-1 mx-4 max-w-screen-xl sm:mx-8 xl:mx-auto flex">
        <div className="grid grid-cols-1 sm:grid-cols-10 gap-8 w-full">
          <div className="col-span-2 hidden sm:block">
            <ul>
              <li onClick={() => setActiveTab("general")} className={`mt-5 cursor-pointer border-l-2 px-2 py-2 font-semibold transition ${activeTab === "general" ? "border-l-blue-700 text-blue-700" : "border-transparent hover:border-l-blue-700 hover:text-blue-700"}`}>Général</li>
              <li onClick={() => setActiveTab("account")} className={`mt-5 cursor-pointer border-l-2 px-2 py-2 font-semibold transition ${activeTab === "account" ? "border-l-blue-700 text-blue-700" : "border-transparent hover:border-l-blue-700 hover:text-blue-700"}`}>Compte</li>
              <li className="mt-5 cursor-pointer border-l-2 border-transparent px-2 py-2 font-semibold transition hover:border-l-blue-700 hover:text-blue-700">Préférences</li>
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
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md p-4 flex justify-around">
        <a href="/home"><HomeIcon className="h-6 w-6 text-gray-500 cursor-pointer" /></a>
        <div className="relative"><UserCircleIcon className="h-6 w-6 text-gray-500 cursor-pointer" onClick={() => setShowFriendRequestPopup(true)} />
          {requestCount > 0 && (<span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">{requestCount}</span>)}
        </div>
        <PlusIcon className="h-6 w-6 text-gray-500 cursor-pointer" onClick={() => setShowUserList(true)} />
        <InboxIcon className="h-6 w-6 text-gray-500 cursor-pointer" onClick={navigateToChat} />
        {user && (user.profile_image ? (
          <img src={`http://localhost:8000/storage/${user.profile_image}`} alt="Profile" className="h-6 w-6 rounded-full cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)} />
        ) : (<UserCircleIcon className="h-6 w-6 text-gray-500 cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)} />))}
        <Cog6ToothIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
        <PowerIcon onClick={handleLogout} className="h-6 w-6 text-red-500 cursor-pointer" />
      </div>

      {/* Popup de modification */}
      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Modifier {editField}</h2>
            <input type="text" className="w-full border border-gray-300 rounded-lg p-2 mb-4" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsEditPopupOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg">Annuler</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
