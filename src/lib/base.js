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
