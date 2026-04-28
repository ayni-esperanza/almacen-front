import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm';
import { useAuth } from '../shared/hooks/useAuth';

export const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (user?.isAuthenticated && !isExiting) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate, isExiting]);

  const handleLogin = async (credentials: { username: string; password: string }) => {
    const result = await login(credentials);
    if (result.success) {
      setIsExiting(true);
      window.setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 320);
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
  };

  return (
    <LoginForm
      onLogin={handleLogin}
      error={error}
      animationState={isExiting ? 'exit' : 'enter'}
    />
  );
};
