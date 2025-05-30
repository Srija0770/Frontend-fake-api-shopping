import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*?\)/, ''));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/home');
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*?\)/, ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form-wrapper">
        <form onSubmit={login} className="login-form">
          <div className="form-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Please enter your details to login</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="login-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="login-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            className="login-button" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <button 
            className="google-login-button" 
            type="button" 
            onClick={loginWithGoogle}
            disabled={isLoading}
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="google-icon"
            />
            Continue with Google
          </button>

          <p className="login-footer">
            Don't have an account?{' '}
            <Link to="/" className="signup-link">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
