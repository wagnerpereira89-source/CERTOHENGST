import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Search, AlertTriangle, Lightbulb, CheckCircle2, MessagesSquare,
  Wrench, Pin, Trash2, Camera, X, FolderKanban, KanbanSquare, ImagePlus,
} from 'lucide-react'
import { TIPOS_REGISTRO, chaveDia, rotuloDia, formatarHora, tsParaInput, inputParaTs } from '../lib/base'
import { subirFoto, urlsAssinadas, apagarFotos } from '../lib/fotos'
import { Badge, BotaoGhost, BotaoPrimario, Campo, Modal, Titulo, Vazio, estiloInput, useMobile } from './comuns'

const ICONES = { AlertTriangle, Lightbulb, CheckCircle2, MessagesSquare, Wrench, Pin }

function coresTipo(t, tipo) {
  const spec = TIPOS_REGISTRO.find((x) => x.id === tipo) || TIPOS_REGISTRO[5]
  const cor = t[spec.corToken] || t.textoSec
  const bg = t[spec.corToken + 'Bg'] || t.inputBg
  const Icone = ICONES[spec.icone] || Pin
  return { cor, bg, Icone, rotulo: spec.rotulo }
}

// ---------- CACHE de URLs assinadas ----------
function useUrlsFotos(fotosPorId) {
  // fotosPorId: { registroId: [caminho, ...] }
  const [urls, setUrls] = useState({}) // { caminho: url }
  const jaBuscados = useRef(new Set())

  useEffect(() => {
    const pendentes = []
    for (const arr of Object.values(fotosPorId)) {
      for (const c of arr || []) {
        if (c && !urls[c] && !jaBuscados.current.has(c)) pendentes.push(c)
      }
    }
    if (!pendentes.length) return
    pendentes.forEach((c) => jaBuscados.current.add(c))
    urlsAssinadas(pendentes).then((assinadas) => {
      setUrls((s) => {
        const novo = { ...s }
        pendentes.forEach((c, i) => { novo[c] = assinadas[i] })
        return novo
      })
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(fotosPorId)])

  return urls
}

// ============================================================
// TELA PRINCIPAL
// ============================================================
export default function Registros({ t, registros, projetos, demandas, salvar, excluir }) {
  const mobile = useMobile()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [busca, setBusca] = useState('')
  const [tiposFiltro, setTiposFiltro] = useState(new Set())
  const [projetoFiltro, setProjetoFiltro] = useState('')

  const projMap = useMemo(() => Object.fromEntries(projetos.map((p) => [p.id, p])), [projetos])
  const demMap = useMemo(() => Object.fromEntries(demandas.map((d) => [d.id, d])), [demandas])

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return registros
      .filter((r) => (tiposFiltro.size ? tiposFiltro.has(r.tipo) : true))
      .filter((r) => (projetoFiltro ? r.projeto_id === projetoFiltro : true))
      .filter((r) => {
        if (!q) return true
        return (r.titulo || '').toLowerCase().includes(q) || (r.descricao || '').toLowerCase().includes(q)
      })
      .sort((a, b) => (a.quando < b.quando ? 1 : -1))
  }, [registros, busca, tiposFiltro, projetoFiltro])

  // agrupar por dia
  const grupos = useMemo(() => {
    const g = []
    let atual = null
    for (const r of filtrados) {
      const k = chaveDia(r.quando)
      if (!atual || atual.chave !== k) {
        atual = { chave: k, rotulo: rotuloDia(r.quando), itens: [] }
        g.push(atual)
      }
      atual.itens.push(r)
    }
    return g
  }, [filtrados])

  // preparar URLs de fotos (só dos itens visíveis)
  const fotosPorId = useMemo(() => {
    const m = {}
    for (const r of filtrados) if (r.fotos?.length) m[r.id] = r.fotos
    return m
  }, [filtrados])
  const urls = useUrlsFotos(fotosPorId)

  function alternarTipo(id) {
    setTiposFiltro((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  function abrirNovo() { setEditando(null); setModalAberto(true) }
  function abrirEdicao(r) { setEditando(r); setModalAberto(true) }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: t.texto }}>Registros</h1>
        <BotaoPrimario t={t} onClick={abrirNovo}><Plus size={17} /> Novo</BotaoPrimario>
      </div>

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={17} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.textoFraco }} />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por texto…"
          style={{ ...estiloInput(t), paddingLeft: 38 }}
        />
      </div>

      {/* Chips de tipo — roláveis na horizontal */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 10, overflowX: 'auto', paddingBottom: 4,
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin',
      }}>
        {TIPOS_REGISTRO.map((tp) => {
          const ativo = tiposFiltro.has(tp.id)
          const { cor, bg, Icone } = coresTipo(t, tp.id)
          return (
            <button
              key={tp.id}
              onClick={() => alternarTipo(tp.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
                borderRadius: 20, padding: '6px 12px', fontSize: 12.5, fontWeight: 700,
                cursor: 'pointer',
                border: `1px solid ${ativo ? cor : t.borda}`,
                background: ativo ? bg : 'transparent',
                color: ativo ? cor : t.textoSec,
              }}
            >
              <Icone size={13} /> {tp.rotulo}
            </button>
          )
        })}
      </div>

      {/* Filtro por projeto (só aparece se tiver projetos) */}
      {projetos.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <select
            value={projetoFiltro}
            onChange={(e) => setProjetoFiltro(e.target.value)}
            style={{ ...estiloInput(t), fontSize: 13.5 }}
          >
            <option value="">Todos os projetos</option>
            {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
      )}

      {/* Feed */}
      {grupos.length === 0 ? (
        <Vazio t={t}>
          {registros.length === 0
            ? 'Nenhum registro ainda. Comece anotando algo que aconteceu hoje.'
            : 'Nenhum registro corresponde ao filtro atual.'}
        </Vazio>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {grupos.map((g) => (
            <section key={g.chave}>
              <Titulo t={t}>{g.rotulo}</Titulo>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {g.itens.map((r) => (
                  <CardRegistro
                    key={r.id} t={t} r={r}
                    projeto={projMap[r.projeto_id]}
                    demanda={demMap[r.demanda_id]}
                    urls={urls}
                    abrir={() => abrirEdicao(r)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <ModalRegistro
        t={t}
        aberto={modalAberto}
        fechar={() => { setModalAberto(false); setEditando(null) }}
        salvar={async (dados, novasFotos, fotosRemover) => {
          await salvar(dados, editando, novasFotos, fotosRemover)
          setModalAberto(false); setEditando(null)
        }}
        excluir={async (r) => {
          await excluir(r)
          setModalAberto(false); setEditando(null)
        }}
        registro={editando}
        projetos={projetos}
        demandas={demandas}
        urls={urls}
      />
    </div>
  )
}

// ============================================================
// CARD DO FEED
// ============================================================
function CardRegistro({ t, r, projeto, demanda, urls, abrir }) {
  const { cor, bg, Icone, rotulo } = coresTipo(t, r.tipo)
  const fotos = (r.fotos || []).slice(0, 3)
  const extra = (r.fotos?.length || 0) - fotos.length

  return (
    <div
      onClick={abrir}
      style={{
        background: t.card,
        border: `1px solid ${t.borda}`,
        borderLeft: `3px solid ${cor}`,
        borderRadius: 12,
        boxShadow: t.sombra,
        padding: '12px 14px',
        cursor: 'pointer',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10, background: bg, color: cor,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icone size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: cor, textTransform: 'uppercase', letterSpacing: '.05em' }}>{rotulo}</span>
          <span style={{ fontSize: 12, color: t.textoFraco }}>· {formatarHora(r.quando)}</span>
        </div>
        <strong style={{ fontSize: 14.5, color: t.texto, lineHeight: 1.35, display: 'block' }}>{r.titulo}</strong>
        {r.descricao && (
          <p style={{
            fontSize: 13.5, color: t.textoSec, lineHeight: 1.45, marginTop: 4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{r.descricao}</p>
        )}
        {(projeto || demanda) && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {projeto && <Badge cor={t.textoSec} bg="transparent"><FolderKanban size={12} /> {projeto.nome}</Badge>}
            {demanda && <Badge cor={t.textoSec} bg="transparent"><KanbanSquare size={12} /> {demanda.titulo}</Badge>}
          </div>
        )}
        {fotos.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {fotos.map((c) => (
              <div key={c} style={{
                width: 60, height: 60, borderRadius: 8, background: t.inputBg, overflow: 'hidden', flexShrink: 0,
                border: `1px solid ${t.borda}`,
              }}>
                {urls[c] ? (
                  <img src={urls[c]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textoFraco }}>
                    <Camera size={16} />
                  </div>
                )}
              </div>
            ))}
            {extra > 0 && (
              <div style={{
                width: 60, height: 60, borderRadius: 8, background: t.inputBg, border: `1px solid ${t.borda}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: t.textoSec, fontSize: 13, fontWeight: 700,
              }}>+{extra}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// MODAL DE EDIÇÃO
// ============================================================
function ModalRegistro({ t, aberto, fechar, salvar, excluir, registro, projetos, demandas, urls }) {
  const mobile = useMobile()
  const inputFotoRef = useRef(null)
  const [f, setF] = useState(inicial())
  const [fotosExistentes, setFotosExistentes] = useState([]) // caminhos já salvos
  const [fotosRemover, setFotosRemover] = useState([])       // caminhos a apagar ao salvar
  const [fotosNovas, setFotosNovas] = useState([])           // { file, preview }
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  function inicial() {
    return {
      tipo: 'nota', titulo: '', descricao: '',
      quando: tsParaInput(Date.now()),
      projeto_id: '', demanda_id: '',
    }
  }

  useEffect(() => {
    if (!aberto) return
    setErro('')
    if (registro) {
      setF({
        tipo: registro.tipo,
        titulo: registro.titulo || '',
        descricao: registro.descricao || '',
        quando: tsParaInput(registro.quando),
        projeto_id: registro.projeto_id || '',
        demanda_id: registro.demanda_id || '',
      })
      setFotosExistentes(registro.fotos || [])
    } else {
      setF(inicial())
      setFotosExistentes([])
    }
    setFotosRemover([])
    setFotosNovas([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, registro])

  const totalFotos = fotosExistentes.length - fotosRemover.length + fotosNovas.length
  const podeMais = totalFotos < 5

  function selecionarArquivos(e) {
    const arquivos = Array.from(e.target.files || [])
    if (!arquivos.length) return
    const restante = Math.max(0, 5 - totalFotos)
    const usar = arquivos.slice(0, restante)
    const items = usar.map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setFotosNovas((s) => [...s, ...items])
    e.target.value = ''
  }

  function removerExistente(caminho) {
    setFotosRemover((s) => [...s, caminho])
  }
  function reincluirExistente(caminho) {
    setFotosRemover((s) => s.filter((x) => x !== caminho))
  }
  function removerNova(idx) {
    setFotosNovas((s) => {
      URL.revokeObjectURL(s[idx].preview)
      return s.filter((_, i) => i !== idx)
    })
  }

  // filtra demandas do projeto escolhido, se houver
  const demandasDisponiveis = f.projeto_id
    ? demandas.filter((d) => d.projeto_id === f.projeto_id)
    : demandas

  async function aoSalvar() {
    if (!f.titulo.trim()) { setErro('Informe um título.'); return }
    setEnviando(true); setErro('')
    try {
      await salvar({
        tipo: f.tipo,
        titulo: f.titulo.trim(),
        descricao: f.descricao.trim() || null,
        quando: inputParaTs(f.quando),
        projeto_id: f.projeto_id || null,
        demanda_id: f.demanda_id || null,
      }, fotosNovas.map((x) => x.file), fotosRemover)
    } catch (e) {
      setErro(e?.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  const grid = { display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 14 }

  return (
    <Modal
      t={t}
      titulo={registro ? 'Editar registro' : 'Novo registro'}
      aberto={aberto}
      fechar={fechar}
      rodape={
        <>
          {registro && (
            <BotaoGhost t={t} onClick={() => excluir(registro)} style={{ marginRight: 'auto', color: t.atrasado, borderColor: t.atrasado }}>
              <Trash2 size={16} /> Excluir
            </BotaoGhost>
          )}
          <BotaoGhost t={t} onClick={fechar}>Cancelar</BotaoGhost>
          <BotaoPrimario t={t} onClick={aoSalvar} disabled={enviando} style={{ opacity: enviando ? 0.7 : 1 }}>
            {enviando ? 'Salvando…' : 'Salvar'}
          </BotaoPrimario>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Seletor de tipo — chips grandes com ícone */}
        <div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: t.textoSec, display: 'block', marginBottom: 8 }}>Tipo</span>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 8 }}>
            {TIPOS_REGISTRO.map((tp) => {
              const ativo = f.tipo === tp.id
              const { cor, bg, Icone } = coresTipo(t, tp.id)
              return (
                <button
                  key={tp.id}
                  onClick={() => setF((s) => ({ ...s, tipo: tp.id }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${ativo ? cor : t.borda}`,
                    background: ativo ? bg : 'transparent',
                    color: ativo ? cor : t.textoSec,
                    fontSize: 13.5, fontWeight: 700, textAlign: 'left',
                  }}
                >
                  <Icone size={16} /> {tp.rotulo}
                </button>
              )
            })}
          </div>
        </div>

        <Campo t={t} rotulo="Título *">
          <input
            value={f.titulo}
            onChange={(e) => setF((s) => ({ ...s, titulo: e.target.value }))}
            style={estiloInput(t)}
            placeholder="Ex: Refugo alto na Termofusão"
            autoFocus={!mobile}
          />
        </Campo>

        <Campo t={t} rotulo="Descrição">
          <textarea
            value={f.descricao}
            onChange={(e) => setF((s) => ({ ...s, descricao: e.target.value }))}
            rows={5}
            style={{ ...estiloInput(t), resize: 'vertical', minHeight: 110 }}
            placeholder="O que aconteceu, o que foi feito, próximos passos…"
          />
        </Campo>

        <div style={grid}>
          <Campo t={t} rotulo="Quando">
            <input
              type="datetime-local"
              value={f.quando}
              onChange={(e) => setF((s) => ({ ...s, quando: e.target.value }))}
              style={estiloInput(t)}
            />
          </Campo>
          <Campo t={t} rotulo="Projeto vinculado">
            <select
              value={f.projeto_id}
              onChange={(e) => setF((s) => ({ ...s, projeto_id: e.target.value, demanda_id: '' }))}
              style={estiloInput(t)}
            >
              <option value="">— Nenhum —</option>
              {projetos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </Campo>
        </div>

        <Campo t={t} rotulo="Demanda vinculada">
          <select
            value={f.demanda_id}
            onChange={(e) => setF((s) => ({ ...s, demanda_id: e.target.value }))}
            style={estiloInput(t)}
          >
            <option value="">— Nenhuma —</option>
            {demandasDisponiveis.map((d) => <option key={d.id} value={d.id}>{d.titulo}</option>)}
          </select>
        </Campo>

        {/* Fotos */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: t.textoSec }}>Fotos ({totalFotos}/5)</span>
            <input
              ref={inputFotoRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={selecionarArquivos}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => inputFotoRef.current?.click()}
              disabled={!podeMais}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'transparent', border: `1px dashed ${t.borda}`,
                borderRadius: 8, padding: '6px 12px', fontSize: 12.5, fontWeight: 700,
                color: podeMais ? t.textoSec : t.textoFraco, cursor: podeMais ? 'pointer' : 'default',
                opacity: podeMais ? 1 : 0.5,
              }}
            >
              <ImagePlus size={14} /> Adicionar foto
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 8 }}>
            {fotosExistentes.map((caminho) => {
              const marcada = fotosRemover.includes(caminho)
              return (
                <div key={caminho} style={{
                  position: 'relative', paddingTop: '100%', borderRadius: 10,
                  background: t.inputBg, border: `1px solid ${t.borda}`, overflow: 'hidden',
                  opacity: marcada ? 0.4 : 1,
                }}>
                  {urls[caminho] && (
                    <img src={urls[caminho]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <button
                    onClick={() => marcada ? reincluirExistente(caminho) : removerExistente(caminho)}
                    aria-label={marcada ? 'Manter foto' : 'Remover foto'}
                    style={botaoRemover(t)}
                  >
                    {marcada ? <Plus size={14} /> : <X size={14} />}
                  </button>
                </div>
              )
            })}
            {fotosNovas.map((item, idx) => (
              <div key={idx} style={{
                position: 'relative', paddingTop: '100%', borderRadius: 10,
                background: t.inputBg, border: `1px solid ${t.acento}`, overflow: 'hidden',
              }}>
                <img src={item.preview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={() => removerNova(idx)}
                  aria-label="Remover foto"
                  style={botaoRemover(t)}
                >
                  <X size={14} />
                </button>
                <span style={{
                  position: 'absolute', bottom: 4, left: 4,
                  fontSize: 10, fontWeight: 800, background: t.acento, color: t.acentoTexto,
                  padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '.05em',
                }}>Nova</span>
              </div>
            ))}
          </div>
          {totalFotos === 0 && (
            <p style={{ fontSize: 12.5, color: t.textoFraco, marginTop: 6 }}>
              Nenhuma foto anexada. Use "Adicionar foto" para tirar direto ou escolher da galeria.
            </p>
          )}
        </div>

        {erro && <div style={{ color: t.atrasado, fontSize: 13.5, fontWeight: 600 }}>{erro}</div>}
      </div>
    </Modal>
  )
}

function botaoRemover(t) {
  return {
    position: 'absolute', top: 4, right: 4,
    width: 24, height: 24, borderRadius: '50%',
    background: 'rgba(0,0,0,0.65)', color: '#fff',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}
