import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [stayConnected, setStayConnected] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      nav('/produits');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (e) => {
    setStayConnected(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.get('https://api.link-up-io.tech/sanctum/csrf-cookie', { withCredentials: true });
      const response = await axios.post('https://api.link-up-io.tech/api/login', formData, { withCredentials: true });

      if (response.data.token) {
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('token', response.data.token);
        setShowModal(true);
        setTimeout(() => {
          nav("/home");
        }, 2000);
      } else {
        setError('Erreur de connexion : token manquant.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur s\'est produite. Veuillez réessayer.');
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen m-0 bg-gray-100">
      <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-md text-center bg-white rounded-3xl p-8 shadow-lg">
        <h3 className="mb-3 text-4xl font-extrabold text-gray-900">Sign In</h3>
        <p className="mb-4 text-gray-700">Enter your email and password</p>

        <div className="flex items-center mb-3">
          <hr className="h-0 border-b border-solid border-gray-500 grow" />
          <p className="mx-4 text-gray-600">or</p>
          <hr className="h-0 border-b border-solid border-gray-500 grow" />
        </div>
        
        <label htmlFor="email" className="mb-2 text-sm text-start text-gray-900">Email*</label>
        <input 
          id="email" 
          type="email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="mail@loopple.com" 
          className="flex items-center w-full px-5 py-4 mb-4 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-gray-900 rounded-2xl" 
        />
        
        <label htmlFor="password" className="mb-2 text-sm text-start text-gray-900">Password*</label>
        <input 
          id="password" 
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange} 
          placeholder="Enter a password" 
          className="flex items-center w-full px-5 py-4 mb-4 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-gray-900 rounded-2xl" 
        />

        <div className="flex flex-row justify-between mb-4">
          <label className="relative inline-flex items-center mr-3 cursor-pointer select-none">
            <input type="checkbox" checked={stayConnected} onChange={handleCheckboxChange} className="sr-only peer" />
            <div className="w-5 h-5 bg-white border-2 rounded-sm border-gray-500 peer peer-checked:border-0 peer-checked:bg-black">
              <img className="" src="https://raw.githubusercontent.com/Loopple/loopple-public-assets/main/motion-tailwind/img/icons/check.png" alt="tick" />
            </div>
            <span className="ml-3 text-sm font-normal text-gray-900">Keep me logged in</span>
          </label>
          <a href="javascript:void(0)" className="mr-4 text-sm font-medium text-black-500">Forget password?</a>
        </div>

        <button type="submit" className="w-full px-6 py-5 mb-5 text-sm font-bold leading-none text-white transition duration-300 rounded-2xl hover:bg-black focus:ring-4 focus:ring-black bg-black">Sign In</button>
        
        <p className="text-sm leading-relaxed text-gray-900">Not registered yet? <a href="/signup" className="font-bold text-gray-700">Create an Account</a></p>
      </form>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-5 shadow-lg max-w-sm">
            <h3 className="text-xl font-bold">Connexion réussie !</h3>
            <p className="mt-2">Vous êtes connecté avec succès.</p>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-5 shadow-lg max-w-sm">
            <h3 className="text-xl font-bold">Erreur de connexion</h3>
            <p className="mt-2">Email ou mot de passe incorrect.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
