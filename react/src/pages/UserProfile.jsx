import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChatBubbleOvalLeftEllipsisIcon, HeartIcon, ArrowLeftIcon, UserIcon, HomeIcon, PlusIcon, UserCircleIcon, Cog6ToothIcon, PowerIcon } from '@heroicons/react/24/solid';
import { FaImage } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/navigations/SideBar';

const CommentSection = ({ postId, title }) => {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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
            fetchComments();  // Recharger les commentaires après la soumission
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

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const [showModal, setShowModal] = useState(false);

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

    const navigateToProfile = () => {
        if (user && user.id) {
            navigate(`/profile/${user.id}`);
        }
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                const userResponse = await axios.get('http://localhost:8000/api/user', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUser(userResponse.data.user);

                const postsResponse = await axios.get('http://localhost:8000/api/user/posts', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
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

        fetchUserProfile();
    }, []);

    const openModal = (post) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPost(null);
    };

    const handleImageChange = async (event, type) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append(type === 'profile' ? 'profile_image' : 'image_fond', file);

            try {
                const response = await axios.post(`http://localhost:8000/api/user/${type === 'profile' ? 'profile-image' : 'background-image'}`, formData, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setUser((prev) => ({
                    ...prev,
                    [type === 'profile' ? 'profile_image' : 'image_fond']: response.data[type === 'profile' ? 'profile_image' : 'image_fond']
                }));
            } catch (error) {
                console.error(`Erreur lors de la mise à jour de l'image ${type}:`, error);
            }
        }
    };

    const triggerImageInput = (type) => {
        document.getElementById(`${type}ImageInput`).click();
    };

    const handleLike = async (postId) => {
        try {
            await axios.post(`http://localhost:8000/api/posts/${postId}/like`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchUserPosts(); // Refresh posts after liking
        } catch (error) {
            console.error('Erreur lors de la mise à jour du like:', error);
        }
    };

    const fetchUserPosts = async () => {
        try {
            const postsResponse = await axios.get('http://localhost:8000/api/user/posts', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
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

    const openCommentModal = (post) => {
        setCurrentPost(post);
        setCommentModalOpen(true);
    };

    const closeCommentModal = () => {
        setCommentModalOpen(false);
        setCurrentPost(null);
    };

    const handleCommentAdded = () => {
        fetchUserPosts(); // Refresh posts after a comment is added
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
                    <div className="flex justify-center items-center h-full bg-gray-200">
                        <FaImage className="text-gray-500 h-16 w-16" />
                    </div>
                )}

                <button
                    onClick={() => triggerImageInput('background')}
                    className="absolute top-2 right-2 bg-white text-black py-1 px-3 rounded-md"
                >
                    Changer image de fond
                </button>
            </div>

            <input
                id="profileImageInput"
                type="file"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'profile')}
            />

            <input
                id="backgroundImageInput"
                type="file"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'background')}
            />

            <h1 className="text-center text-2xl font-bold mt-4">{user.name}</h1>
            <h2 className="text-center text-lg text-gray-600">Posts de {user.name}</h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {posts.map(post => (
                    <div key={post.id} className="border border-gray-300 rounded-lg overflow-hidden">
                        {post.media_path && (
                            <img
                                src={post.media_path}
                                alt="Post media"
                                className="w-full h-32 object-cover"
                            />
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

            {/* Barre en bas pour les écrans plus petits */}
            <div className=" fixed bottom-0 left-0 right-0 bg-white shadow-md p-4 flex justify-around">
                {loading ? ( // Afficher le spinner lors du chargement
                    <div className="flex justify-center items-center">
                        <div className="loader border-t-transparent border-blue-500 border-4 rounded-full w-8 h-8 animate-spin"></div>
                    </div>
                ) : (
                    <>
                        <a href="/home">
                            <HomeIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
                        </a>
                        <PlusIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
                        {user && (
                            user.profile_image ? (
                                <img
                                    src={`http://localhost:8000/storage/${user.profile_image}`}
                                    alt="Profile"
                                    className="h-6 w-6 rounded-full cursor-pointer"
                                    onClick={navigateToProfile}
                                />
                            ) : (
                                <UserCircleIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
                            )
                        )}
                        <Cog6ToothIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
                        <PowerIcon onClick={handleLogout} className="h-6 w-6 text-gray-500 cursor-pointer" />
                    </>
                )}
            </div>

            {/* Comment Section */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
                        <h2 className="text-xl font-bold mb-4">{selectedPost.title}</h2>
                        <CommentSection postId={selectedPost.id} title={selectedPost.title} />
                        <button onClick={closeModal} className="mt-4 bg-red-500 text-white py-2 px-4 rounded">
                            Fermer
                        </button>
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
        </div>
        </div>
    );
};

export default UserProfile;
