import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
  Alert,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  PowerIcon,
  HomeIcon,
  PlusIcon,
  InboxIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import { CubeTransparentIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from '../../assets/image_logo.png';

export function Sidebar({ user, onLogout }) {
  const [openAlert, setOpenAlert] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showUserList, setShowUserList] = useState(false);
  const [showFriendRequestPopup, setShowFriendRequestPopup] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  const navigate = useNavigate();

  const navigateToProfile = () => {
    if (user && user.id) {
      navigate(`/profile/${user.id}`);
    }
  };

  const navigateToUserProfile = (userId) => {
    navigate(`/profile-user/${userId}`);
  };

  const sendFriendRequest = async (friendId) => {
    const isAlreadyFriend = friends.some(friend => friend.id === friendId);
    const hasPendingRequest = receivedRequests.some(request => request.sender_id === friendId);

    if (isAlreadyFriend) {
      alert("Vous êtes déjà amis avec cet utilisateur.");
      return;
    }

    if (hasPendingRequest) {
      alert("Vous avez déjà une demande en attente avec cet utilisateur.");
      return;
    }

    try {
      await axios.post(`http://localhost:8000/api/friend-requests`, {
        friend_id: friendId,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchReceivedRequests();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande d'amis:", error);
    }
  };

  const fetchReceivedRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/friend-requests/retrieve`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const friendRequestsWithUserData = await Promise.all(response.data.map(async (request) => {
        const userResponse = await axios.get(`http://localhost:8000/api/users/${request.sender_id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        return { ...request, user: userResponse.data };
      }));
      setReceivedRequests(friendRequestsWithUserData);
    } catch (error) {
      console.error('Unable to fetch friend requests', error.response ? error.response.data : error.message);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/friends`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Unable to fetch friends', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Unable to fetch users', error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchReceivedRequests();
    fetchFriends();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers([]);
    } else {
      const results = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      results.sort((a, b) => a.email[0].localeCompare(b.email[0]));
      setFilteredUsers(results);
    }
  }, [searchTerm, users]);

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post(`http://localhost:8000/api/friend-requests/${requestId}/accept`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchReceivedRequests();
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
      fetchReceivedRequests();
    } catch (error) {
      console.error("Erreur lors du refus de la demande:", error);
    }
  };

  return (
    <>
      <Card className="fixed top-0 left-0 h-full max-w-[20rem] p-4 shadow-xl hidden lg:block">
        <div className="mb-5 flex items-center gap-4 p-4">
          <img src={Logo} alt="Logo" className="h-12 w-12 mr-2" />
          <Typography className="font-bold" variant="h5" color="blue-gray">
            LinkUp
          </Typography>
        </div>

        <List className="flex-grow overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="loader border-t-transparent border-blue-500 border-4 rounded-full w-8 h-8 animate-spin"></div>
            </div>
          ) : (
            <>
              <ListItem className="mb-6">
                <ListItemPrefix>
                  <HomeIcon className="h-6 w-6" />
                </ListItemPrefix>
                <a href="/home"><Typography className="text-lg">Accueil</Typography></a>
              </ListItem>

              <ListItem className="mb-6" onClick={() => {
                fetchReceivedRequests();
                setShowFriendRequestPopup(true);
              }}>
                <ListItemPrefix>
                  <UserCircleIcon className="h-6 w-6" />
                </ListItemPrefix>
                <Typography className="text-lg">Mes amis</Typography>
                {receivedRequests.length > 0 && (
                  <ListItemSuffix>
                    <Chip value={receivedRequests.length} size="sm" variant="ghost" className="rounded-full text-red-600" />
                  </ListItemSuffix>
                )}
              </ListItem>

              <ListItem className="mb-6" onClick={() => setShowUserList(true)}>
                <ListItemPrefix>
                  <PlusIcon className="h-6 w-6" />
                </ListItemPrefix>
                <Typography className="text-lg">Ajouter des amis</Typography>
              </ListItem>

              <ListItem className="mb-6">
                <ListItemPrefix>
                  <InboxIcon className="h-6 w-6" />
                </ListItemPrefix>
                <Typography className="text-lg">Messages</Typography>
                <ListItemSuffix>
                  <Chip value="14" size="sm" variant="ghost" className="rounded-full text-red-600" />
                </ListItemSuffix>
              </ListItem>

              <ListItem className="mb-6">
                <ListItemPrefix>
                  <Cog6ToothIcon className="h-6 w-6" />
                </ListItemPrefix>
                <Typography className="text-lg">Réglages</Typography>
              </ListItem>

              {user && (
                <ListItem className="mb-6" onClick={navigateToProfile}>
                  <ListItemPrefix>
                    {user.profile_image ? (
                      <img 
                        src={`http://localhost:8000/storage/${user.profile_image}`} 
                        alt="Profile" 
                        className="h-6 w-6 rounded-full cursor-pointer" 
                      />
                    ) : (
                      <UserCircleIcon className="h-6 w-6" />
                    )}
                  </ListItemPrefix>
                  <Typography className="text-lg">{user.name}</Typography>
                </ListItem>
              )}

              <ListItem className="mb-6" onClick={onLogout}>
                <ListItemPrefix>
                  <PowerIcon className="h-6 w-6 text-red-500" />
                </ListItemPrefix>
                <Typography className="text-lg text-red-500">Déconnexion</Typography>
              </ListItem>
            </>
          )}
        </List>

        <Alert open={openAlert} className="mt-auto" onClose={() => setOpenAlert(false)}>
          <CubeTransparentIcon className="mb-4 h-12 w-12" />
          <Typography variant="h6" className="mb-1">Upgrade to PRO</Typography>
          <Typography variant="small" className="font-normal opacity-80">Unlock additional features!</Typography>
        </Alert>
      </Card>

      {showUserList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-5 shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Utilisateurs</h3>
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
                  <div key={user.id} className="p-2 border-b border-gray-200 flex items-center">
                    {user.profile_image ? (
                      <img
                        src={`http://localhost:8000/storage/${user.profile_image}`}
                        alt="Profile"
                        className="h-6 w-6 rounded-full cursor-pointer mr-2"
                        onClick={() => navigateToUserProfile(user.id)}
                      />
                    ) : (
                      <UserCircleIcon 
                        className="h-8 w-8 text-gray-500 rounded-full mr-2 cursor-pointer"
                        onClick={() => navigateToUserProfile(user.id)}
                      />
                    )}
                    <span className="flex-grow cursor-pointer" onClick={() => navigateToUserProfile(user.id)}>
                      {user.email}
                    </span>
                    <button
                      onClick={() => sendFriendRequest(user.id)}
                      className="bg-blue-500 text-white rounded px-2 py-1 text-sm"
                    >
                      Ajouter
                    </button>
                  </div>
                ))
              ) : (
                <p>Aucun utilisateur trouvé.</p>
              )}
            </div>
            <button
              onClick={() => setShowUserList(false)}
              className="mt-4 bg-gray-300 text-gray-700 rounded px-4 py-2"
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
                  {request.user ? (
                    <>
                      {request.user.profile_image ? (
                        <img
                          src={`http://localhost:8000/storage/${request.user.profile_image}`}
                          alt="Profile"
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <UserCircleIcon className="h-8 w-8 text-gray-500 rounded-full" />
                      )}
                      <span className="flex-grow ml-2">{request.user.email}</span>
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
              className="mt-4 bg-gray-300 text-gray-700 rounded px-4 py-2"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
