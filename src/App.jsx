import { useEffect, useMemo, useState } from 'react'
import { supabase, configOk, erroSupabase } from './lib/supabase'
import { TEMAS, proximoPrazo, hojeISO } from './lib/base'
import Login from './ui/Login'
import Shell from './ui/Shell'
import Painel from './ui/Painel'
import Demandas from './ui/Demandas'
import Projetos from './ui/Projetos'
import Registros from './ui/Registros'
import { ModalDemanda } from './ui/Demanda'
import { subirFoto, apagarFotos } from './lib/fotos'

export default function App() {
  const [temaNome, setTemaNome] = useState(() => localStorage.getItem('tema') || 'escuro')
  const t = TEMAS[temaNome] || TEMAS.escuro

  const [sessao, setSessao] = useState(null)
  const [checando, setChecando] = useState(true)
  const [erroCheck, setErroCheck] = useState(null)
  const [aba, setAba] = useState('painel')

  const [projetos, setProjetos] = useState([])
  const [demandas, setDemandas] = useState([])
  const [registros, setRegistros] = useState([])

  const [modalDemanda, setModalDemanda] = useState(false)
  const [demandaEdit, setDemandaEdit] = useState(null)
  const [projetoFixo, setProjetoFixo] = useState(null)
  const [projetoAberto, setProjetoAberto] = useState(null)

  // lista de responsáveis já usados (pro autocomplete do form e pro filtro)
  const responsaveis = useMemo(() => {
    const set = new Set()
    demandas.forEach((d) => { if (d.responsavel && d.responsavel.trim()) set.add(d.responsavel.trim()) })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [demandas])

  // tema no localStorage + cor da status bar
  useEffect(() => {
    localStorage.setItem('tema', temaNome)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', t.bgMenu)
  }, [temaNome, t])

  // auth
  useEffect(() => {
    if (!configOk || !supabase) { setChecando(false); return }
    let vivo = true
    const timeout = setTimeout(() => {
      if (vivo) { setErroCheck('tempo esgotado ao conectar ao Supabase'); setChecando(false) }
    }, 8000)
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!vivo) return
        if (error) setErroCheck(error.message)
        setSessao(data?.session || null)
        setChecando(false)
      })
      .catch((e) => { if (vivo) { setErroCheck(e?.message || String(e)); setChecando(false) } })
      .finally(() => clearTimeout(timeout))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSessao(s))
    return () => { vivo = false; clearTimeout(timeout); sub.subscription.unsubscribe() }
  }, [])

  // carga inicial
  useEffect(() => {
    if (!sessao) return
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao])

  async function carregar() {
    const [pr, de, re] = await Promise.all([
      supabase.from('projetos').select('*').order('created_at', { ascending: false }),
      supabase.from('demandas').select('*').order('posicao', { ascending: true }),
      supabase.from('registros').select('*').order('quando', { ascending: false }),
    ])
    if (!pr.error) setProjetos(pr.data)
    if (!de.error) setDemandas(de.data)
    if (!re.error) setRegistros(re.data)
  }

  // ---------- CRUD REGISTROS ----------
  async function salvarRegistro(dados, editando, arquivosNovos = [], caminhosRemover = []) {
    const userId = sessao?.user?.id
    // 1) upload das fotos novas
    const caminhosNovos = []
    for (const file of arquivosNovos) {
      try {
        const c = await subirFoto(file, userId)
        caminhosNovos.push(c)
      } catch (e) { console.error('Falha ao subir foto:', e) }
    }
    // 2) monta lista final de fotos
    const anteriores = editando?.fotos || []
    const fotos = [...anteriores.filter((c) => !caminhosRemover.includes(c)), ...caminhosNovos]

    if (editando) {
      const { data, error } = await supabase.from('registros').update({ ...dados, fotos }).eq('id', editando.id).select().single()
      if (!error) setRegistros((s) => s.map((x) => (x.id === data.id ? data : x)))
    } else {
      const { data, error } = await supabase.from('registros').insert({ ...dados, fotos }).select().single()
      if (!error) setRegistros((s) => [data, ...s])
    }
    // 3) apagar fotos removidas do storage (fire-and-forget)
    if (caminhosRemover.length) apagarFotos(caminhosRemover).catch(() => {})
  }

  async function excluirRegistro(r) {
    const { error } = await supabase.from('registros').delete().eq('id', r.id)
    if (!error) {
      setRegistros((s) => s.filter((x) => x.id !== r.id))
      if (r.fotos?.length) apagarFotos(r.fotos).catch(() => {})
    }
  }

  // ---------- CRUD DEMANDAS ----------
  function abrirNovaDemanda(projId = null) {
    setDemandaEdit(null); setProjetoFixo(projId); setModalDemanda(true)
  }
  function abrirDemanda(d) {
    setDemandaEdit(d); setProjetoFixo(null); setModalDemanda(true)
  }

  async function salvarDemanda(dados) {
    if (demandaEdit) {
      const patch = { ...dados }
      if (dados.status === 'concluido' && demandaEdit.status !== 'concluido') patch.concluido_em = new Date().toISOString()
      if (dados.status !== 'concluido') patch.concluido_em = null
      const { data, error } = await supabase.from('demandas').update(patch).eq('id', demandaEdit.id).select().single()
      if (!error) setDemandas((s) => s.map((x) => (x.id === data.id ? data : x)))
    } else {
      const posicao = demandas.filter((x) => x.status === dados.status).length
      const { data, error } = await supabase.from('demandas').insert({ ...dados, posicao }).select().single()
      if (!error) setDemandas((s) => [...s, data])
    }
    setModalDemanda(false); setDemandaEdit(null); setProjetoFixo(null)
  }

  async function excluirDemanda(d) {
    const { error } = await supabase.from('demandas').delete().eq('id', d.id)
    if (!error) setDemandas((s) => s.filter((x) => x.id !== d.id))
    setModalDemanda(false); setDemandaEdit(null)
  }

  // Mover etapa (botões + drag). Cuida da recorrência ao concluir.
  async function moverDemanda(d, novoStatus) {
    if (d.status === novoStatus) return
    const concluindo = novoStatus === 'concluido' && d.status !== 'concluido'
    const patch = {
      status: novoStatus,
      concluido_em: novoStatus === 'concluido' ? new Date().toISOString() : null,
      posicao: demandas.filter((x) => x.status === novoStatus).length,
    }
    const { data, error } = await supabase.from('demandas').update(patch).eq('id', d.id).select().single()
    if (error) return
    setDemandas((s) => s.map((x) => (x.id === data.id ? data : x)))

    // recorrência: cria próxima ocorrência
    if (concluindo && d.recorrencia && d.recorrencia !== 'nenhuma') {
      const nova = {
        projeto_id: d.projeto_id,
        titulo: d.titulo,
        notas: d.notas,
        responsavel: d.responsavel,
        prazo: proximoPrazo(d.prazo, d.recorrencia),
        prioridade: d.prioridade,
        status: 'a_fazer',
        recorrencia: d.recorrencia,
        posicao: demandas.filter((x) => x.status === 'a_fazer').length,
      }
      const res = await supabase.from('demandas').insert(nova).select().single()
      if (!res.error) setDemandas((s) => [...s, res.data])
    }
  }

  // ---------- CRUD PROJETOS ----------
  async function salvarProjeto(dados, editando) {
    if (editando) {
      const { data, error } = await supabase.from('projetos').update(dados).eq('id', editando.id).select().single()
      if (!error) setProjetos((s) => s.map((x) => (x.id === data.id ? data : x)))
    } else {
      const { data, error } = await supabase.from('projetos').insert(dados).select().single()
      if (!error) setProjetos((s) => [data, ...s])
    }
  }

  async function excluirProjeto(p) {
    const { error } = await supabase.from('projetos').delete().eq('id', p.id)
    if (!error) {
      setProjetos((s) => s.filter((x) => x.id !== p.id))
      // demandas vinculadas ficam sem projeto (FK on delete set null) — reflete no estado
      setDemandas((s) => s.map((x) => (x.projeto_id === p.id ? { ...x, projeto_id: null } : x)))
    }
  }

  function irProjeto(id) { setAba('projetos'); setProjetoAberto(id) }

  // ---------- RENDER ----------
  if (!configOk) return <TelaConfig t={t} />
  if (erroSupabase) return <TelaErro t={t} titulo="Erro ao iniciar" msg={erroSupabase} />
  if (checando) return <TelaEspera t={t} />
  if (erroCheck) return <TelaErro t={t} titulo="Não foi possível conectar" msg={erroCheck} />
  if (!sessao) return <Login t={t} />

  const alternarTema = () => setTemaNome((n) => (n === 'escuro' ? 'claro' : 'escuro'))

  return (
    <>
      <Shell t={t} aba={aba} setAba={(a) => { setAba(a); if (a !== 'projetos') setProjetoAberto(null) }} alternarTema={alternarTema}>
        {aba === 'painel' && (
          <Painel t={t} demandas={demandas} projetos={projetos} registros={registros} abrirDemanda={abrirDemanda} irProjeto={irProjeto} moverDemanda={moverDemanda} irRegistros={() => setAba('registros')} />
        )}
        {aba === 'demandas' && (
          <Demandas t={t} demandas={demandas} projetos={projetos} responsaveis={responsaveis} novaDemanda={() => abrirNovaDemanda()} abrirDemanda={abrirDemanda} moverDemanda={moverDemanda} />
        )}
        {aba === 'projetos' && (
          <Projetos
            t={t}
            projetos={projetos}
            demandas={demandas}
            projetoAberto={projetoAberto}
            setProjetoAberto={setProjetoAberto}
            salvarProjeto={salvarProjeto}
            excluirProjeto={excluirProjeto}
            novaDemandaNoProjeto={abrirNovaDemanda}
            abrirDemanda={abrirDemanda}
            moverDemanda={moverDemanda}
          />
        )}
        {aba === 'registros' && (
          <Registros
            t={t}
            registros={registros}
            projetos={projetos}
            demandas={demandas}
            salvar={salvarRegistro}
            excluir={excluirRegistro}
          />
        )}
      </Shell>

      <ModalDemanda
        t={t}
        aberto={modalDemanda}
        fechar={() => { setModalDemanda(false); setDemandaEdit(null); setProjetoFixo(null) }}
        salvar={salvarDemanda}
        excluir={excluirDemanda}
        demanda={demandaEdit}
        projetos={projetos}
        projetoFixo={projetoFixo}
        responsaveis={responsaveis}
      />
    </>
  )
}

function TelaEspera({ t }) {
  return (
    <div style={{ minHeight: '100dvh', background: t.bg, color: t.textoSec, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, padding: 24 }}>
      <div style={{ width: 42, height: 42, border: `3px solid ${t.borda}`, borderTopColor: t.acento, borderRadius: '50%', animation: 'girar 0.9s linear infinite' }} />
      <span style={{ fontSize: 14 }}>Carregando…</span>
      <style>{'@keyframes girar { to { transform: rotate(360deg) } }'}</style>
    </div>
  )
}

function TelaErro({ t, titulo, msg }) {
  return (
    <div style={{ minHeight: '100dvh', background: t.bg, color: t.texto, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 460, background: t.card, border: `1px solid ${t.borda}`, borderRadius: 14, padding: 22 }}>
        <h1 style={{ fontSize: 18, marginBottom: 10, color: t.atrasado }}>{titulo}</h1>
        <p style={{ color: t.textoSec, fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>{msg}</p>
        <p style={{ color: t.textoFraco, fontSize: 12.5, lineHeight: 1.5 }}>
          Verifique as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> na Vercel
          (URL sem barra no final) e refaça o deploy.
        </p>
      </div>
    </div>
  )
}

function TelaConfig({ t }) {
  return (
    <div style={{ minHeight: '100dvh', background: t.bg, color: t.texto, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: 20, marginBottom: 12 }}>Configuração pendente</h1>
        <p style={{ color: t.textoSec, fontSize: 14.5, lineHeight: 1.5 }}>
          Faltam as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.
          Adicione-as nas Environment Variables da Vercel e refaça o deploy.
        </p>
      </div>
    </div>
  )
}
