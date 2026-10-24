import type { EvidenceInput } from './types'

const ALLOWED = new Set([
  'image/jpeg','image/png','image/webp','application/pdf','text/plain','text/markdown',
  'application/json','text/javascript','application/javascript','text/html','text/css',
  'video/mp4','video/quicktime'
])
export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const MAX_TOTAL_BYTES = 14 * 1024 * 1024

export function validateFiles(files: File[]): string | null {
  if (files.length === 0) return 'Upload at least one piece of evidence before requesting an analysis.'
  if (files.length > 8) return 'Upload up to 8 evidence files per review.'
  let total = 0
  for (const f of files) {
    const mime = f.type || (f.name.endsWith('.js') ? 'text/javascript' : '')
    if (!ALLOWED.has(mime) && !/\.(js|mjs|ts|txt|md|html|css|json)$/i.test(f.name)) return `Unsupported file type: ${f.name}. Use images, PDF, text/code, or a short MP4/MOV video.`
    if (f.size > MAX_FILE_BYTES) return `${f.name} exceeds 10 MB. Compress it or use a clearer cropped image.`
    total += f.size
  }
  if (total > MAX_TOTAL_BYTES) return 'Combined evidence must be 14 MB or less.'
  return null
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read file.'))
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`))
    reader.readAsDataURL(file)
  })
}

export async function filesToEvidence(files: File[]): Promise<EvidenceInput[]> {
  const result: EvidenceInput[] = []
  for (const file of files) {
    const textType = file.type.startsWith('text/') || /\.(js|mjs|ts|txt|md|html|css|json)$/i.test(file.name)
    if (textType) {
      result.push({ name: file.name, mimeType: file.type || 'text/plain', textContent: await file.text(), sizeBytes: file.size })
    } else {
      const url = await readAsDataUrl(file)
      result.push({ name: file.name, mimeType: file.type || 'application/octet-stream', dataBase64: url.split(',')[1], sizeBytes: file.size })
    }
  }
  return result
}
