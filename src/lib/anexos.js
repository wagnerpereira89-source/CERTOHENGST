import { supabase } from './supabase'

const BUCKET = 'anexos'

// Sobe um arquivo qualquer (PDF, Word, Excel, imagem…) sem compressão.
// Retorna os metadados que serão guardados na coluna "anexos" da demanda.
export async function subirAnexo(file, userId) {
  const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'bin'
  const nomeArq = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const caminho = `${userId || 'geral'}/${nomeArq}`
  const { error } = await supabase.storage.from(BUCKET).upload(caminho, file, {
    contentType: file.type || 'application/octet-stream',
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  return { caminho, nome: file.name, tipo: file.type || '', tamanho: file.size }
}

// Gera URL assinada temporária (1h) pra abrir/baixar o arquivo
export async function urlAnexo(caminho, expiraEm = 3600) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(caminho, expiraEm)
  if (error) throw error
  return data.signedUrl
}

// Remove um ou vários anexos do storage
export async function apagarAnexos(caminhos) {
  if (!caminhos?.length) return
  await supabase.storage.from(BUCKET).remove(caminhos)
}
