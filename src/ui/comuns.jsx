import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Hook: detecta mobile (<= 768px), reagindo a resize
export function useMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const fn = (e) => setMobile(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return mobile
}

// Título de seção: MAIÚSCULAS com barrinha lateral
export function Titulo({ t, children, cor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ width: 4, height: 18, borderRadius: 2, background: cor || t.tituloBarra }} />
      <h2
        style={{
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          color: t.texto,
        }}
      >
        {children}
      </h2>
    </div>
  )
}

export function BotaoPrimario({ t, children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: t.acento,
        color: t.acentoTexto,
        border: 'none',
        borderRadius: 10,
        padding: '11px 18px',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function BotaoGhost({ t, children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: 'transparent',
        color: t.textoSec,
        border: `1px solid ${t.borda}`,
        borderRadius: 10,
        padding: '10px 16px',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function Badge({ cor, bg, children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11.5,
        fontWeight: 700,
        color: cor,
        background: bg,
        borderRadius: 6,
        padding: '3px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

export function Bolinha({ cor }) {
  return <span style={{ width: 9, height: 9, borderRadius: '50%', background: cor, flexShrink: 0 }} />
}

// Campos de formulário
export function Campo({ t, rotulo, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: t.textoSec }}>{rotulo}</span>
      {children}
    </label>
  )
}

export function estiloInput(t) {
  return {
    background: t.inputBg,
    border: `1px solid ${t.borda}`,
    borderRadius: 10,
    padding: '11px 12px',
    fontSize: 15,
    color: t.texto,
    outline: 'none',
    width: '100%',
    minWidth: 0,
    minHeight: 45,
    WebkitAppearance: 'none',
    appearance: 'none',
    colorScheme: t.nome === 'escuro' ? 'dark' : 'light',
  }
}

// Modal: caixinha centrada no desktop, TELA CHEIA no mobile (portal em document.body)
export function Modal({ t, titulo, aberto, fechar, children, rodape }) {
  const mobile = useMobile()
  useEffect(() => {
    if (!aberto) return
    const old = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = old }
  }, [aberto])

  if (!aberto) return null

  const header = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: mobile ? '14px 16px' : '16px 20px',
        paddingTop: mobile ? 'max(env(safe-area-inset-top), 14px)' : 16,
        borderBottom: `1px solid ${t.borda}`,
        flexShrink: 0,
        background: t.card,
      }}
    >
      <strong style={{ fontSize: 16, color: t.texto }}>{titulo}</strong>
      <button
        onClick={fechar}
        aria-label="Fechar"
        style={{
          background: 'transparent',
          border: 'none',
          color: t.textoSec,
          cursor: 'pointer',
          padding: 6,
          display: 'flex',
        }}
      >
        <X size={22} />
      </button>
    </div>
  )

  const footer = rodape && (
    <div
      style={{
        display: 'flex',
        gap: 10,
        justifyContent: 'flex-end',
        padding: mobile ? '12px 16px' : '14px 20px',
        paddingBottom: mobile ? 'max(env(safe-area-inset-bottom), 12px)' : 14,
        borderTop: `1px solid ${t.borda}`,
        flexShrink: 0,
        background: t.card,
      }}
    >
      {rodape}
    </div>
  )

  const conteudo = mobile ? (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: t.card,
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
      }}
    >
      {header}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 16 }}>{children}</div>
      {footer}
    </div>
  ) : (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) fechar() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(1,6,30,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: t.card,
          borderRadius: 16,
          border: `1px solid ${t.borda}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          width: 'min(560px, 100%)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {header}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 20 }}>{children}</div>
        {footer}
      </div>
    </div>
  )

  return createPortal(conteudo, document.body)
}

export function Vazio({ t, children }) {
  return (
    <div
      style={{
        padding: '26px 16px',
        textAlign: 'center',
        color: t.textoFraco,
        fontSize: 14,
        border: `1.5px dashed ${t.borda}`,
        borderRadius: 12,
      }}
    >
      {children}
    </div>
  )
}
