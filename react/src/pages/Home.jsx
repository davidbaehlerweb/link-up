import React from 'react';
import { Sidebar } from '../components/navigations/SideBar';
import { UserSidebar } from '../components/navigations/UserSideBar';

const Home = () => {
    return (
        <div className="flex justify-between">
            <Sidebar /> {/* Sidebar principale à gauche */}
            <UserSidebar /> {/* Sidebar utilisateur à droite */}
        </div>
    );
}

export default Home;
