import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export let supabase: any | null = null
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err)
    supabase = null
  }
}

export async function uploadImage(
  file: File,
  bucket: 'attraction-images' | 'story-images',
): Promise<string | null> {
  if (!supabase) {

    console.warn('Supabase not initialized: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing')
    return null
  }
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(filename, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    console.error('Supabase upload error:', error.message)
    return null
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}
