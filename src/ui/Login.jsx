import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { BotaoPrimario, Campo, estiloInput } from './comuns'

export default function Login({ t }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(e) {
    e?.preventDefault?.()
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return }
    setCarregando(true); setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setCarregando(false)
    if (error) setErro('Não foi possível entrar. Confira e-mail e senha.')
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: t.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        paddingTop: 'max(env(safe-area-inset-top), 20px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 20px)',
      }}
    >
      <div
        style={{
          width: 'min(400px, 100%)',
          background: t.card,
          border: `1px solid ${t.borda}`,
          borderRadius: 18,
          boxShadow: t.sombra,
          padding: 28,
        }}
      >
        <img src={t.logo} alt="Hengst" style={{ width: 190, maxWidth: '80%', display: 'block', margin: '6px auto 22px' }} />
        <p style={{ color: t.textoSec, fontSize: 14, textAlign: 'center', marginBottom: 22 }}>
          Entre para acessar seu painel pessoal.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Campo t={t} rotulo="E-mail">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              style={estiloInput(t)}
              placeholder="voce@email.com"
            />
          </Campo>
          <Campo t={t} rotulo="Senha">
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => { if (e.key === 'Enter') entrar(e) }}
              style={estiloInput(t)}
              placeholder="••••••••"
            />
          </Campo>
          {erro && <div style={{ color: t.atrasado, fontSize: 13.5, fontWeight: 600 }}>{erro}</div>}
          <BotaoPrimario t={t} onClick={entrar} disabled={carregando} style={{ justifyContent: 'center', opacity: carregando ? 0.7 : 1 }}>
            <LogIn size={17} /> {carregando ? 'Entrando…' : 'Entrar'}
          </BotaoPrimario>
        </div>
      </div>
    </div>
  )
}
