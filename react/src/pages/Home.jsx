import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/navigations/SideBar";
import HomeCenter from "../components/HomeCenter";
import { Cog6ToothIcon, HomeIcon, PlusIcon, PowerIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showUserList, setShowUserList] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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

    const navigateToProfile = () => {
        if (user && user.id) {
            navigate(`/profile/${user.id}`);
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
                        <UserCircleIcon
                            className="h-6 w-6 text-gray-500 cursor-pointer"
                        />
                        <PlusIcon
                            className="h-6 w-6 text-gray-500 cursor-pointer"
                            onClick={() => setShowUserList(true)}
                        />
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
                                    <div key={user.id} className="p-2 border-b border-gray-200 flex items-center"> {/* Retrait de justify-between */}
                                        {user.profile_image ? (
                                            <img
                                                src={`http://localhost:8000/storage/${user.profile_image}`}
                                                alt="Profile"
                                                className="h-6 w-6 rounded-full cursor-pointer mr-2"
                                                onClick={navigateToProfile}
                                            />
                                        ) : (
                                            <UserCircleIcon className="h-8 w-8 text-gray-500 rounded-full mr-2" />
                                        )}
                                        <span className="flex-grow text-left">{user.email}</span> {/* Utilisation de flex-grow pour aligner à gauche */}
                                        <button className="bg-blue-500 text-white font-semibold py-1 px-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-200">
                                            Ajoutez le
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-2 text-gray-500">Aucun utilisateur trouvé</div>
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
        </div>
    );
};

export default Home;
