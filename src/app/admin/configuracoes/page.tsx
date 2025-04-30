'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminConfiguracoesPage() {
  const [currentUsername, setCurrentUsername] = useState('');
  // Avoid storing currentPassword in state for security
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false); // State to track client-side rendering
  const router = useRouter();

  useEffect(() => {
    // This effect runs only on the client side
    setIsClient(true);

    // Check authentication only on the client
    const authStatus = localStorage.getItem('adminAuthenticated') === 'true';
    setIsAuthenticated(authStatus);

    if (!authStatus) {
      router.push('/admin'); // Redirect to login if not authenticated
      return;
    }

    // Load current username only on the client
    const storedUsername = localStorage.getItem('adminUsername') || '';
    setCurrentUsername(storedUsername);

  }, [router]); // Dependency array includes router

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Basic validation
    if (!newUsername || !newPassword || !confirmPassword) {
      setError('Todos os campos de novas credenciais são obrigatórios.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }

    // Update credentials in localStorage (safe here as it's event handler)
    try {
      localStorage.setItem('adminUsername', newUsername);
      localStorage.setItem('adminPassword', newPassword);
      setMessage('Credenciais atualizadas com sucesso!');
      // Clear form fields after successful update
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      // Update the state holding the 'current' username
      setCurrentUsername(newUsername);
    } catch (err) {
      setError('Erro ao atualizar credenciais. Tente novamente.');
      console.error('Error updating credentials:', err);
    }
  };

  const handleLogout = () => {
    // Safe here as it's event handler
    localStorage.removeItem('adminAuthenticated');
    router.push('/admin');
  };

  // Render nothing until client-side check is complete and authenticated
  if (!isClient || !isAuthenticated) {
    // You can return a loading spinner here if preferred
    // e.g., return <div className="min-h-screen flex items-center justify-center">Verificando autenticação...</div>;
    return null;
  }

  // Render the actual page content only if on client and authenticated
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Configurações do Administrador</h1>
          <div>
            <Link href="/admin/dashboard" className="text-white hover:underline mr-4">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Alterar Credenciais de Acesso</h2>

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdateCredentials}>
            {/* Display current username (optional) */}
            {/* <p className="mb-4 text-sm text-gray-600">Usuário atual: {currentUsername}</p> */}

            <div className="mb-4">
              <label htmlFor="newUsername" className="block text-gray-700 font-medium mb-2">
                Novo Usuário
              </label>
              <input
                type="text"
                id="newUsername"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                Nova Senha
              </label>
              <input
                type="password"
                id="newPassword"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors"
            >
              Atualizar Credenciais
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

