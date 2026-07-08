import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, AlarmClock, CalendarDays, Repeat, Trash2, FolderKanban } from 'lucide-react'
import { ETAPAS, PRIORIDADES, RECORRENCIAS, estadoPrazo, formatarData } from '../lib/base'
import { Badge, Bolinha, BotaoGhost, BotaoPrimario, Campo, Modal, estiloInput, useMobile } from './comuns'

// ---------- CARD ----------
export function CardDemanda({ t, d, projeto, abrir, mover, arrastavel, aoArrastar }) {
  const prazo = estadoPrazo(d)
  const idx = ETAPAS.findIndex((e) => e.id === d.status)
  const podeVoltar = idx > 0
  const podeAvancar = idx < ETAPAS.length - 1
  const mobile = useMobile()

  return (
    <div
      draggable={arrastavel || undefined}
      onDragStart={arrastavel ? (e) => { e.dataTransfer.setData('text/plain', d.id); aoArrastar?.(d.id) } : undefined}
      onClick={() => abrir(d)}
      style={{
        background: t.card,
        border: `1px solid ${t.borda}`,
        borderLeft: d.status === 'andamento' ? `3px solid ${t.acento}` : `1px solid ${t.borda}`,
        borderRadius: 12,
        boxShadow: t.sombra,
        padding: '12px 14px',
        cursor: arrastavel ? 'grab' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <Bolinha cor={t.prioridade[d.prioridade]} />
        <strong
          style={{
            fontSize: 14.5,
            color: t.texto,
            lineHeight: 1.35,
            flex: 1,
            textDecoration: d.status === 'concluido' ? 'line-through' : 'none',
            opacity: d.status === 'concluido' ? 0.65 : 1,
          }}
        >
          {d.titulo}
        </strong>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {prazo === 'atrasado' && (
          <Badge cor={t.atrasado} bg={t.atrasadoBg}><AlarmClock size={12} /> Atrasada · {formatarData(d.prazo)}</Badge>
        )}
        {prazo === 'hoje' && (
          <Badge cor={t.hoje} bg={t.hojeBg}><AlarmClock size={12} /> Vence hoje</Badge>
        )}
        {prazo === 'normal' && d.prazo && d.status !== 'concluido' && (
          <Badge cor={t.textoSec} bg="transparent"><CalendarDays size={12} /> {formatarData(d.prazo)}</Badge>
        )}
        {d.recorrencia !== 'nenhuma' && (
          <Badge cor={t.textoSec} bg="transparent"><Repeat size={12} /> {RECORRENCIAS.find((r) => r.id === d.recorrencia)?.rotulo}</Badge>
        )}
        {projeto && (
          <Badge cor={t.textoSec} bg="transparent"><FolderKanban size={12} /> {projeto.nome}</Badge>
        )}
      </div>

      {mover && (
        <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
          <button
            disabled={!podeVoltar}
            onClick={() => mover(d, ETAPAS[idx - 1].id)}
            aria-label="Voltar etapa"
            style={botaoEtapa(t, !podeVoltar)}
          >
            <ChevronLeft size={16} /> {!mobile && 'Voltar'}
          </button>
          <button
            disabled={!podeAvancar}
            onClick={() => mover(d, ETAPAS[idx + 1].id)}
            aria-label="Avançar etapa"
            style={{ ...botaoEtapa(t, !podeAvancar), marginLeft: 'auto' }}
          >
            {!mobile && (podeAvancar && ETAPAS[idx + 1].id === 'concluido' ? 'Concluir' : 'Avançar')} <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

function botaoEtapa(t, desabilitado) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: 'transparent',
    border: `1px solid ${t.borda}`,
    borderRadius: 8,
    padding: '6px 10px',
    fontSize: 12.5,
    fontWeight: 700,
    color: desabilitado ? t.textoFraco : t.textoSec,
    opacity: desabilitado ? 0.4 : 1,
    cursor: desabilitado ? 'default' : 'pointer',
  }
}

// ---------- FORMULÁRIO (MODAL) ----------
export function ModalDemanda({ t, aberto, fechar, salvar, excluir, demanda, projetos, projetoFixo }) {
  const mobile = useMobile()
  const [f, setF] = useState(inicial())

  function inicial() {
    return {
      titulo: '', projeto_id: projetoFixo || '', prazo: '', prioridade: 'media',
      status: 'a_fazer', recorrencia: 'nenhuma', notas: '',
    }
  }

  useEffect(() => {
    if (!aberto) return
    if (demanda) {
      setF({
        titulo: demanda.titulo || '',
        projeto_id: demanda.projeto_id || '',
        prazo: demanda.prazo || '',
        prioridade: demanda.prioridade,
        status: demanda.status,
        recorrencia: demanda.recorrencia,
        notas: demanda.notas || '',
      })
    } else setF(inicial())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, demanda])

  function campo(k) {
    return { value: f[k], onChange: (e) => setF((s) => ({ ...s, [k]: e.target.value })) }
  }

  const grid = {
    display: 'grid',
    gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
    gap: 14,
  }

  return (
    <Modal
      t={t}
      titulo={demanda ? 'Editar demanda' : 'Nova demanda'}
      aberto={aberto}
      fechar={fechar}
      rodape={
        <>
          {demanda && (
            <BotaoGhost t={t} onClick={() => excluir(demanda)} style={{ marginRight: 'auto', color: t.atrasado, borderColor: t.atrasado }}>
              <Trash2 size={16} /> Excluir
            </BotaoGhost>
          )}
          <BotaoGhost t={t} onClick={fechar}>Cancelar</BotaoGhost>
          <BotaoPrimario
            t={t}
            onClick={() => {
              if (!f.titulo.trim()) return
              salvar({ ...f, titulo: f.titulo.trim(), projeto_id: f.projeto_id || null, prazo: f.prazo || null, notas: f.notas.trim() || null })
            }}
          >
            Salvar
          </BotaoPrimario>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Campo t={t} rotulo="Título *">
          <input {...campo('titulo')} style={estiloInput(t)} placeholder="Ex: Revisar tempo padrão da linha X" autoFocus={!mobile} />
        </Campo>

        <div style={grid}>
          <Campo t={t} rotulo="Projeto (opcional)">
            <select {...campo('projeto_id')} style={estiloInput(t)} disabled={Boolean(projetoFixo)}>
              <option value="">— Sem projeto —</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </Campo>
          <Campo t={t} rotulo="Prazo">
            <input type="date" {...campo('prazo')} style={estiloInput(t)} />
          </Campo>
          <Campo t={t} rotulo="Prioridade">
            <select {...campo('prioridade')} style={estiloInput(t)}>
              {PRIORIDADES.map((p) => <option key={p.id} value={p.id}>{p.rotulo}</option>)}
            </select>
          </Campo>
          <Campo t={t} rotulo="Etapa">
            <select {...campo('status')} style={estiloInput(t)}>
              {ETAPAS.map((e) => <option key={e.id} value={e.id}>{e.rotulo}</option>)}
            </select>
          </Campo>
          <Campo t={t} rotulo="Recorrência">
            <select {...campo('recorrencia')} style={estiloInput(t)}>
              {RECORRENCIAS.map((r) => <option key={r.id} value={r.id}>{r.rotulo}</option>)}
            </select>
          </Campo>
        </div>

        <Campo t={t} rotulo="Notas">
          <textarea
            {...campo('notas')}
            rows={4}
            style={{ ...estiloInput(t), resize: 'vertical', minHeight: 90 }}
            placeholder="Detalhes, links, próximos passos…"
          />
        </Campo>

        {f.recorrencia !== 'nenhuma' && (
          <div style={{ fontSize: 12.5, color: t.textoSec, background: t.selecionadoBg, borderRadius: 10, padding: '10px 12px' }}>
            <Repeat size={13} style={{ verticalAlign: -2, marginRight: 6 }} />
            Ao concluir, a próxima ocorrência é criada automaticamente em "A fazer" com o prazo ajustado.
          </div>
        )}
      </div>
    </Modal>
  )
}
