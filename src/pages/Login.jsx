import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember_me: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear errors when user types
    if (errors[name]) {
      setErrors({...errors, [name]: ''});
    }
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Veuillez entrer un email valide";
    }
    
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          remember_me: formData.remember_me
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API validation errors
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.message) {
          setApiError(data.message);
        } else {
          setApiError("Une erreur est survenue lors de la connexion");
        }
        return;
      }

      // Login successful - handle token/user data
      console.log('Login successful:', data);
      
      // Store token if available
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      // Redirect to dashboard or home page
      navigate('/');

    } catch (error) {
      console.error('Login error:', error);
      setApiError("Erreur de connexion au serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Connexion à votre compte</h2>
        <p className="login-subtitle">Accédez à votre espace Verdure</p>
        
        {apiError && <div className="api-error">{apiError}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="votre@email.com"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="••••••••"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          <div className="remember-container">
            <input
              type="checkbox"
              id="remember_me"
              name="remember_me"
              checked={formData.remember_me}
              onChange={handleChange}
            />
            <label htmlFor="remember_me">Se souvenir de moi</label>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        
        <div className="login-footer">
          <a href="/forgot-password">Mot de passe oublié ?</a>
          <span className="divider">|</span>
          <a href="/register">Créer un compte</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;