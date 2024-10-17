import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/connexion/Login'
import Home from './pages/Home'
import Signup from './pages/connexion/Signup'


function App() {


  return (
    <div>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/home' element= {<Home/>}/>
        <Route path='/signup' element={<Signup/>}/>
      </Routes>
    </div>
  )
}

export default App
