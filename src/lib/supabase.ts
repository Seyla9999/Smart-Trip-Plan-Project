import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Upload an image file to Supabase Storage and return the public URL
export async function uploadImage(
  file: File,
  bucket: 'attraction-images' | 'story-images',
): Promise<string | null> {
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
