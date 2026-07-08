import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const configOk = Boolean(url && key)

let cliente = null
let erroInit = null
if (configOk) {
  try {
    cliente = createClient(url, key)
  } catch (e) {
    erroInit = e?.message || String(e)
    console.error('Falha ao inicializar Supabase:', e)
  }
}

export const supabase = cliente
export const erroSupabase = erroInit
