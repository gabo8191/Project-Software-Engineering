import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Package, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { authService } from '../services/authService';
import { useAuth } from '../stores/useAuth';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.authUser(formData);
      login({
        id: response.user?.id || response.user_id || '1',
        username: formData.username,
        email: response.user?.email,
        token: response.token
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 h-16 flex items-center">
        <Link to="/" className="flex items-center">
          <Package className="h-8 w-8 text-primary-600" />
          <span className="ml-2 text-xl font-semibold text-gray-900">OrderFlow</span>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md mx-auto animate-slide-up">
          <div className="mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Volver al inicio
            </Link>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
            <p className="text-gray-600 mt-2">Accede a tu cuenta de OrderFlow</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <Input
              id="username"
              name="username"
              type="text"
              label="Usuario"
              placeholder="tu_usuario"
              value={formData.username}
              onChange={handleChange}
              icon={<Mail size={18} />}
              autoComplete="username"
              required
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock size={18} />}
              autoComplete="current-password"
              required
            />

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="flex items-center mb-6 mt-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Recordarme
              </label>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="transition-all duration-300"
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Registrarse
              </Link>
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default LoginPage;