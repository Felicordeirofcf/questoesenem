'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ConfiguracoesPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setMensagem('')

    // Atualiza e-mail
    if (email) {
      const { error } = await supabase.auth.updateUser({ email })
      if (error) {
        setErro(`Erro ao atualizar e-mail: ${error.message}`)
        return
      } else {
        setMensagem('E-mail atualizado com sucesso!')
      }
    }

    // Atualiza senha
    if (senha) {
      const { error } = await supabase.auth.updateUser({ password: senha })
      if (error) {
        setErro(`Erro ao atualizar senha: ${error.message}`)
        return
      } else {
        setMensagem((prev) => prev + '\nSenha atualizada com sucesso!')
      }
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
      <h2>Alterar E-mail ou Senha</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Novo E-mail:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Digite um novo e-mail"
          />
        </label>
        <br /><br />
        <label>
          Nova Senha:
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="Digite uma nova senha"
          />
        </label>
        <br /><br />
        <button type="submit">Atualizar Dados</button>
      </form>

      {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  )
}
