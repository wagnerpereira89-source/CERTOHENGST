import { useEffect, useState } from 'react'
import { Plus, ChevronLeft, Target, CalendarDays, Trash2, FolderKanban } from 'lucide-react'
import { STATUS_PROJETO, formatarData } from '../lib/base'
import { CardDemanda } from './Demanda'
import { Barra } from './Painel'
import { Badge, BotaoGhost, BotaoPrimario, Campo, Modal, Titulo, Vazio, estiloInput, useMobile } from './comuns'

export default function Projetos({
  t, projetos, demandas, projetoAberto, setProjetoAberto,
  salvarProjeto, excluirProjeto, novaDemandaNoProjeto, abrirDemanda, moverDemanda,
}) {
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)

  const comProgresso = (p) => {
    const ds = demandas.filter((d) => d.projeto_id === p.id)
    const done = ds.filter((d) => d.status === 'concluido').length
    return { ds, done, pct: ds.length ? Math.round((done / ds.length) * 100) : 0 }
  }

  // ---------- DETALHE ----------
  if (projetoAberto) {
    const p = projetos.find((x) => x.id === projetoAberto)
    if (!p) { setProjetoAberto(null); return null }
    const { ds, done, pct } = comProgresso(p)
    const stat = STATUS_PROJETO.find((s) => s.id === p.status)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <button onClick={() => setProjetoAberto(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: t.textoSec, cursor: 'pointer', fontSize: 14, fontWeight: 600, alignSelf: 'flex-start' }}>
          <ChevronLeft size={17} /> Projetos
        </button>

        <div style={{ background: t.card, border: `1px solid ${t.borda}`, borderRadius: 16, boxShadow: t.sombra, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: t.texto }}>{p.nome}</h1>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <Badge cor={t.textoSec} bg={t.inputBg}>{stat?.rotulo}</Badge>
                {p.prazo && <Badge cor={t.textoSec} bg="transparent"><CalendarDays size={12} /> {formatarData(p.prazo)}</Badge>}
              </div>
            </div>
            <BotaoGhost t={t} onClick={() => { setEditando(p); setModal(true) }}>Editar</BotaoGhost>
          </div>

          {p.objetivo && (
            <p style={{ display: 'flex', gap: 8, color: t.textoSec, fontSize: 14, lineHeight: 1.5 }}>
              <Target size={16} style={{ flexShrink: 0, marginTop: 2 }} /> {p.objetivo}
            </p>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: t.textoSec, marginBottom: 6 }}>
              <span>{done} de {ds.length} demandas concluídas</span>
              <strong style={{ color: t.texto }}>{pct}%</strong>
            </div>
            <Barra t={t} pct={pct} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Titulo t={t}>Demandas do projeto</Titulo>
          <BotaoPrimario t={t} onClick={() => novaDemandaNoProjeto(p.id)}><Plus size={16} /> Nova</BotaoPrimario>
        </div>

        {ds.length === 0 ? (
          <Vazio t={t}>Nenhuma demanda vinculada. Crie a primeira no botão acima.</Vazio>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {ds.map((d) => (
              <CardDemanda key={d.id} t={t} d={d} abrir={abrirDemanda} mover={moverDemanda} />
            ))}
          </div>
        )}

        <ModalProjeto t={t} aberto={modal} fechar={() => { setModal(false); setEditando(null) }} salvar={(dados) => { salvarProjeto(dados, editando); setModal(false); setEditando(null) }} excluir={(pr) => { excluirProjeto(pr); setModal(false); setEditando(null); setProjetoAberto(null) }} projeto={editando} />
      </div>
    )
  }

  // ---------- LISTA ----------
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: t.texto }}>Projetos</h1>
        <BotaoPrimario t={t} onClick={() => { setEditando(null); setModal(true) }}><Plus size={17} /> Novo</BotaoPrimario>
      </div>

      {projetos.length === 0 ? (
        <Vazio t={t}>Nenhum projeto ainda. Crie um para agrupar suas demandas.</Vazio>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {projetos.map((p) => {
            const { ds, done, pct } = comProgresso(p)
            const stat = STATUS_PROJETO.find((s) => s.id === p.status)
            return (
              <button
                key={p.id}
                onClick={() => setProjetoAberto(p.id)}
                style={{ textAlign: 'left', background: t.card, border: `1px solid ${t.borda}`, borderRadius: 14, boxShadow: t.sombra, padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <FolderKanban size={17} color={t.textoSec} style={{ flexShrink: 0 }} />
                    <strong style={{ fontSize: 15.5, color: t.texto, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nome}</strong>
                  </div>
                  <Badge cor={t.textoSec} bg={t.inputBg}>{stat?.rotulo}</Badge>
                </div>
                {p.objetivo && <p style={{ fontSize: 13, color: t.textoSec, lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.objetivo}</p>}
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: t.textoSec, marginBottom: 6 }}>
                    <span>{done}/{ds.length} concluídas</span>
                    <strong style={{ color: t.texto }}>{pct}%</strong>
                  </div>
                  <Barra t={t} pct={pct} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      <ModalProjeto t={t} aberto={modal} fechar={() => { setModal(false); setEditando(null) }} salvar={(dados) => { salvarProjeto(dados, editando); setModal(false); setEditando(null) }} excluir={(pr) => { excluirProjeto(pr); setModal(false); setEditando(null) }} projeto={editando} />
    </div>
  )
}

function ModalProjeto({ t, aberto, fechar, salvar, excluir, projeto }) {
  const mobile = useMobile()
  const [f, setF] = useState({ nome: '', objetivo: '', prazo: '', status: 'ativo' })

  useEffect(() => {
    if (!aberto) return
    if (projeto) setF({ nome: projeto.nome || '', objetivo: projeto.objetivo || '', prazo: projeto.prazo || '', status: projeto.status })
    else setF({ nome: '', objetivo: '', prazo: '', status: 'ativo' })
  }, [aberto, projeto])

  const campo = (k) => ({ value: f[k], onChange: (e) => setF((s) => ({ ...s, [k]: e.target.value })) })

  return (
    <Modal
      t={t}
      titulo={projeto ? 'Editar projeto' : 'Novo projeto'}
      aberto={aberto}
      fechar={fechar}
      rodape={
        <>
          {projeto && (
            <BotaoGhost t={t} onClick={() => excluir(projeto)} style={{ marginRight: 'auto', color: t.atrasado, borderColor: t.atrasado }}>
              <Trash2 size={16} /> Excluir
            </BotaoGhost>
          )}
          <BotaoGhost t={t} onClick={fechar}>Cancelar</BotaoGhost>
          <BotaoPrimario t={t} onClick={() => { if (!f.nome.trim()) return; salvar({ ...f, nome: f.nome.trim(), objetivo: f.objetivo.trim() || null, prazo: f.prazo || null }) }}>Salvar</BotaoPrimario>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Campo t={t} rotulo="Nome *">
          <input {...campo('nome')} style={estiloInput(t)} placeholder="Ex: Dashboard PCP disponibilidade" autoFocus={!mobile} />
        </Campo>
        <Campo t={t} rotulo="Objetivo">
          <textarea {...campo('objetivo')} rows={3} style={{ ...estiloInput(t), resize: 'vertical', minHeight: 80 }} placeholder="O que esse projeto precisa entregar?" />
        </Campo>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 14 }}>
          <Campo t={t} rotulo="Prazo">
            <input type="date" {...campo('prazo')} style={estiloInput(t)} />
          </Campo>
          <Campo t={t} rotulo="Status">
            <select {...campo('status')} style={estiloInput(t)}>
              {STATUS_PROJETO.map((s) => <option key={s.id} value={s.id}>{s.rotulo}</option>)}
            </select>
          </Campo>
        </div>
      </div>
    </Modal>
  )
}
