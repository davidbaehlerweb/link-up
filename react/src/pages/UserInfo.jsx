import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChatBubbleOvalLeftEllipsisIcon, HeartIcon, ArrowLeftIcon, UserIcon } from '@heroicons/react/24/solid';
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
                                <UserIcon className="h-24 w-24 rounded-full border-4 border-white text-gray-400 cursor-pointer" />
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
        </div>
    );
};

export default UserInfo;


