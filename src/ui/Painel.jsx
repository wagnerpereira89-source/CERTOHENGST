import { AlarmClock, CalendarDays, Zap, FolderKanban, ChevronRight, AlertTriangle, Lightbulb, CheckCircle2, MessagesSquare, Wrench, Pin } from 'lucide-react'
import { estadoPrazo, hojeISO, TIPOS_REGISTRO, formatarHora, rotuloDia } from '../lib/base'
import { CardDemanda } from './Demanda'
import { Titulo, Vazio } from './comuns'

const ICONES = { AlertTriangle, Lightbulb, CheckCircle2, MessagesSquare, Wrench, Pin }

export default function Painel({ t, demandas, projetos, registros = [], abrirDemanda, irProjeto, moverDemanda, irRegistros }) {
  const ativas = demandas.filter((d) => d.status !== 'concluido')
  const atrasadas = ativas.filter((d) => estadoPrazo(d) === 'atrasado')
  const hoje = ativas.filter((d) => estadoPrazo(d) === 'hoje')
  const altas = ativas
    .filter((d) => d.prioridade === 'alta' && estadoPrazo(d) === 'normal')
  const projMap = Object.fromEntries(projetos.map((p) => [p.id, p]))

  const projAtivos = projetos
    .filter((p) => p.status === 'ativo')
    .map((p) => {
      const ds = demandas.filter((d) => d.projeto_id === p.id)
      const done = ds.filter((d) => d.status === 'concluido').length
      const pct = ds.length ? Math.round((done / ds.length) * 100) : 0
      return { ...p, total: ds.length, done, pct }
    })

  const vazioGeral = !atrasadas.length && !hoje.length && !altas.length && !projAtivos.length

  const saudacao = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: t.texto, letterSpacing: '-0.02em' }}>{saudacao}!</h1>
        <p style={{ color: t.textoSec, fontSize: 14.5, marginTop: 4 }}>{resumoDoDia(t, atrasadas.length, hoje.length, altas.length)}</p>
      </div>

      {vazioGeral && (
        <Vazio t={t}>Tudo em ordem por aqui. Cadastre demandas na aba Demandas para começar.</Vazio>
      )}

      {atrasadas.length > 0 && (
        <section>
          <Titulo t={t} cor={t.atrasado}>Atrasadas · {atrasadas.length}</Titulo>
          <Grade>
            {atrasadas.map((d) => (
              <CardDemanda key={d.id} t={t} d={d} projeto={projMap[d.projeto_id]} abrir={abrirDemanda} mover={moverDemanda} />
            ))}
          </Grade>
        </section>
      )}

      {hoje.length > 0 && (
        <section>
          <Titulo t={t} cor={t.hoje}>Vencem hoje · {hoje.length}</Titulo>
          <Grade>
            {hoje.map((d) => (
              <CardDemanda key={d.id} t={t} d={d} projeto={projMap[d.projeto_id]} abrir={abrirDemanda} mover={moverDemanda} />
            ))}
          </Grade>
        </section>
      )}

      {altas.length > 0 && (
        <section>
          <Titulo t={t}>Prioridade alta · {altas.length}</Titulo>
          <Grade>
            {altas.map((d) => (
              <CardDemanda key={d.id} t={t} d={d} projeto={projMap[d.projeto_id]} abrir={abrirDemanda} mover={moverDemanda} />
            ))}
          </Grade>
        </section>
      )}

      {projAtivos.length > 0 && (
        <section>
          <Titulo t={t}>Projetos em andamento · {projAtivos.length}</Titulo>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {projAtivos.map((p) => (
              <button
                key={p.id}
                onClick={() => irProjeto(p.id)}
                style={{
                  textAlign: 'left',
                  background: t.card,
                  border: `1px solid ${t.borda}`,
                  borderRadius: 14,
                  boxShadow: t.sombra,
                  padding: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FolderKanban size={17} color={t.textoSec} />
                  <strong style={{ fontSize: 15, color: t.texto }}>{p.nome}</strong>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: t.textoSec, marginBottom: 6 }}>
                    <span>{p.done} de {p.total} concluídas</span>
                    <strong style={{ color: t.texto }}>{p.pct}%</strong>
                  </div>
                  <Barra t={t} pct={p.pct} />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {registros.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 4, height: 18, borderRadius: 2, background: t.tituloBarra }} />
              <h2 style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: t.texto }}>
                Últimos registros
              </h2>
            </div>
            {irRegistros && (
              <button
                onClick={irRegistros}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: t.textoSec, fontSize: 12.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 2 }}
              >
                Ver todos <ChevronRight size={14} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {registros.slice(0, 3).map((r) => {
              const spec = TIPOS_REGISTRO.find((x) => x.id === r.tipo) || TIPOS_REGISTRO[5]
              const cor = t[spec.corToken] || t.textoSec
              const bg = t[spec.corToken + 'Bg'] || t.inputBg
              const Icone = ICONES[spec.icone] || Pin
              return (
                <button
                  key={r.id}
                  onClick={irRegistros}
                  style={{
                    textAlign: 'left', display: 'flex', gap: 12, alignItems: 'flex-start',
                    background: t.card, border: `1px solid ${t.borda}`, borderLeft: `3px solid ${cor}`,
                    borderRadius: 12, boxShadow: t.sombra, padding: '10px 12px', cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, color: cor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icone size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, color: t.textoFraco, fontWeight: 700, marginBottom: 2 }}>
                      {rotuloDia(r.quando)} · {formatarHora(r.quando)}
                    </div>
                    <strong style={{ fontSize: 14, color: t.texto, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.titulo}
                    </strong>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function resumoDoDia(t, a, h, alt) {
  const partes = []
  if (a) partes.push(`${a} atrasada${a > 1 ? 's' : ''}`)
  if (h) partes.push(`${h} para hoje`)
  if (alt) partes.push(`${alt} de alta prioridade`)
  if (!partes.length) return 'Nenhuma pendência urgente no radar.'
  return 'Para atacar: ' + partes.join(', ') + '.'
}

function Grade({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>{children}</div>
}

export function Barra({ t, pct }) {
  return (
    <div style={{ height: 8, borderRadius: 5, background: t.inputBg, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: t.acento, borderRadius: 5, transition: 'width .3s' }} />
    </div>
  )
}
