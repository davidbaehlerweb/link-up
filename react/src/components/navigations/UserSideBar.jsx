import React, { useEffect, useState } from "react";
import { Card, Typography } from "@material-tailwind/react";
import { UserCircleIcon } from "@heroicons/react/24/solid"; // Importation de l'icône de profil
import axios from "axios";

export function UserSidebar() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div>Loading...</div>; // Affichage pendant le chargement

    return (
        <Card className="h-screen w-60 p-4 shadow-lg flex flex-col items-center">
            <UserCircleIcon className="h-24 w-24 text-blue-gray-600 mb-4" /> {/* Icône de profil */}
            <Typography className="text-lg font-semibold text-center">
                {user?.name || "Nom de l'utilisateur"}
            </Typography>
        </Card>
    );
}
