import React, { useState, useEffect } from 'react';
import { HomeIcon, PlusIcon, UserCircleIcon, Cog6ToothIcon, PowerIcon, InboxIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Settings() {
  const [showUserList, setShowUserList] = useState(false);
  const [showFriendRequestPopup, setShowFriendRequestPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requestCount, setRequestCount] = useState(0);
  const [user, setUser] = useState(null); // État pour stocker les informations de l'utilisateur connecté
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch friends and friend requests count
    const fetchFriends = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/friends', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setFriends(response.data);
      } catch (err) {
        console.error('Unable to fetch friends', err);
      }
    };

    const fetchFriendRequests = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/friend-requests/retrieve', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setRequestCount(response.data.length);
      } catch (err) {
        console.error('Unable to fetch friend requests', err);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setUser(response.data.user); // Stocker les informations de l'utilisateur
      } catch (err) {
        console.error('Unable to fetch user data', err);
      }
    };

    fetchFriends();
    fetchFriendRequests();
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout', {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-4 min-h-screen max-w-screen-xl sm:mx-8 xl:mx-auto">
        <h1 className="border-b py-6 text-4xl font-semibold">Settings</h1>
        {/* Add your existing settings content here */}
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
            <UserCircleIcon
              className="h-6 w-6 text-gray-500 cursor-pointer"
              onClick={() => navigate(`/profile/${user.id}`)}
            />
          )
        )}
        <Cog6ToothIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
        <PowerIcon onClick={handleLogout} className="h-6 w-6 text-red-500 cursor-pointer" />
      </div>

      {/* Popup pour la liste d'amis */}
      {showFriendRequestPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-5 shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Mes amis</h3>
            {friends.length === 0 ? (
              <p>Aucun ami trouvé.</p>
            ) : (
              friends.map(friend => (
                <div key={friend.id} className="flex items-center p-2 border-b border-gray-200">
                  <UserCircleIcon className="h-8 w-8 text-gray-500 rounded-full" />
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

      {/* Popup pour la recherche d'utilisateurs */}
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
                filteredUsers.map((user) => (
                  <div key={user.id} className="flex justify-between items-center mb-2">
                    <span>{user.email}</span>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded">Ajouter</button>
                  </div>
                ))
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
    </div>
  );
}

export default Settings;
