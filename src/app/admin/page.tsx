'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin403871';

export default function AdminLoginPage() {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('adminUsername') || !localStorage.getItem('adminPassword')) {
      localStorage.setItem('adminUsername', DEFAULT_USERNAME);
      localStorage.setItem('adminPassword', DEFAULT_PASSWORD);
      console.log('Default admin credentials set in localStorage.');
    }
  }, []);

  const getCredentials = () => {
    const storedUsername = localStorage.getItem('adminUsername');
    const storedPassword = localStorage.getItem('adminPassword');
    return {
      username: storedUsername || DEFAULT_USERNAME,
      password: storedPassword || DEFAULT_PASSWORD,
    };
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const { username: storedUsername, password: storedPassword } = getCredentials();

    if (usernameInput === storedUsername && passwordInput === storedPassword) {
      localStorage.setItem('adminAuthenticated', 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-200 flex flex-col text-black">
      {/* Cabeçalho */}
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Questões do ENEM</h1>
          <Link
            href="/"
            className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-md transition-colors"
          >
            Voltar para Início
          </Link>
        </div>
      </header>

      {/* Formulário */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Área de Administração</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                Usuário
              </label>
              <input
                type="text"
                id="username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className="w-full p-3 border border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full p-3 border border-gray-400 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Caso perca o acesso, entre em contato pelo WhatsApp:
              <br />
              <a
                href="https://wa.me/5521987708652"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                21 98770-8652 (Felipe Ferreira)
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
