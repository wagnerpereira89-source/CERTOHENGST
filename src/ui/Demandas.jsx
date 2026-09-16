import { useState } from 'react'
import { Plus, SlidersHorizontal, X, KanbanSquare, CalendarDays } from 'lucide-react'
import { ETAPAS, PRIORIDADES } from '../lib/base'
import { CardDemanda } from './Demanda'
import Calendario from './Calendario'
import { BotaoPrimario, useMobile, Vazio } from './comuns'

export default function Demandas({ t, demandas, projetos, responsaveis = [], novaDemanda, abrirDemanda, moverDemanda }) {
  const mobile = useMobile()
  const projMap = Object.fromEntries(projetos.map((p) => [p.id, p]))
  const [abaEtapa, setAbaEtapa] = useState('a_fazer')
  const [arrastando, setArrastando] = useState(null)
  const [alvo, setAlvo] = useState(null)
  const [visao, setVisao] = useState('quadro') // 'quadro' | 'calendario'

  // ---------- FILTROS ----------
  const [fPrioridade, setFPrioridade] = useState('todas')
  const [fResponsavel, setFResponsavel] = useState('todos')
  const filtrando = fPrioridade !== 'todas' || fResponsavel !== 'todos'

  const passaFiltro = (d) => {
    if (fPrioridade !== 'todas' && d.prioridade !== fPrioridade) return false
    if (fResponsavel === 'sem' && d.responsavel) return false
    if (fResponsavel !== 'todos' && fResponsavel !== 'sem' && d.responsavel !== fResponsavel) return false
    return true
  }

  const demandasFiltradas = demandas.filter(passaFiltro)

  const porEtapa = (id) =>
    demandasFiltradas
      .filter((d) => d.status === id)
      .sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0) || (a.created_at > b.created_at ? 1 : -1))

  function limparFiltros() {
    setFPrioridade('todas')
    setFResponsavel('todos')
  }

  const cabecalho = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: t.texto }}>Demandas</h1>
      <BotaoPrimario t={t} onClick={novaDemanda}><Plus size={17} /> Nova</BotaoPrimario>
    </div>
  )

  const alternador = (
    <div style={{ display: 'inline-flex', gap: 4, background: t.inputBg, borderRadius: 10, padding: 4, marginBottom: 14 }}>
      {[['quadro', 'Quadro', KanbanSquare], ['calendario', 'Calendário', CalendarDays]].map(([id, rot, Ic]) => {
        const ativo = visao === id
        return (
          <button
            key={id}
            onClick={() => setVisao(id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 8,
              padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: ativo ? 800 : 600,
              background: ativo ? t.card : 'transparent', color: ativo ? t.texto : t.textoSec,
              boxShadow: ativo ? t.sombra : 'none',
            }}
          >
            <Ic size={15} /> {rot}
          </button>
        )
      })}
    </div>
  )

  const barraFiltros = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: t.textoFraco, fontSize: 12.5, fontWeight: 700 }}>
        <SlidersHorizontal size={15} /> {!mobile && 'Filtrar'}
      </div>

      <select value={fPrioridade} onChange={(e) => setFPrioridade(e.target.value)} style={estiloFiltro(t, fPrioridade !== 'todas')}>
        <option value="todas">Toda prioridade</option>
        {PRIORIDADES.map((p) => <option key={p.id} value={p.id}>{p.rotulo}</option>)}
      </select>

      <select value={fResponsavel} onChange={(e) => setFResponsavel(e.target.value)} style={estiloFiltro(t, fResponsavel !== 'todos')}>
        <option value="todos">Todos os responsáveis</option>
        <option value="sem">Sem responsável</option>
        {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      {filtrando && (
        <button
          onClick={limparFiltros}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'transparent', border: `1px solid ${t.borda}`, borderRadius: 9,
            padding: '7px 10px', fontSize: 12.5, fontWeight: 700, color: t.textoSec, cursor: 'pointer',
          }}
        >
          <X size={14} /> Limpar
        </button>
      )}
    </div>
  )

  // ---------- QUADRO: mobile (abas de etapa) ----------
  const quadroMobile = (() => {
    const lista = porEtapa(abaEtapa)
    return (
      <div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: t.inputBg, borderRadius: 12, padding: 4 }}>
          {ETAPAS.map((e) => {
            const ativo = abaEtapa === e.id
            const n = porEtapa(e.id).length
            return (
              <button
                key={e.id}
                onClick={() => setAbaEtapa(e.id)}
                style={{
                  flex: 1, border: 'none', borderRadius: 9, padding: '9px 4px', cursor: 'pointer',
                  fontSize: 12.5, fontWeight: ativo ? 800 : 600,
                  background: ativo ? t.card : 'transparent', color: ativo ? t.texto : t.textoSec,
                  boxShadow: ativo ? t.sombra : 'none',
                }}
              >
                {e.rotulo} {n > 0 && <span style={{ opacity: 0.7 }}>· {n}</span>}
              </button>
            )
          })}
        </div>
        {lista.length === 0 ? (
          <Vazio t={t}>
            {filtrando ? 'Nenhuma demanda com esses filtros.' : `Nenhuma demanda em "${ETAPAS.find((e) => e.id === abaEtapa)?.rotulo}".`}
          </Vazio>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lista.map((d) => (
              <CardDemanda key={d.id} t={t} d={d} projeto={projMap[d.projeto_id]} abrir={abrirDemanda} mover={moverDemanda} />
            ))}
          </div>
        )}
      </div>
    )
  })()

  // ---------- QUADRO: desktop (kanban drag-and-drop) ----------
  const quadroDesktop = (
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
              borderRadius: 14, padding: 12, minHeight: 200,
              display: 'flex', flexDirection: 'column', gap: 10,
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
                {filtrando ? 'Nada com esse filtro' : 'Arraste aqui'}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <div>
      {cabecalho}
      {alternador}
      {barraFiltros}
      {visao === 'calendario' ? (
        <Calendario
          t={t}
          demandas={demandasFiltradas}
          projetos={projetos}
          abrirDemanda={abrirDemanda}
          moverDemanda={moverDemanda}
        />
      ) : mobile ? quadroMobile : quadroDesktop}
    </div>
  )
}

// Estilo dos selects de filtro (aparência nativa, com destaque quando ativo)
function estiloFiltro(t, ativo) {
  return {
    background: ativo ? t.selecionadoBg : t.card,
    border: `1px solid ${ativo ? t.acento : t.borda}`,
    borderRadius: 9,
    padding: '7px 10px',
    fontSize: 13,
    fontWeight: 600,
    color: t.texto,
    cursor: 'pointer',
    outline: 'none',
    maxWidth: '48vw',
    colorScheme: t.nome === 'escuro' ? 'dark' : 'light',
  }
}
