import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/navigations/SideBar";
import HomeCenter from "../components/HomeCenter";
import { Cog6ToothIcon, HomeIcon, InboxIcon, PlusIcon, PowerIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
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
            fetchFriendRequests();
        } catch (error) {
            console.error("Erreur lors de l'envoi de la demande d'amis:", error);
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
            const results = users.filter(user =>
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(results);
        }
    }, [searchTerm, users]);

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
            fetchFriendRequests();
        } catch (error) {
            console.error("Erreur lors du refus de la demande:", error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-1">
                <div className="hidden lg:block lg:w-1/5 bg-gray-100">
                    <Sidebar user={user} onLogout={handleLogout} />
                </div>
                <div className="flex-1 p-4 lg:w-4/5">
                    <HomeCenter />
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
                        <InboxIcon className="h-6 w-6" />
                        {user && (
                            user.profile_image ? (
                                <img
                                    src={`http://localhost:8000/storage/${user.profile_image}`}
                                    alt="Profile"
                                    className="h-6 w-6 rounded-full cursor-pointer"
                                    onClick={() => navigateToProfile(user.id)}
                                />
                            ) : (
                                <UserCircleIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
                            )
                        )}
                        <Cog6ToothIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
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
                                filteredUsers.map((user) => (
                                    <div key={user.id} className="p-2 border-b border-gray-200 flex items-center">
                                        {user.profile_image ? (
                                            <img
                                                src={`http://localhost:8000/storage/${user.profile_image}`}
                                                alt="Profile"
                                                className="h-6 w-6 rounded-full cursor-pointer mr-2"
                                                onClick={() => navigateToProfile(user.id)}
                                            />
                                        ) : (
                                            <UserCircleIcon 
                                                className="h-8 w-8 text-gray-500 rounded-full mr-2 cursor-pointer"
                                                onClick={() => navigateToProfile(user.id)}
                                            />
                                        )}
                                        <span className="flex-grow cursor-pointer" onClick={() => navigateToProfile(user.id)}>
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
                            className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
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
                            className="mt-4 bg-gray-300 text-gray-700 rounded px-4 py-2"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
