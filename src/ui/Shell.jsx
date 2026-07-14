import { LayoutDashboard, KanbanSquare, FolderKanban, NotebookPen, Sun, Moon, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useMobile } from './comuns'

const ABAS = [
  { id: 'painel', rotulo: 'Painel', Icone: LayoutDashboard },
  { id: 'demandas', rotulo: 'Demandas', Icone: KanbanSquare },
  { id: 'projetos', rotulo: 'Projetos', Icone: FolderKanban },
  { id: 'registros', rotulo: 'Registros', Icone: NotebookPen },
]

export default function Shell({ t, aba, setAba, alternarTema, children }) {
  const mobile = useMobile()

  if (mobile) {
    return (
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: t.bg }}>
        {/* Header mobile */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            paddingTop: 'max(env(safe-area-inset-top), 10px)',
            borderBottom: `1px solid ${t.borda}`,
            background: t.bgMenu,
            flexShrink: 0,
          }}
        >
          <img src={t.logo} alt="Hengst" style={{ height: 44 }} />
          <div style={{ display: 'flex', gap: 4 }}>
            <BotaoIcone t={t} onClick={alternarTema} aria-label="Alternar tema">
              {t.nome === 'escuro' ? <Sun size={20} /> : <Moon size={20} />}
            </BotaoIcone>
            <BotaoIcone t={t} onClick={() => supabase.auth.signOut()} aria-label="Sair">
              <LogOut size={20} />
            </BotaoIcone>
          </div>
        </header>

        {/* Conteúdo */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 16 }}>{children}</main>

        {/* Menu inferior */}
        <nav
          style={{
            display: 'flex',
            borderTop: `1px solid ${t.borda}`,
            background: t.bgMenu,
            paddingBottom: 'max(env(safe-area-inset-bottom), 10px)',
            paddingTop: 6,
            flexShrink: 0,
          }}
        >
          {ABAS.map(({ id, rotulo, Icone }) => {
            const ativo = aba === id
            return (
              <button
                key={id}
                onClick={() => setAba(id)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  padding: '6px 0',
                  color: ativo ? (t.nome === 'escuro' ? t.acento : t.texto) : t.textoFraco,
                }}
              >
                <Icone size={22} strokeWidth={ativo ? 2.4 : 2} />
                <span style={{ fontSize: 11, fontWeight: ativo ? 800 : 600 }}>{rotulo}</span>
              </button>
            )
          })}
        </nav>
      </div>
    )
  }

  // Desktop: menu lateral
  return (
    <div style={{ height: '100dvh', display: 'flex', background: t.bg }}>
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          background: t.bgMenu,
          borderRight: `1px solid ${t.borda}`,
          display: 'flex',
          flexDirection: 'column',
          padding: '26px 16px 20px',
        }}
      >
        <img src={t.logo} alt="Hengst" style={{ width: 180, alignSelf: 'center', marginBottom: 34 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ABAS.map(({ id, rotulo, Icone }) => {
            const ativo = aba === id
            return (
              <button
                key={id}
                onClick={() => setAba(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14.5,
                  fontWeight: ativo ? 800 : 600,
                  color: ativo ? (t.nome === 'escuro' ? t.acento : t.texto) : t.textoSec,
                  background: ativo ? t.selecionadoBg : 'transparent',
                  textAlign: 'left',
                }}
              >
                <Icone size={19} strokeWidth={ativo ? 2.4 : 2} />
                {rotulo}
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={alternarTema}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              borderRadius: 10, border: `1px solid ${t.borda}`, cursor: 'pointer',
              background: 'transparent', color: t.textoSec, fontSize: 14, fontWeight: 600,
            }}
          >
            {t.nome === 'escuro' ? <Sun size={18} /> : <Moon size={18} />}
            Tema {t.nome === 'escuro' ? 'claro' : 'escuro'}
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'transparent', color: t.textoFraco, fontSize: 14, fontWeight: 600,
            }}
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>{children}</div>
      </main>
    </div>
  )
}

function BotaoIcone({ t, children, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: 'transparent',
        border: 'none',
        color: t.textoSec,
        cursor: 'pointer',
        padding: 8,
        display: 'flex',
      }}
    >
      {children}
    </button>
  )
}
