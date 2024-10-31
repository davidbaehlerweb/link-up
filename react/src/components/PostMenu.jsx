import React, { useEffect, useRef } from 'react';

const PostMenu = ({ onEdit, onDelete, closeMenu }) => {
    const menuRef = useRef();

    useEffect(() => {
        // Fonction pour fermer le menu si on clique en dehors de la popup
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeMenu(); // Fermer le menu
            }
        };

        // Ajouter l'écouteur d'événement
        document.addEventListener('mousedown', handleClickOutside);

        // Nettoyer l'écouteur d'événement
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closeMenu]);

    return (
        <div ref={menuRef} className="absolute top-0 right-0 bg-white shadow-md rounded-md z-20 mt-2 mr-2">
            <button onClick={onEdit} className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left">
                Modifier
            </button>
            <button onClick={onDelete} className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left">
                Supprimer
            </button>
        </div>
    );
};

export default PostMenu;
