import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/connexion/Login'
import Home from './pages/Home'
import Signup from './pages/connexion/Signup'
import UserProfile from './pages/UserProfile'
import UserInfo from './pages/UserInfo'


function App() {


  return (
    <div>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/home' element= {<Home/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/profile/:id' element={<UserProfile />} /> {/* Nouvelle route pour le profil */}
        <Route path="/profile-user/:userId" element={<UserInfo />} />
      </Routes>
    </div>
  )
}

export default App
