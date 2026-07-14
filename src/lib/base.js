// ---------- TEMAS ----------
export const TEMAS = {
  escuro: {
    nome: 'escuro',
    bg: '#010a2e',            // navy mais escuro que a base
    bgMenu: '#020c38',
    card: '#071345',          // um degrau mais claro
    cardHover: '#0a1852',
    borda: 'rgba(255,255,255,0.09)',
    texto: '#ffffff',
    textoSec: '#aab2d0',      // cinza-claro legível
    textoFraco: '#7d86ad',
    acento: '#fcc404',        // amarelo
    acentoTexto: '#030f47',   // texto escuro dentro do botão amarelo
    tituloBarra: '#fcc404',
    atrasado: '#ff6b6b',
    atrasadoBg: 'rgba(255,107,107,0.12)',
    hoje: '#ffa94d',
    hojeBg: 'rgba(255,169,77,0.12)',
    ok: '#51cf66',
    okBg: 'rgba(81,207,102,0.12)',
    info: '#5cb0ff',
    infoBg: 'rgba(92,176,255,0.12)',
    roxo: '#b48cff',
    roxoBg: 'rgba(180,140,255,0.14)',
    inputBg: '#03102f',
    sombra: '0 2px 10px rgba(0,0,0,0.35)',
    logo: '/logo-clara.png',
    prioridade: { alta: '#ff6b6b', media: '#fcc404', baixa: '#8b93b8' },
    selecionadoBg: 'rgba(252,196,4,0.10)',
  },
  claro: {
    nome: 'claro',
    bg: '#ffffff',
    bgMenu: '#f7f8fc',        // off-white de apoio
    card: '#ffffff',
    cardHover: '#fafbff',
    borda: '#e4e7f2',
    texto: '#030f47',
    textoSec: '#5b6280',      // cinza médio legível
    textoFraco: '#8b91ab',
    acento: '#fcc404',        // botão primário amarelo, texto navy
    acentoTexto: '#030f47',
    tituloBarra: '#030f47',   // barrinha navy no claro
    atrasado: '#d6273b',      // vermelho com bom contraste
    atrasadoBg: '#fdeef0',
    hoje: '#a05a00',          // âmbar escuro/saturado (não amarelo puro)
    hojeBg: '#fdf3e3',
    ok: '#1d8348',
    okBg: '#e9f7ef',
    info: '#1e6bc7',
    infoBg: '#e8f1fc',
    roxo: '#6b3fb8',
    roxoBg: '#efe8fa',
    inputBg: '#f7f8fc',
    sombra: '0 2px 8px rgba(3,15,71,0.07)',
    logo: '/logo-escura.png',
    prioridade: { alta: '#d6273b', media: '#e0ae00', baixa: '#8b91ab' },
    selecionadoBg: 'rgba(252,196,4,0.16)',
  },
}

// ---------- CONSTANTES DE DOMÍNIO ----------
export const ETAPAS = [
  { id: 'a_fazer', rotulo: 'A fazer' },
  { id: 'andamento', rotulo: 'Andamento' },
  { id: 'concluido', rotulo: 'Concluído' },
]

export const PRIORIDADES = [
  { id: 'alta', rotulo: 'Alta' },
  { id: 'media', rotulo: 'Média' },
  { id: 'baixa', rotulo: 'Baixa' },
]

export const RECORRENCIAS = [
  { id: 'nenhuma', rotulo: 'Sem recorrência' },
  { id: 'diaria', rotulo: 'Diária' },
  { id: 'semanal', rotulo: 'Semanal' },
  { id: 'quinzenal', rotulo: 'Quinzenal' },
  { id: 'mensal', rotulo: 'Mensal' },
]

export const STATUS_PROJETO = [
  { id: 'ativo', rotulo: 'Ativo' },
  { id: 'pausado', rotulo: 'Pausado' },
  { id: 'concluido', rotulo: 'Concluído' },
]

export const TIPOS_REGISTRO = [
  { id: 'ocorrencia', rotulo: 'Ocorrência',      icone: 'AlertTriangle', corToken: 'atrasado' },
  { id: 'ideia',      rotulo: 'Ideia',           icone: 'Lightbulb',      corToken: 'acento' },
  { id: 'decisao',    rotulo: 'Decisão',         icone: 'CheckCircle2',   corToken: 'ok' },
  { id: 'reuniao',    rotulo: 'Reunião',         icone: 'MessagesSquare', corToken: 'info' },
  { id: 'acao',       rotulo: 'Ação executada',  icone: 'Wrench',         corToken: 'roxo' },
  { id: 'nota',       rotulo: 'Nota geral',      icone: 'Pin',            corToken: 'textoSec' },
]

// ---------- DATAS ----------
export function hojeISO() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dia}`
}

export function formatarData(iso) {
  if (!iso) return ''
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

export function estadoPrazo(demanda) {
  if (!demanda.prazo || demanda.status === 'concluido') return 'normal'
  const hoje = hojeISO()
  if (demanda.prazo < hoje) return 'atrasado'
  if (demanda.prazo === hoje) return 'hoje'
  return 'normal'
}

// Próximo prazo de uma demanda recorrente (a partir do prazo atual ou de hoje)
export function proximoPrazo(prazoAtual, recorrencia) {
  const base = prazoAtual && prazoAtual >= hojeISO() ? prazoAtual : hojeISO()
  const [a, m, d] = base.split('-').map(Number)
  const dt = new Date(a, m - 1, d)
  if (recorrencia === 'diaria') dt.setDate(dt.getDate() + 1)
  else if (recorrencia === 'semanal') dt.setDate(dt.getDate() + 7)
  else if (recorrencia === 'quinzenal') dt.setDate(dt.getDate() + 15)
  else if (recorrencia === 'mensal') dt.setMonth(dt.getMonth() + 1)
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${dt.getFullYear()}-${mm}-${dd}`
}

// Agrupamento amigável por dia: "Hoje", "Ontem", "quarta-feira, 09/07" ou "09/07/2026"
const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
export function rotuloDia(ts) {
  const d = new Date(ts)
  const hoje = new Date(); hoje.setHours(0,0,0,0)
  const alvo = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = Math.round((hoje - alvo) / 86400000)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  if (diff > 1 && diff < 7) return `${DIAS[d.getDay()]}, ${dd}/${mm}`
  if (d.getFullYear() === new Date().getFullYear()) return `${dd}/${mm}`
  return `${dd}/${mm}/${d.getFullYear()}`
}

export function chaveDia(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function formatarHora(ts) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

// timestamp local para input datetime-local (formato YYYY-MM-DDTHH:MM)
export function tsParaInput(ts) {
  const d = new Date(ts || Date.now())
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function inputParaTs(v) {
  if (!v) return new Date().toISOString()
  // v vem como YYYY-MM-DDTHH:MM (horário local) — o Date interpreta como local
  return new Date(v).toISOString()
}
