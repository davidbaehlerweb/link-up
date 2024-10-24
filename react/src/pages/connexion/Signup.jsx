import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    profile_image: null, // Initialise à null
  });

  const nav = useNavigate();
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'password_confirmation' || name === 'password') {
      if (formData.password !== formData.password_confirmation) {
        setError({ error: 'Les mots de passe ne correspondent pas' });
      } else {
        setError(null);
      }
    }

    if (name === 'email') {
      setEmailError(null);
      clearTimeout(timeoutId);

      const newTimeoutId = setTimeout(() => {
        validateEmail(value);
        if (!emailError) {
          checkEmailExists(value);
        }
      }, 500);

      setTimeoutId(newTimeoutId);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      setEmailError('Email invalide');
    } else {
      setEmailError(null);
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.post('http://localhost:8000/api/check-email', { email });
      if (response.data.available === false) {
        setEmailError('Cet email existe déjà');
      } else {
        setEmailError('Email valide');
      }
    } catch (err) {
      console.error(err.response ? err.response.data : err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    validateEmail(formData.email);
    await handleEmailBlur();

    if (emailError) {
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError({ error: 'Les mots de passe ne correspondent pas' });
      return;
    }

    // Utiliser FormData pour envoyer les données
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('password_confirmation', formData.password_confirmation);
    if (formData.profile_image) {
      data.append('profile_image', formData.profile_image); // Ajout de l'image
    }

    try {
      const response = await axios.post('http://localhost:8000/api/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important pour l'upload d'images
        },
      });
      setShowModal(true);
      setTimeout(() => {
        nav("/");
      }, 2000);
    } catch (err) {
      if (err.response) {
        setError({ error: err.response.data.message || 'Une erreur s\'est produite. Veuillez réessayer.' });
      } else {
        setError({ error: 'Une erreur s\'est produite. Veuillez réessayer.' });
      }
    }
  };

  const handleEmailBlur = async () => {
    const email = formData.email;
    validateEmail(email);
    if (!emailError) {
      await checkEmailExists(email);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <div className="flex items-center justify-center w-full h-screen m-0 bg-gray-100">
      <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-md text-center bg-white rounded-3xl p-8 shadow-lg">
        <h3 className="mb-3 text-4xl font-extrabold text-gray-900">Sign Up</h3>
        <p className="mb-4 text-gray-700">Enter informations</p>
        <div className="flex items-center mb-3">
          <hr className="h-0 border-b border-solid border-gray-500 grow" />
          <p className="mx-4 text-gray-600">or</p>
          <hr className="h-0 border-b border-solid border-gray-500 grow" />
        </div>
        <label htmlFor="name" className="mb-2 text-sm text-start text-gray-900">Name*</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="flex items-center w-full px-5 py-4 mb-4 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-gray-900 rounded-2xl" />

        <label htmlFor="email" className="mb-2 text-sm text-start text-gray-900">Email*</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleEmailBlur}
          placeholder="mail@loopple.com"
          className="flex items-center w-full px-5 py-4 mb-4 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-gray-900 rounded-2xl" />

        {emailError && (
          <div className={`text-sm mt-2 ${emailError === 'Cet email existe déjà' ? 'text-red-500' : 'text-green-500'}`}>
            {emailError}
          </div>
        )}

        <label htmlFor="password" className="mb-2 text-sm text-start text-gray-900">Password*</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter a password"
          className="flex items-center w-full px-5 py-4 mb-4 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-gray-900 rounded-2xl" />

        <label htmlFor="confirm_password" className="mb-2 text-sm text-start text-gray-900">Confirm password*</label>
        <input
          id="confirm_password"
          name="password_confirmation"
          type="password"
          value={formData.password_confirmation}
          onChange={handleChange}
          placeholder="Confirm password"
          className="flex items-center w-full px-5 py-4 mb-4 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-gray-900 rounded-2xl" />

        <label htmlFor="profile_image" className="mb-2 text-sm text-start text-gray-900">Image de profil</label>
        <input
          id="profile_image"
          name="profile_image"
          type="file"
          accept="image/*"
          onChange={(e) => setFormData({ ...formData, profile_image: e.target.files[0] })}
          className="flex items-center w-full px-5 py-4 mb-4 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-gray-900 rounded-2xl"
        />

        <button type="submit" className="w-full px-6 py-5 mb-5 text-sm font-bold leading-none text-white transition duration-300 rounded-2xl hover:bg-black focus:ring-4 focus:ring-black bg-black">Sign Up</button>
        <p className="text-sm leading-relaxed text-gray-900">Already have an account? <a href="/" className="font-bold text-gray-700">Sign In</a></p>
      </form>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-5 bg-white rounded-lg shadow-lg max-w-sm">
            <h3 className="text-xl font-bold">Inscription réussie !</h3>
            <p className="mt-2">Votre compte a été créé avec succès.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
