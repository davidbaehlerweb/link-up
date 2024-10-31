import React, { useState, useEffect } from 'react';
import { PaperClipIcon, UserCircleIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid'; 
import axios from 'axios';
import { FaFileImage, FaImage } from 'react-icons/fa';

// URL de base pour les requêtes API
const API_URL = 'http://localhost:8000/api';

const CommentSection = ({ postId, title }) => {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${API_URL}/posts/${postId}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des commentaires:', error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');

        try {
            await axios.post(`${API_URL}/comments`, {
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

const PostInput = () => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleTextChange = (event) => {
        setText(event.target.value);
    };

    const handleLike = async (postId) => {
        const userId = localStorage.getItem('userId');
        try {
            const response = await axios.post(`${API_URL}/posts/${postId}/like`, {
                user_id: userId,
            });

            const updatedPosts = posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        liked: response.data.liked,
                        likeCount: response.data.likeCount
                    };
                }
                return post;
            });

            setPosts(updatedPosts);
        } catch (error) {
            console.error('Erreur lors de l\'ajout du like:', error);
        }
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('title', text);
        if (file) {
            formData.append('media_path', file);
        }

        const userId = localStorage.getItem('userId');
        formData.append('user_id', userId);

        try {
            await axios.post(`${API_URL}/posts`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            fetchPosts();
            setText('');
            setFile(null);
        } catch (error) {
            console.error('Erreur lors de la création du post:', error.response ? error.response.data : error.message);
        }
    };

    const openModal = (post) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPost(null);
    };
    

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${API_URL}/posts`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const postsWithLikes = response.data.map(post => ({
                ...post,
                liked: post.likes.some(like => like.user_id === localStorage.getItem('userId')),
                likeCount: post.likes.length,
            }));
            setPosts(postsWithLikes);
        } catch (error) {
            console.error("Erreur lors de la récupération des posts :", error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="flex justify-center mt-4">
            <div className="flex flex-col items-center w-full max-w-lg">
                <form onSubmit={handleSubmit} className="flex flex-col p-4 border border-gray-300 rounded-lg w-full">
                    <textarea
                        placeholder="Quoi de neuf ?"
                        value={text}
                        onChange={handleTextChange}
                        className="mb-4 w-full h-20 p-2 border border-gray-300 rounded-lg bg-gray-100 resize-none"
                    />

                    <div className="flex items-center mb-4">
                        <label className="flex items-center cursor-pointer">
                            <FaImage className="h-6 w-6 text-gray-500 mr-2" />
                            <input
                                type="file"
                                accept="image/*, video/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <span className="text-gray-500">Ajouter une image ou une vidéo</span>
                        </label>
                    </div>
                    {file && (
                        <div className="mb-4">
                            <p className="text-gray-700">Fichier sélectionné : {file.name}</p>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                    >
                        Publier
                    </button>
                </form>

                <div className="mt-6 w-full mb-20">
                    {posts.length === 0 ? (
                        <div>Aucun post disponible.</div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="mb-6 p-4 border border-gray-300 rounded-lg w-full max-w-sm mx-auto"> 
                                <div className="flex items-center mb-2">
                                    {console.log('posts',post.user)}
                                    {console.log('image: ',post.media_path)}
                                    {post.user?.profile_image ? (
                                        <img 
                                            src={`http://localhost:8000/storage/${post.user.profile_image}`} 
                                            alt="Profile" 
                                            className="h-8 w-8 rounded-full mr-2"
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-8 w-8 text-gray-500 mr-2" />
                                    )}
                                    <h4 className="text-md font-medium">{post.user?.name || "Utilisateur inconnu"}</h4>
                                </div>

                                {post.media_path && (
                                    <>
                                        {post.media_path.endsWith('.mp4') || post.media_path.endsWith('.mov') ? (
                                            <video 
                                                controls 
                                                src={post.media_path} 
                                                className="mb-2 rounded mx-auto max-w-full"
                                            />
                                        ) : (
                                            <img 
                                                src={post.media_path} 
                                                alt="Média du post" 
                                                className="mb-2 rounded mx-auto max-w-full"
                                            />
                                        )}
                                    </>
                                )}

                                <h3 className="text-lg font-semibold text-center">{post.title}</h3>

                                <div className="flex justify-end mt-2">
                                    <button onClick={() => handleLike(post.id)}>
                                        {post.liked ? (
                                            <span className="text-red-500">❤️</span>
                                        ) : (
                                            <span className="text-gray-500">🤍</span>
                                        )}
                                    </button>
                                    <span className="ml-2">{post.likeCount || 0} {post.likeCount === 1 ? 'like' : 'likes'}</span>
                                    
                                    <ChatBubbleOvalLeftEllipsisIcon
                                        className="h-6 w-6 text-gray-500 cursor-pointer ml-2"
                                        onClick={() => openModal(post)}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
                            <h2 className="text-xl font-bold mb-4"></h2>
                            <CommentSection postId={selectedPost.id} title={selectedPost.title} />
                            <button onClick={closeModal} className="mt-4 bg-red-500 text-white py-2 px-4 rounded">
                                Fermer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostInput;
