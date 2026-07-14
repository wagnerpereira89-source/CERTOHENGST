import { supabase } from './supabase'

const BUCKET = 'registros'
const MAX_LADO = 1600 // px
const QUALIDADE = 0.82

// Comprime a imagem no navegador para JPEG ~1600px de lado
export async function comprimirImagem(file) {
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = rej
    r.readAsDataURL(file)
  })
  const img = await new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = dataUrl
  })
  let { width, height } = img
  const maior = Math.max(width, height)
  if (maior > MAX_LADO) {
    const r = MAX_LADO / maior
    width = Math.round(width * r)
    height = Math.round(height * r)
  }
  const c = document.createElement('canvas')
  c.width = width; c.height = height
  c.getContext('2d').drawImage(img, 0, 0, width, height)
  const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', QUALIDADE))
  return blob
}

// Faz upload da foto no bucket privado, na pasta do usuário. Retorna o caminho.
export async function subirFoto(file, userId) {
  const blob = await comprimirImagem(file)
  const nome = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const caminho = `${userId}/${nome}`
  const { error } = await supabase.storage.from(BUCKET).upload(caminho, blob, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  return caminho
}

// Gera URL assinada temporária (1h) para exibir a foto
export async function urlAssinada(caminho, expiraEm = 3600) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(caminho, expiraEm)
  if (error) throw error
  return data.signedUrl
}

// Gera várias URLs assinadas de uma vez
export async function urlsAssinadas(caminhos, expiraEm = 3600) {
  if (!caminhos?.length) return []
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(caminhos, expiraEm)
  if (error) throw error
  return data.map((d) => d.signedUrl)
}

// Remove uma ou várias fotos do storage
export async function apagarFotos(caminhos) {
  if (!caminhos?.length) return
  await supabase.storage.from(BUCKET).remove(caminhos)
}
