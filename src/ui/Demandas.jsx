import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ETAPAS } from '../lib/base'
import { CardDemanda } from './Demanda'
import { BotaoPrimario, useMobile, Vazio } from './comuns'

export default function Demandas({ t, demandas, projetos, novaDemanda, abrirDemanda, moverDemanda }) {
  const mobile = useMobile()
  const projMap = Object.fromEntries(projetos.map((p) => [p.id, p]))
  const [abaEtapa, setAbaEtapa] = useState('a_fazer')
  const [arrastando, setArrastando] = useState(null)
  const [alvo, setAlvo] = useState(null)

  const porEtapa = (id) =>
    demandas
      .filter((d) => d.status === id)
      .sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0) || (a.created_at > b.created_at ? 1 : -1))

  const cabecalho = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: t.texto }}>Demandas</h1>
      <BotaoPrimario t={t} onClick={novaDemanda}><Plus size={17} /> Nova</BotaoPrimario>
    </div>
  )

  // ---------- MOBILE: abas de etapa ----------
  if (mobile) {
    const lista = porEtapa(abaEtapa)
    return (
      <div>
        {cabecalho}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: t.inputBg, borderRadius: 12, padding: 4 }}>
          {ETAPAS.map((e) => {
            const ativo = abaEtapa === e.id
            const n = porEtapa(e.id).length
            return (
              <button
                key={e.id}
                onClick={() => setAbaEtapa(e.id)}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: 9,
                  padding: '9px 4px',
                  cursor: 'pointer',
                  fontSize: 12.5,
                  fontWeight: ativo ? 800 : 600,
                  background: ativo ? t.card : 'transparent',
                  color: ativo ? t.texto : t.textoSec,
                  boxShadow: ativo ? t.sombra : 'none',
                }}
              >
                {e.rotulo} {n > 0 && <span style={{ opacity: 0.7 }}>· {n}</span>}
              </button>
            )
          })}
        </div>
        {lista.length === 0 ? (
          <Vazio t={t}>Nenhuma demanda em "{ETAPAS.find((e) => e.id === abaEtapa)?.rotulo}".</Vazio>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lista.map((d) => (
              <CardDemanda key={d.id} t={t} d={d} projeto={projMap[d.projeto_id]} abrir={abrirDemanda} mover={moverDemanda} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ---------- DESKTOP: kanban com drag-and-drop ----------
  return (
    <div>
      {cabecalho}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
        {ETAPAS.map((e) => {
          const lista = porEtapa(e.id)
          const destacar = alvo === e.id
          return (
            <div
              key={e.id}
              onDragOver={(ev) => { ev.preventDefault(); setAlvo(e.id) }}
              onDragLeave={() => setAlvo((a) => (a === e.id ? null : a))}
              onDrop={(ev) => {
                ev.preventDefault()
                const id = ev.dataTransfer.getData('text/plain') || arrastando
                const d = demandas.find((x) => x.id === id)
                if (d && d.status !== e.id) moverDemanda(d, e.id)
                setAlvo(null); setArrastando(null)
              }}
              style={{
                background: destacar ? t.selecionadoBg : t.bgMenu,
                border: `1.5px ${destacar ? 'dashed' : 'solid'} ${destacar ? t.acento : t.borda}`,
                borderRadius: 14,
                padding: 12,
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: t.textoSec }}>
                  {e.rotulo}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: t.textoFraco, background: t.inputBg, borderRadius: 20, padding: '2px 8px' }}>
                  {lista.length}
                </span>
              </div>
              {lista.map((d) => (
                <CardDemanda
                  key={d.id}
                  t={t}
                  d={d}
                  projeto={projMap[d.projeto_id]}
                  abrir={abrirDemanda}
                  mover={moverDemanda}
                  arrastavel
                  aoArrastar={setArrastando}
                />
              ))}
              {lista.length === 0 && (
                <div style={{ fontSize: 13, color: t.textoFraco, textAlign: 'center', padding: '18px 8px' }}>
                  Arraste aqui
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
