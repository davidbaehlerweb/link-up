import React, { useEffect, useState } from "react";
import {
    Card,
    Typography,
    List,
    ListItem,
    ListItemPrefix,
    ListItemSuffix,
    Chip,
    Alert,
    Input,
} from "@material-tailwind/react";
import {
    PresentationChartBarIcon,
    ShoppingBagIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    InboxIcon,
    PowerIcon,
    HomeIcon,
    PlusIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import {
    CubeTransparentIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from '../../assets/image_logo.png'; // Remplace avec le chemin correct de ton logo

export function Sidebar() {
    const [openAlert, setOpenAlert] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    return (
        <Card className="h-screen flex flex-col w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 relative">
            <div className="mb-2 flex items-center gap-4 p-4">
                <img src={Logo} alt="Logo" className="h-12 w-12 mr-2" /> {/* Utilisation de marge négative ici */}
                <Typography className="font-bold" variant="h5" color="blue-gray">
                    LinkUp
                </Typography>
            </div>

            <div className="flex items-center mb-4">
    <MagnifyingGlassIcon className="ml-2 h-6 w-6 text-gray-500 mr-5 " />
    <Input
        placeholder="Rechercher"
        value={searchQuery}
        onChange={handleSearchChange}
        className="mr-3 flex-grow rounded-full text-lg py-2" // Ajout de padding vertical si nécessaire
    />
</div>

            <List className="flex-grow overflow-y-auto">
                <ListItem className="mb-6">
                    <ListItemPrefix>
                        <HomeIcon className="h-6 w-6" />
                    </ListItemPrefix>
                    <Typography className="text-lg">Accueil</Typography>
                </ListItem>

                <ListItem className="mb-6">
                    <ListItemPrefix>
                        <PlusIcon className="h-6 w-6" />
                    </ListItemPrefix>
                    <Typography className="text-lg">Meilleures Publications</Typography>
                </ListItem>

                <hr className="my-2 border-blue-gray-50" />

                <ListItem className="mb-6">
                    <ListItemPrefix>
                        <InboxIcon className="h-6 w-6" />
                    </ListItemPrefix>
                    <Typography className="text-lg">Messages</Typography>
                    <ListItemSuffix>
                        <Chip value="14" size="sm" variant="ghost" className="rounded-full text-red-600" />
                    </ListItemSuffix>
                </ListItem>

                <ListItem className="mb-6">
                    <ListItemPrefix>
                        <UserCircleIcon className="h-6 w-6" />
                    </ListItemPrefix>
                    <Typography className="text-lg">Profil</Typography>
                </ListItem>

                <ListItem className="mb-6">
                    <ListItemPrefix>
                        <Cog6ToothIcon className="h-6 w-6" />
                    </ListItemPrefix>
                    <Typography className="text-lg">Réglages</Typography>
                </ListItem>

                <ListItem className="mb-3" onClick={handleLogout}>
                    <ListItemPrefix>
                        <PowerIcon className="h-6 w-6" />
                    </ListItemPrefix>
                    <Typography className="text-lg">Déconnexion</Typography>
                </ListItem>
            </List>

            <Alert open={openAlert} className="mt-auto" onClose={() => setOpenAlert(false)}>
                <CubeTransparentIcon className="mb-4 h-12 w-12" />
                <Typography variant="h6" className="mb-1">
                    Upgrade to PRO
                </Typography>
                <Typography variant="small" className="font-normal opacity-80">
                    Upgrade to Material Tailwind PRO and get even more components, plugins, advanced features
                    and premium.
                </Typography>
                <div className="mt-4 flex gap-3">
                    <Typography
                        as="a"
                        href="#"
                        variant="small"
                        className="font-medium opacity-80"
                        onClick={() => setOpenAlert(false)}
                    >
                        Dismiss
                    </Typography>
                    <Typography as="a" href="#" variant="small" className="font-medium">
                        Upgrade Now
                    </Typography>
                </div>
            </Alert>
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-5 shadow-lg max-w-sm">
                        <h3 className="text-xl font-bold">Déconnexion réussie !</h3>
                        <p className="mt-2">Vous êtes déconnecté avec succès.</p>
                    </div>
                </div>
            )}
        </Card>
    );
}
