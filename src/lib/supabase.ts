import { createClient } from '@supabase/supabase-js'

// Read env vars safely (may be undefined in some dev scenarios)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Initialize the client only when both env vars are present. This prevents
// the app from throwing at module import time when running locally without
// Supabase configuration (useful for development and CI snapshots).
export let supabase: any | null = null
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    // If the client constructor throws for any reason, keep supabase null
    // and log a helpful message instead of crashing the app.
    // eslint-disable-next-line no-console
    console.warn('Failed to initialize Supabase client:', err)
    supabase = null
  }
}

// Upload an image file to Supabase Storage and return the public URL
export async function uploadImage(
  file: File,
  bucket: 'attraction-images' | 'story-images',
): Promise<string | null> {
  if (!supabase) {
    // Supabase is not available in this environment — skip upload and
    // return null so callers can fallback to a local/object URL.
    // eslint-disable-next-line no-console
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
