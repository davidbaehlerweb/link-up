import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  const nav = useNavigate();
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [showModal, setShowModal] = useState(false); // État pour le modal
  const [timeoutId, setTimeoutId] = useState(null); // Pour gérer le délai de vérification de l'email

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
      clearTimeout(timeoutId); // Clear existing timeout

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
      console.log('Email to check:', email); // Ajoutez ceci
      const response = await axios.post('http://localhost:8000/api/check-email', { email });
      if (response.data.available === false) {
        setEmailError('Cet email existe déjà');
      } else {
        setEmailError('Email valide');
      }
    } catch (err) {
      // Gestion des erreurs (facultatif)
      console.error(err.response ? err.response.data : err); // Affichez l'erreur
    }
  };

  const handleSubmit = async (e) => {
    console.log('form data: ', formData);
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

    try {
      const response = await axios.post('http://localhost:8000/api/register', formData);
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
        <a className="flex items-center justify-center w-full py-4 mb-6 text-sm font-medium transition duration-300 rounded-2xl text-gray-900 bg-gray-300 hover:bg-gray-400 focus:ring-4 focus:ring-gray-300">
          <img className="h-5 mr-2" src="https://raw.githubusercontent.com/Loopple/loopple-public-assets/main/motion-tailwind/img/logos/logo-google.png" alt="" />
          Sign in with Google
        </a>
        <div className="flex items-center mb-3">
          <hr className="h-0 border-b border-solid border-gray-500 grow" />
          <p className="mx-4 text-gray-600">or</p>
          <hr className="h-0 border-b border-solid border-gray-500 grow" />
        </div>
        <label htmlFor="name" className="mb-2 text-sm text-start text-gray-900">Name*</label>
        <input
          id="name"
          name="name" // Ajout de l'attribut name
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="flex items-center w-full px-5 py-4 mb-4 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-gray-900 rounded-2xl" />

        <label htmlFor="email" className="mb-2 text-sm text-start text-gray-900">Email*</label>
        <input
          id="email"
          name="email" // Ajout de l'attribut name
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleEmailBlur}
          placeholder="mail@loopple.com"
          className="flex items-center w-full px-5 py-4 mb-4 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-gray-900 rounded-2xl" />

        {/* Affichage du message d'erreur ou de succès */}
        {emailError && (
          <div className={`text-sm mt-2 ${emailError === 'Cet email existe déjà' ? 'text-red-500' : 'text-green-500'}`}>
            {emailError}
          </div>
        )}

        <label htmlFor="password" className="mb-2 text-sm text-start text-gray-900">Password*</label>
        <input
          id="password"
          name="password" // Ajout de l'attribut name
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter a password"
          className="flex items-center w-full px-5 py-4 mb-4 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-gray-900 rounded-2xl" />

        <label htmlFor="confirm_password" className="mb-2 text-sm text-start text-gray-900">Confirm password*</label>
        <input
          id="confirm_password"
          name="password_confirmation" // Ajout de l'attribut name
          type="password"
          value={formData.password_confirmation}
          onChange={handleChange}
          placeholder="Confirm password"
          className="flex items-center w-full px-5 py-4 mb-4 text-sm font-medium outline-none focus:bg-gray-400 placeholder:text-gray-700 bg-gray-200 text-gray-900 rounded-2xl" />

        <button type="submit" className="w-full px-6 py-5 mb-5 text-sm font-bold leading-none text-white transition duration-300 rounded-2xl hover:bg-black focus:ring-4 focus:ring-black bg-black">Sign In</button>
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
