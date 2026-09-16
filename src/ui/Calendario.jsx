import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { hojeISO, formatarData } from '../lib/base'
import { CardDemanda } from './Demanda'
import { useMobile, Vazio } from './comuns'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const DIAS_CURTO = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const DIAS_MED = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const DIAS_LONGO = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const ORDEM_PRIO = { alta: 0, media: 1, baixa: 2 }

function iso(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

function rotuloCompleto(isoStr) {
  const [a, m, d] = isoStr.split('-').map(Number)
  const dt = new Date(a, m - 1, d)
  return `${DIAS_LONGO[dt.getDay()]}, ${formatarData(isoStr)}`
}

export default function Calendario({ t, demandas, projetos, abrirDemanda, moverDemanda }) {
  const mobile = useMobile()
  const projMap = Object.fromEntries(projetos.map((p) => [p.id, p]))
  const hoje = hojeISO()

  const inicio = (() => { const d = new Date(); return { ano: d.getFullYear(), mes: d.getMonth() } })()
  const [vista, setVista] = useState(inicio)
  const [diaSel, setDiaSel] = useState(hoje)

  function mudarMes(delta) {
    setVista((v) => {
      const d = new Date(v.ano, v.mes + delta, 1)
      return { ano: d.getFullYear(), mes: d.getMonth() }
    })
  }
  function irHoje() {
    const d = new Date()
    setVista({ ano: d.getFullYear(), mes: d.getMonth() })
    setDiaSel(hojeISO())
  }

  // agrupa demandas por dia (prazo) e conta as sem prazo
  const porDia = {}
  let semPrazo = 0
  demandas.forEach((d) => {
    if (d.prazo) (porDia[d.prazo] = porDia[d.prazo] || []).push(d)
    else semPrazo++
  })

  // monta a grade do mês (começando no domingo)
  const inicioSemana = new Date(vista.ano, vista.mes, 1).getDay()
  const diasNoMes = new Date(vista.ano, vista.mes + 1, 0).getDate()
  const celulas = []
  for (let i = 0; i < inicioSemana; i++) celulas.push(null)
  for (let dia = 1; dia <= diasNoMes; dia++) celulas.push(dia)

  const listaDia = (porDia[diaSel] || []).slice().sort((a, b) => {
    const ca = a.status === 'concluido' ? 1 : 0
    const cb = b.status === 'concluido' ? 1 : 0
    if (ca !== cb) return ca - cb
    return (ORDEM_PRIO[a.prioridade] ?? 9) - (ORDEM_PRIO[b.prioridade] ?? 9)
  })

  const gap = mobile ? 4 : 6

  return (
    <div>
      {/* Navegação do mês */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <strong style={{ fontSize: 17, fontWeight: 800, color: t.texto, minWidth: mobile ? 0 : 190 }}>
          {MESES[vista.mes]} {vista.ano}
        </strong>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          <button onClick={irHoje} style={botaoNav(t, true)}>Hoje</button>
          <button onClick={() => mudarMes(-1)} aria-label="Mês anterior" style={botaoNav(t)}><ChevronLeft size={18} /></button>
          <button onClick={() => mudarMes(1)} aria-label="Próximo mês" style={botaoNav(t)}><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Cabeçalho dos dias da semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap, marginBottom: gap }}>
        {(mobile ? DIAS_CURTO : DIAS_MED).map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: t.textoFraco, textTransform: 'uppercase', letterSpacing: '.03em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap }}>
        {celulas.map((dia, i) => {
          if (dia === null) return <div key={`v${i}`} />
          const isoDia = iso(vista.ano, vista.mes, dia)
          const lista = porDia[isoDia] || []
          const ehHoje = isoDia === hoje
          const sel = isoDia === diaSel
          return (
            <button
              key={isoDia}
              onClick={() => setDiaSel(isoDia)}
              style={{
                minHeight: mobile ? 48 : 92,
                background: sel ? t.selecionadoBg : t.card,
                border: `1px solid ${sel ? t.acento : t.borda}`,
                borderRadius: 10,
                padding: mobile ? '4px 3px' : '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                cursor: 'pointer',
                textAlign: 'left',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontSize: mobile ? 12 : 12.5,
                  fontWeight: ehHoje ? 800 : 600,
                  color: ehHoje ? t.acentoTexto : t.textoSec,
                  background: ehHoje ? t.acento : 'transparent',
                  borderRadius: 6,
                  width: ehHoje ? (mobile ? 20 : 22) : 'auto',
                  height: ehHoje ? (mobile ? 20 : 22) : 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'flex-start',
                  flexShrink: 0,
                }}
              >
                {dia}
              </span>

              {/* MOBILE: bolinhas · DESKTOP: mini-chips */}
              {lista.length > 0 && (mobile ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 'auto' }}>
                  {lista.slice(0, 4).map((d) => (
                    <span key={d.id} style={{ width: 6, height: 6, borderRadius: '50%', background: t.prioridade[d.prioridade], opacity: d.status === 'concluido' ? 0.4 : 1 }} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2, overflow: 'hidden' }}>
                  {lista.slice(0, 3).map((d) => (
                    <div
                      key={d.id}
                      onClick={(e) => { e.stopPropagation(); abrirDemanda(d) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: t.inputBg, borderRadius: 5, padding: '2px 5px', minWidth: 0 }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: t.prioridade[d.prioridade] }} />
                      <span style={{ fontSize: 11, color: t.texto, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: d.status === 'concluido' ? 'line-through' : 'none', opacity: d.status === 'concluido' ? 0.6 : 1 }}>
                        {d.titulo}
                      </span>
                    </div>
                  ))}
                  {lista.length > 3 && <span style={{ fontSize: 10.5, color: t.textoFraco, paddingLeft: 2 }}>+{lista.length - 3}</span>}
                </div>
              ))}
            </button>
          )
        })}
      </div>

      {semPrazo > 0 && (
        <p style={{ fontSize: 12, color: t.textoFraco, marginTop: 10 }}>
          {semPrazo} demanda{semPrazo > 1 ? 's' : ''} sem prazo não aparece{semPrazo > 1 ? 'm' : ''} no calendário.
        </p>
      )}

      {/* Lista do dia selecionado */}
      <div style={{ marginTop: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <CalendarDays size={16} color={t.textoSec} />
          <strong style={{ fontSize: 14, color: t.texto }}>{rotuloCompleto(diaSel)}</strong>
          {listaDia.length > 0 && (
            <span style={{ fontSize: 12.5, color: t.textoFraco }}>· {listaDia.length} demanda{listaDia.length > 1 ? 's' : ''}</span>
          )}
        </div>
        {listaDia.length === 0 ? (
          <Vazio t={t}>Nada com prazo nesse dia.</Vazio>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {listaDia.map((d) => (
              <CardDemanda key={d.id} t={t} d={d} projeto={projMap[d.projeto_id]} abrir={abrirDemanda} mover={moverDemanda} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function botaoNav(t, texto) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: t.card,
    border: `1px solid ${t.borda}`,
    borderRadius: 9,
    padding: texto ? '7px 12px' : '7px 9px',
    fontSize: 13,
    fontWeight: 700,
    color: t.textoSec,
    cursor: 'pointer',
  }
}
