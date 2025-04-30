/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminConfiguracoesPage() {
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.push('/admin'); // Redirect to login if not authenticated
      return;
    }

    // Load current credentials (optional, for display or verification if needed)
    const storedUsername = localStorage.getItem('adminUsername') || '';
    const storedPassword = localStorage.getItem('adminPassword') || '';
    setCurrentUsername(storedUsername); // Store for potential future use/display
    // Avoid storing the actual password in state for security reasons unless necessary for verification

  }, [router]);

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

    // Update credentials in localStorage
    try {
      localStorage.setItem('adminUsername', newUsername);
      localStorage.setItem('adminPassword', newPassword);
      setMessage('Credenciais atualizadas com sucesso!');
      // Clear form fields after successful update
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      // Optionally, update the state holding the 'current' username if displayed
      setCurrentUsername(newUsername);
    } catch (err) {
      setError('Erro ao atualizar credenciais. Tente novamente.');
      console.error('Error updating credentials:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    router.push('/admin');
  };

  // Render nothing or a loading state until authentication check is complete
  if (localStorage.getItem('adminAuthenticated') !== 'true') {
    return null; // Or a loading spinner
  }

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

