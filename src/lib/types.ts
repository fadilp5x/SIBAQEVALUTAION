export type Student = {
  id: string
  full_name: string
  admission_no?: string | null
  class_name?: string | null
  created_at: string
  active?: boolean
}
export type CriterionResult = { name: string; max_points: number; score: number; justification: string; evidence_refs?: string[] }
export type Assessment = {
  id: string
  student_id: string
  student_name: string
  student_ids?: string[]
  program_code: string
  program_name: string
  category: 'X' | 'O'
  ai_score: number
  final_score?: number | null
  confidence: 'high' | 'medium' | 'low'
  summary: string
  breakdown: CriterionResult[]
  strengths: string[]
  improvements: string[]
  evidence_flags: string[]
  needs_more_evidence: boolean
  topic?: string
  created_at: string
  review_status: 'AI suggested' | 'Confirmed'
  team_assessment?: boolean
}
export type EvidenceInput = { name: string; mimeType: string; signedUrl?: string; dataBase64?: string; textContent?: string; sizeBytes: number }
export type EvaluationResult = {
  total_score: number
  confidence: 'high' | 'medium' | 'low'
  summary: string
  criterion_breakdown: CriterionResult[]
  strengths: string[]
  improvements: string[]
  evidence_flags: string[]
  missing_evidence: string[]
  needs_more_evidence: boolean
}
