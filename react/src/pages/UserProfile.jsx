import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChatBubbleOvalLeftEllipsisIcon, HeartIcon, ArrowLeftIcon, UserIcon, HomeIcon, PlusIcon, UserCircleIcon, Cog6ToothIcon, PowerIcon, InboxIcon } from '@heroicons/react/24/solid';
import { FaImage } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PostMenu from '../components/PostMenu';
import PostForm from '../components/PostForm';

const CommentSection = ({ postId, title }) => {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
                <div className="mb-2"><strong>{title}</strong></div>
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

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false); // Nouveau état pour le modal de confirmation
    const [actionMessage, setActionMessage] = useState(''); 

    

    
    
    const [showModal, setShowModal] = useState(false);
    const [showUserList, setShowUserList] = useState(false);
    const [showFriendRequestPopup, setShowFriendRequestPopup] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    
    
    const [requestCount, setRequestCount] = useState(0); // État pour le nombre de demandes d'amis
    const [sentRequests, setSentRequests] = useState([]);
    const [profileImage, setProfileImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (type === 'profile') {
            setProfileImage(file);
            handleImageUpload('profile', file); // Appel immédiat pour enregistrer l'image dans la BDD
        } else {
            setBackgroundImage(file);
            handleImageUpload('background', file); // Appel immédiat pour enregistrer l'image dans la BDD
        }
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



    const triggerImageInput = (type) => {
        const inputElement = document.getElementById(type === 'profile' ? 'profile-upload' : 'bg-upload');
        if (inputElement) {
            inputElement.click();
        } else {
            console.error(`L'élément de téléchargement pour ${type} est introuvable.`);
        }
    };


    const handleFileChange = (newFile) => {
        setSelectedPost((prev) => ({ ...prev, media_path: newFile }));
    };

    const handleTitleChange = (newTitle) => {
        setSelectedPost((prev) => ({ ...prev, title: newTitle }));
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

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8000/api/logout', {}, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            localStorage.removeItem('token');
            setShowModal(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            console.error('Erreur lors de la déconnexion', error);
        }
    };

    const handleEditSubmit = async () => {
        if (!selectedPost || !selectedPost.title) {
            console.error("Le champ 'title' est requis.");
            return;
        }

        const formData = new FormData();
        formData.append('title', selectedPost.title);

        if (selectedPost.media_path instanceof File) {
            formData.append('media_path', selectedPost.media_path);
        }

        // Ajoutez un log pour vérifier `title`
        console.log("Titre envoyé :", formData.get('title'));

        try {
            await axios.post(`http://localhost:8000/api/posts/${selectedPost.id}/update`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    //'Content-Type': 'multipart/form-data',
                },
            });
            setActionMessage('Post modifié avec succés');
            setShowActionModal(true)
            setTimeout(()=>setShowActionModal(false),2000);
            fetchUserPosts();
            closeEditModal();
        } catch (error) {
            if (error.response && error.response.data.errors) {
                console.error('Erreur de validation complète:', error.response.data);
            } else {
                console.error('Erreur lors de la modification du post:', error);
            }
        }
    };












    const openEditModal = (post) => {
        setSelectedPost(post);
        setIsEditing(true);
        setIsMenuOpen(false);
    };

    const closeEditModal = () => {
        setSelectedPost(null);
        setIsEditing(false);
    };

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const userResponse = await axios.get('http://localhost:8000/api/user', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setUser(userResponse.data.user);

            const postsResponse = await axios.get('http://localhost:8000/api/user/posts', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const postsWithLikes = postsResponse.data.map(post => ({
                ...post,
                likeCount: post.likes.length,
            }));
            setPosts(postsWithLikes);
        } catch (error) {
            console.error('Erreur lors de la récupération des données de l\'utilisateur:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const openMenu = (event, post) => {
        event.stopPropagation();
        setSelectedPost(post);
        setIsMenuOpen(true);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        setSelectedPost(null);
    };

    const handleDeletePost = async () => {
        if (selectedPost) {
            try {
                await axios.delete(`http://localhost:8000/api/posts/${selectedPost.id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setActionMessage('Post supprimé avec succès');
                setShowActionModal(true);
                setTimeout(()=>setShowActionModal(false),2000);
                fetchUserPosts();
                closeMenu();
            } catch (error) {
                console.error('Erreur lors de la suppression du post:', error);
            }
        }
    };



    const fetchUserPosts = async () => {
        try {
            const postsResponse = await axios.get('http://localhost:8000/api/user/posts', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const postsWithLikes = postsResponse.data.map(post => ({
                ...post,
                likeCount: post.likes.length,
            }));
            setPosts(postsWithLikes);
        } catch (error) {
            console.error('Erreur lors de la récupération des posts:', error);
        }
    };



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

    const handleImageUpload = async (type, imageFile) => {
        const formData = new FormData();
        formData.append(type === 'profile' ? 'profile_image' : 'image_fond', imageFile);

        try {
            const response = await axios.post(
                `http://localhost:8000/api/user/${type === 'profile' ? 'profile-image' : 'background-image'}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            // Mettre à jour l'affichage avec la nouvelle image de profil ou de fond
            const updatedImagePath = response.data[type === 'profile' ? 'profile_image' : 'image_fond'];
            if (type === 'profile') {
                setUser((prevUser) => ({ ...prevUser, profile_image: updatedImagePath }));
            } else {
                setUser((prevUser) => ({ ...prevUser, image_fond: updatedImagePath }));
            }

            console.log(`L'image ${type} a été mise à jour avec succès.`);
        } catch (error) {
            console.error(`Erreur lors du téléchargement de l'image ${type}:`, error);
        }
    };


    return (
        <div>
            <div className="p-4">

                <ArrowLeftIcon
                    onClick={() => navigate('/home')}
                    className="h-6 w-6 text-black cursor-pointer absolute top-4 left-4 z-10"
                />

                <div
                    className="bg-cover bg-center h-60 relative"
                    style={{ backgroundImage: user.image_fond ? `url(http://localhost:8000/storage/${user.image_fond})` : 'none' }}
                >
                    {user.image_fond ? (
                        <div className="flex justify-center items-end h-full bg-black bg-opacity-50">
                            <button
                                onClick={() => triggerImageInput('background')}
                                className="absolute top-4 right-4 bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100"
                            >
                                <FaImage className="text-gray-500 h-6 w-6" /> {/* Icône de modification */}
                            </button>

                            <input
                                type="file"
                                onChange={(e) => handleImageChange(e, 'background')}
                                className="hidden"
                                id="bg-upload"
                            />
                            <input type="file" onChange={(e) => handleImageChange(e, 'profile')} className="hidden" id="profile-upload" />
                            {user.profile_image ? (

                                <img
                                    src={`http://localhost:8000/storage/${user.profile_image}`}
                                    alt="Profile"
                                    className="h-24 w-24 rounded-full border-4 border-white cursor-pointer"
                                    onClick={() => triggerImageInput('profile')}
                                />
                            ) : (
                                <UserIcon
                                    className="h-24 w-24 rounded-full border-4 border-white text-gray-400 cursor-pointer"
                                    onClick={() => triggerImageInput('profile')}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col justify-center items-center h-full bg-gray-200 relative">
            <button
                                onClick={() => triggerImageInput('background')}
                                className="absolute top-4 right-4 bg-white bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100"
                            >
                                <FaImage className="text-gray-500 h-6 w-6" /> {/* Icône de modification */}
                            </button>
            <input
                type="file"
                onChange={(e) => handleImageChange(e, 'background')}
                className="hidden"
                id="bg-upload"
            />
        </div>
                    )}
                </div>

                <h1 className="text-center text-2xl font-bold mt-4">{user.name}</h1>
                <h2 className="text-center text-lg text-gray-600">Posts de {user.name}</h2>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {posts.map(post => (
                        <div key={post.id} className="relative border border-gray-300 rounded-lg overflow-hidden">
                            <div className="absolute top-2 right-2 z-10 flex items-center cursor-pointer" onClick={(e) => openMenu(e, post)}>
                                <span className="text-white">...</span>
                            </div>
                            {isMenuOpen && selectedPost && selectedPost.id === post.id && (
                                <PostMenu
                                    onEdit={() => openEditModal(post)}
                                    onDelete={handleDeletePost}
                                    closeMenu={closeMenu}
                                />
                            )}
                            {post.media_path && (
                                post.media_path.endsWith('.mp4') || post.media_path.endsWith('.mov') ? (
                                    <video
                                        controls
                                        src={post.media_path}
                                        className="w-full h-32 object-cover"
                                    />
                                ) : (
                                    <img
                                        src={post.media_path}
                                        alt="Média du post"
                                        className="w-full h-32 object-cover"
                                    />
                                )
                            )}
                            <h3 className="font-semibold text-sm p-2 text-center">{post.title}</h3>
                            <div className="flex justify-between p-2">
                                <div className="flex items-center">
                                    <HeartIcon
                                        onClick={() => handleLike(post.id)}
                                        className="h-5 w-5 text-red-500 cursor-pointer"
                                    />
                                    <span className="ml-1">{post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}</span>
                                </div>
                                <ChatBubbleOvalLeftEllipsisIcon
                                    className="h-6 w-6 text-gray-500 cursor-pointer ml-2"
                                    onClick={() => openModal(post)}
                                />
                            </div>
                        </div>
                    ))}
                </div>



                {isEditing && selectedPost && (
                    <PostForm
                        isEditMode={true}
                        post={selectedPost}
                        onSubmit={handleEditSubmit}
                        onClose={closeEditModal}
                        onTitleChange={handleTitleChange}
                        onFileChange={handleFileChange}
                    />
                )}
            </div>

            <div className=" fixed bottom-0 left-0 right-0 bg-white shadow-md p-4 flex justify-around">
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

{showActionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-5 shadow-lg max-w-sm">
                        <h3 className="text-xl font-bold">{actionMessage}</h3>
                        <p className="mt-2">L'action sur le post a été effectuée avec succès.</p>
                    </div>
                </div>
            )}
        </div>


    );
};

export default UserProfile;
