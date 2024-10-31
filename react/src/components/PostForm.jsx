import React, { useState, useEffect } from 'react';
import { FaImage } from 'react-icons/fa';
import axios from 'axios';

const PostForm = ({ isEditMode, post, onSubmit, onClose, onTitleChange, onFileChange }) => {
    const [text, setText] = useState(post?.title || '');
    const [file, setFile] = useState(null);
    const [error, setError] = useState(''); // Pour gérer les erreurs de validation

    const handleTextChange = (event) => {
        setText(event.target.value);
        onTitleChange(event.target.value); // Transmet le texte à UserProfile
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        onFileChange(selectedFile); // Transmet le fichier à UserProfile
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!text.trim()) {
            setError("Le titre est obligatoire.");
            return;
        }

        const formData = new FormData();
        formData.append('title', text.trim());
        if (file) {
            formData.append('media_path', file);
        }

        try {
            await onSubmit(formData);
            setText('');
            setFile(null);
            setError('');
            onClose();
        } catch (error) {
            console.error("Erreur lors de la soumission :", error);
            setError("Une erreur s'est produite. Veuillez réessayer.");
        }
    };

    useEffect(() => {
        if (isEditMode && post) {
            setText(post.title);
        }
    }, [isEditMode, post]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
                <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Modifier le Post' : 'Créer un Post'}</h2>
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <textarea
                        placeholder="Quoi de neuf ?"
                        value={text}
                        onChange={handleTextChange}
                        className="mb-4 w-full h-20 p-2 border border-gray-300 rounded-lg bg-gray-100 resize-none"
                    />
                    
                    {error && <p className="text-red-500 mb-4">{error}</p>}

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
                    <div className="flex justify-end">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-300 rounded">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                            {isEditMode ? 'Enregistrer' : 'Publier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostForm;

