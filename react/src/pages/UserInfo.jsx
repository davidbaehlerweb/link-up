import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChatBubbleOvalLeftEllipsisIcon, HeartIcon, ArrowLeftIcon, UserIcon, UsersIcon, HomeIcon, UserCircleIcon, PlusIcon, InboxIcon, Cog6ToothIcon, PowerIcon } from '@heroicons/react/24/solid';
import { FaImage } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../components/navigations/SideBar';

const CommentSection = ({ postId, title }) => {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/posts/${postId}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des commentaires:', error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');

        try {
            await axios.post('http://localhost:8000/api/comments', {
                content: commentText,
                post_id: postId,
                user_id: userId,
            });
            setCommentText('');
            fetchComments();
        } catch (error) {
            console.error('Erreur lors de l\'ajout du commentaire :', error);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    return (
        <div className="ml-4 w-full flex flex-col h-full">
            <div className="flex-grow overflow-y-auto h-64 mb-4">
                <div className="mb-2">
                    <strong>{title}</strong>
                </div>
                {comments.map((comment) => (
                    <div key={comment.id} className="mb-2">
                        <strong>{comment.user?.name || "Utilisateur inconnu"}</strong>
                        <p>{comment.content}</p>
                    </div>
                ))}
            </div>

            <form onSubmit={handleCommentSubmit} className="flex items-center">
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="w-3/4 p-2 border border-gray-300 rounded-full resize-none"
                />
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-full ml-2">
                    Envoyer
                </button>
            </form>
        </div>
    );
};


const UserInfo = () => {
    const navigate = useNavigate();
    const { userId } = useParams(); // Récupère l'ID utilisateur depuis l'URL
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showUserList, setShowUserList] = useState(false);
    const [showFriendRequestPopup, setShowFriendRequestPopup] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    
    const [requestCount, setRequestCount] = useState(0);

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

    const navigateToUserProfile = (userId) => {
        navigate(`/profile-user/${userId}`);
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

    // Récupération des informations utilisateur via l'ID sélectionné
    useEffect(() => {
        const fetchUserById = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUser(response.data); // Met à jour l'état de l'utilisateur
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            }
        };

        const fetchUserPosts = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/users/${userId}/posts`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPosts(response.data); // Met à jour l'état des posts
            } catch (error) {
                console.error('Erreur lors de la récupération des posts:', error);
            }
        };

        if (userId) {
            fetchUserById();
            fetchUserPosts();
            setLoading(false);
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 100 12v2a8 8 0 01-8-8z"></path>
                </svg>
            </div>
        );
    }

    return (
        <div>
            <div className="p-4">
                <ArrowLeftIcon
                    onClick={() => navigate('/home')}
                    className="h-6 w-6 text-black cursor-pointer absolute top-4 left-4 z-10"
                />

                {/* Affichage des infos utilisateur */}
                <div className="bg-cover bg-center h-60 relative" style={{ backgroundImage: user?.image_fond ? `url(http://localhost:8000/storage/${user.image_fond})` : 'none' }}>
                    {user?.image_fond ? (
                        <div className="flex justify-center items-end h-full bg-black bg-opacity-50">
                            {user?.profile_image ? (
                                <img
                                    src={`http://localhost:8000/storage/${user.profile_image}`}
                                    alt="Profile"
                                    className="h-24 w-24 rounded-full border-4 border-white cursor-pointer"
                                />
                            ) : (
                                <UsersIcon className="h-24 w-24 rounded-full border-4 border-white text-gray-400 cursor-pointer" />
                            )}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-full bg-gray-200">
                            <FaImage className="text-gray-500 h-16 w-16" />
                        </div>
                    )}
                </div>

                <h1 className="text-center text-2xl font-bold mt-4">{user?.name}</h1>
                <h2 className="text-center text-lg text-gray-600">Posts de {user?.name}</h2>

                {/* Affichage des posts */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {posts.map(post => (
                        <div key={post.id} className="border border-gray-300 rounded-lg overflow-hidden">
                            {post.media_path && (
                                <img src={post.media_path} alt="Post media" className="w-full h-32 object-cover" />
                            )}
                            <h3 className="font-semibold text-sm p-2 text-center">{post.title}</h3>
                            <div className="flex justify-between p-2">
                                <div className="flex items-center">
                                    <HeartIcon className="h-5 w-5 text-red-500" />
                                    <span className="ml-1 text-gray-600">{post.likes.length}</span> {/* Affiche le nombre de likes */}
                                </div>
                            </div>
                        </div>
                    ))}
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
                                <UserCircleIcon className="h-6 w-6 text-gray-500 cursor-pointer" 
                                onClick={()=>navigateToProfile(user.id)}/>
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
                                                onClick={() => navigateToUserProfile(user.id)}
                                            />
                                        ) : (
                                            <UserCircleIcon 
                                                className="h-8 w-8 text-gray-500 rounded-full mr-2 cursor-pointer"
                                                onClick={() => navigateToUserProfile(user.id)}
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

export default UserInfo;


