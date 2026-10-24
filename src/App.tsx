import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  Activity, ArrowDownRight, ArrowRight, Award, BookOpen, Camera, Check, CheckCircle2,
  ChevronDown, ChevronRight, ClipboardCheck, Clock3, Cloud, Download, FileImage, FileText,
  Filter, Gauge, GraduationCap, LayoutDashboard, LogOut, Menu, Plus, RefreshCw, Search,
  Settings, ShieldCheck, Sparkles, Target, Trophy, Upload, Users, WandSparkles, X, Zap
} from 'lucide-react'
import { PROGRAMS, CATEGORY_O, CATEGORY_X, getProgram, type Program } from './lib/programs'
import { hasSupabaseConfig, supabase } from './lib/supabase'
import { validateFiles } from './lib/evidence'
import type { Assessment, CriterionResult, EvaluationResult, Student } from './lib/types'

const NAV = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'review', label: 'New review', icon: Sparkles },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'history', label: 'Review history', icon: ClipboardCheck },
  { id: 'programs', label: 'Programme library', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

type View = typeof NAV[number]['id']
const STORAGE_STUDENTS = 'sibaq-review-students-v1'
const STORAGE_ASSESSMENTS = 'sibaq-review-assessments-v1'
const isoNow = () => new Date().toISOString()
const localId = () => globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(16).slice(2)}`
const inferredMimeType = (file: File) => {
  if (file.type) return file.type
  const ext = file.name.toLowerCase().split('.').pop() || ''
  const byExtension: Record<string,string> = { js:'text/javascript', mjs:'text/javascript', ts:'text/plain', txt:'text/plain', md:'text/markdown', html:'text/html', css:'text/css', json:'application/json', pdf:'application/pdf', jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', webp:'image/webp', mp4:'video/mp4', mov:'video/quicktime' }
  return byExtension[ext] || 'application/octet-stream'
}
const readLocal = <T,>(key: string, fallback: T): T => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}
const writeLocal = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value))
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
const scoreTone = (n: number) => n >= 85 ? 'excellent' : n >= 70 ? 'good' : n >= 50 ? 'mid' : 'low'
const startOfWeek = (date: Date) => { const d = new Date(date); d.setHours(0,0,0,0); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d }
const isThisWeek = (iso: string) => new Date(iso) >= startOfWeek(new Date())
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const scoreOf = (a: Assessment) => a.final_score ?? a.ai_score

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [students, setStudents] = useState<Student[]>(() => hasSupabaseConfig ? [] : readLocal(STORAGE_STUDENTS, []))
  const [assessments, setAssessments] = useState<Assessment[]>(() => hasSupabaseConfig ? [] : readLocal(STORAGE_ASSESSMENTS, []))
  const [authReady, setAuthReady] = useState(!hasSupabaseConfig)
  const [accessApproved, setAccessApproved] = useState(!hasSupabaseConfig)
  const [session, setSession] = useState<any>(null)
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [globalNotice, setGlobalNotice] = useState('')
  const [mobileNav, setMobileNav] = useState(false)

  const loadCloudData = async () => {
    if (!supabase) return
    const [studentsRes, assessmentsRes] = await Promise.all([
      supabase.from('students').select('*').eq('active', true).order('full_name'),
      supabase.from('assessments').select('*').order('created_at', { ascending: false }).limit(500)
    ])
    if (studentsRes.error) setGlobalNotice(`Student list could not be loaded: ${studentsRes.error.message}`)
    else setStudents((studentsRes.data ?? []) as Student[])
    if (assessmentsRes.error) setGlobalNotice(`Assessment history could not be loaded: ${assessmentsRes.error.message}`)
    else setAssessments((assessmentsRes.data ?? []).map((row: any) => ({
      id: row.id, student_id: row.student_id, student_ids: row.student_ids ?? [row.student_id], student_name: row.student_name,
      program_code: row.program_code, program_name: row.program_name, category: row.category, ai_score: Number(row.ai_score ?? 0),
      final_score: row.final_score === null ? null : Number(row.final_score), confidence: row.confidence ?? 'low', summary: row.summary ?? '',
      breakdown: row.breakdown ?? [], strengths: row.strengths ?? [], improvements: row.improvements ?? [], evidence_flags: row.evidence_flags ?? [],
      needs_more_evidence: Boolean(row.needs_more_evidence), topic: row.topic ?? '', created_at: row.created_at, review_status: row.review_status ?? 'AI suggested',
      team_assessment: Boolean(row.team_assessment)
    })) as Assessment[])
  }

  const verifyReviewerApproval = async (userId: string) => {
    if (!supabase) return false
    const { data, error } = await supabase.from('profiles').select('approved, role').eq('id', userId).single()
    if (error) {
      setAccessApproved(false)
      setGlobalNotice(`Reviewer approval could not be checked: ${error.message}`)
      return false
    }
    if (!data?.approved) {
      setAccessApproved(false)
      setGlobalNotice('Your reviewer account is waiting for administrator approval. Ask the administrator to approve it in Supabase.')
      return false
    }
    setAccessApproved(true)
    setGlobalNotice('')
    await loadCloudData()
    return true
  }

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return }
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session)
      setAuthReady(true)
      if (data.session) void verifyReviewerApproval(data.session.user.id)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession) {
        setAccessApproved(false)
        window.setTimeout(() => { if (alive) void verifyReviewerApproval(nextSession.user.id) }, 0)
      } else {
        setAccessApproved(false); setStudents([]); setAssessments([])
      }
    })
    return () => { alive = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!hasSupabaseConfig) {
      writeLocal(STORAGE_STUDENTS, students)
      writeLocal(STORAGE_ASSESSMENTS, assessments)
    }
  }, [students, assessments])

  const signIn = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setAuthBusy(true); setGlobalNotice('')
    const result = authMode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
      : await supabase.auth.signUp({ email: authEmail, password: authPassword })
    setAuthBusy(false)
    if (result.error) setGlobalNotice(result.error.message)
    else if (authMode === 'sign-up' && !result.data.session) setGlobalNotice('Account request submitted. Check your email to confirm the account, then sign in.')
    else setGlobalNotice('')
  }

  const addStudent = async (name: string, admissionNo: string, className: string) => {
    const full_name = name.trim()
    if (!full_name) throw new Error('Enter the student name.')
    if (students.some(s => s.full_name.toLocaleLowerCase() === full_name.toLocaleLowerCase())) throw new Error('A student with this name already exists. Add an admission number if these are different students.')
    const payload = { full_name, admission_no: admissionNo.trim() || null, class_name: className.trim() || 'Aliyah', active: true, ...(session?.user?.id ? { created_by: session.user.id } : {}) }
    if (hasSupabaseConfig && supabase && session) {
      const { data, error } = await supabase.from('students').insert(payload).select('*').single()
      if (error) throw new Error(error.message)
      setStudents(prev => [...prev, data as Student].sort((a,b) => a.full_name.localeCompare(b.full_name)))
    } else {
      const s: Student = { id: localId(), ...payload, created_at: isoNow() }
      setStudents(prev => [...prev, s].sort((a,b) => a.full_name.localeCompare(b.full_name)))
    }
  }

  const confirmAssessment = async (assessment: Assessment, requestedScore?: number) => {
    const finalScore = requestedScore === undefined ? (assessment.final_score ?? assessment.ai_score) : Math.round(requestedScore)
    if (!Number.isFinite(finalScore) || finalScore < 0 || finalScore > 100) { setGlobalNotice('Final mark must be a whole number from 0 to 100.'); return }
    if (hasSupabaseConfig && supabase) {
      const { error } = await supabase.from('assessments').update({ review_status: 'Confirmed', final_score: finalScore, confirmed_at: isoNow() }).eq('id', assessment.id)
      if (error) { setGlobalNotice(`Could not confirm mark: ${error.message}`); return }
    }
    setAssessments(prev => prev.map(a => a.id === assessment.id ? { ...a, review_status: 'Confirmed', final_score: finalScore } : a))
    setGlobalNotice(finalScore === assessment.ai_score ? 'Mark confirmed. The original AI suggestion remains recorded separately.' : `Human-confirmed mark saved as ${finalScore}/100. The original AI suggestion remains recorded separately.`)
  }

  const saveAssessment = async (input: {
    studentIds: string[]; program: Program; topic: string; result: EvaluationResult; files: File[]; reviewerNotes: string; evidencePaths: string[]; assessmentId: string
  }) => {
    if (!input.studentIds.length) throw new Error('Select at least one student.')
    if (hasSupabaseConfig && supabase && session) {
      const id = input.assessmentId || localId()
      const paths = input.evidencePaths
      const first = students.find(s => s.id === input.studentIds[0])!
      const insert = await supabase.from('assessments').insert({
        id, student_id: first.id, student_ids: input.studentIds, student_name: input.studentIds.map(sid => students.find(s => s.id === sid)?.full_name).filter(Boolean).join(', '),
        program_code: input.program.code, program_name: input.program.name, category: input.program.category, topic: input.topic.trim() || null,
        ai_score: Math.round(input.result.total_score), final_score: null, confidence: input.result.confidence, summary: input.result.summary,
        breakdown: input.result.criterion_breakdown, strengths: input.result.strengths, improvements: input.result.improvements,
        evidence_flags: [...input.result.evidence_flags, ...input.result.missing_evidence], needs_more_evidence: input.result.needs_more_evidence,
        evidence_paths: paths, reviewer_notes: input.reviewerNotes.trim() || null, review_status: 'AI suggested', team_assessment: input.program.type === 'team', created_by: session.user.id
      }).select('*').single()
      if (insert.error) throw new Error(`Assessment save failed: ${insert.error.message}`)
      const row = insert.data as any
      const assessment: Assessment = {
        id: row.id, student_id: first.id, student_ids: input.studentIds, student_name: input.studentIds.map(sid => students.find(s => s.id === sid)?.full_name).filter(Boolean).join(', '),
        program_code: input.program.code, program_name: input.program.name, category: input.program.category, ai_score: Number(row.ai_score), final_score: null,
        confidence: row.confidence, summary: row.summary, breakdown: row.breakdown, strengths: row.strengths, improvements: row.improvements,
        evidence_flags: row.evidence_flags, needs_more_evidence: row.needs_more_evidence, topic: input.topic, created_at: row.created_at,
        review_status: 'AI suggested', team_assessment: input.program.type === 'team'
      }
      setAssessments(prev => [assessment, ...prev])
      return assessment
    }
    throw new Error('This preview is not connected to a database or AI evaluator. Configure Supabase and deploy the included evaluate-submission Edge Function before scoring real work.')
  }

  if (!authReady) return <div className="loading-screen"><div className="brand-mark large">S</div><div className="loading-title">Preparing Review Studio</div><div className="spinner" /></div>
  if (hasSupabaseConfig && !session) {
    return <div className="auth-wrap"><div className="auth-panel"><Brand /><div className="eyebrow">SIBĀQ ’26 · ALIYAH</div><h1>Welcome back.</h1><p>Sign in to review submissions, save marks and track student performance securely.</p><form onSubmit={signIn} className="auth-form"><label>Email address<input type="email" required value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="reviewer@college.edu" /></label><label>Password<input type="password" minLength={6} required value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder="At least 6 characters" /></label><button className="btn primary full" disabled={authBusy}>{authBusy ? 'Working…' : authMode === 'sign-in' ? 'Sign in' : 'Create account'} <ArrowRight size={16}/></button></form><button className="text-button" onClick={()=>setAuthMode(authMode==='sign-in'?'sign-up':'sign-in')}>{authMode==='sign-in' ? 'Need an account? Create one' : 'Already registered? Sign in'}</button>{globalNotice && <div className="notice error">{globalNotice}</div>}<small>After setting up the first reviewer account, restrict public sign-ups in Supabase Auth.</small></div></div>
  }

  if (hasSupabaseConfig && session && !accessApproved) {
    return <div className="auth-wrap"><div className="auth-panel approval-panel"><Brand/><div className="approval-mark"><ShieldCheck size={27}/></div><div className="eyebrow">REVIEWER ACCESS</div><h1>Approval required.</h1><p>This account has signed in, but it cannot view student records until an administrator approves it. This protects student work from unapproved accounts.</p>{globalNotice&&<div className="notice error">{globalNotice}</div>}<button className="btn primary full approval-refresh" onClick={()=>void verifyReviewerApproval(session.user.id)}><RefreshCw size={15}/> Check access again</button><button className="text-button" onClick={()=>void supabase?.auth.signOut()}>Sign out</button><small>The first reviewer must be approved as admin in Supabase SQL Editor: <code>update public.profiles set approved = true, role = 'admin' where email = 'YOUR-ADMIN-EMAIL';</code></small></div></div>
  }

  const currentView = view
  const navigate = (next: View) => { setView(next); setMobileNav(false); setGlobalNotice('') }
  const selectedName = session?.user?.email ? session.user.email.split('@')[0] : 'Reviewer'

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
      <Brand />
      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list">{NAV.map(item => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${currentView===item.id?'active':''}`} onClick={()=>navigate(item.id)}><Icon size={18}/><span>{item.label}</span>{item.id==='review' && <span className="nav-dot"/>}</button> })}</nav>
      <div className="sidebar-spacer"/>
      <div className="source-card"><div className="source-icon"><BookOpen size={17}/></div><div><strong>Official source</strong><span>SIBĀQ ’26 concept note</span></div><a href="/docs/sibaq-26-concept-note.pdf" target="_blank" rel="noreferrer" aria-label="Open concept note"><ArrowRight size={15}/></a></div>
      <div className="sidebar-bottom"><div className="reviewer-avatar">{initials(selectedName)}</div><div className="reviewer-info"><strong>{selectedName}</strong><span>{hasSupabaseConfig ? 'Reviewer account' : 'Local preview mode'}</span></div>{supabase && session && <button className="icon-button sidebar-logout" title="Sign out" onClick={()=>void supabase.auth.signOut()}><LogOut size={16}/></button>}</div>
    </aside>
    {mobileNav && <button aria-label="Close navigation" className="mobile-shade" onClick={()=>setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={()=>setMobileNav(!mobileNav)}><Menu size={19}/></button><div className="breadcrumb">SIBĀQ ’26 <ChevronRight size={14}/> <span>{NAV.find(n=>n.id===currentView)?.label}</span></div></div><div className="topbar-right"><span className={`mode-pill ${hasSupabaseConfig?'connected':'preview'}`}><span className="status-dot"/>{hasSupabaseConfig?'Cloud workspace':'Preview mode'}</span><div className="top-avatar">{initials(selectedName)}</div></div></header>
      {globalNotice && <div className={`global-notice ${globalNotice.toLowerCase().includes('failed')||globalNotice.toLowerCase().includes('could not')||globalNotice.toLowerCase().includes('error')?'is-error':''}`}><span>{globalNotice}</span><button onClick={()=>setGlobalNotice('')}><X size={14}/></button></div>}
      {!hasSupabaseConfig && <div className="preview-banner"><div className="preview-banner-icon"><ShieldCheck size={17}/></div><div><strong>Local preview only</strong><span>Students you add are saved in this browser. AI evaluation and shared database storage stay disabled until you configure Supabase and the Gemini Edge Function.</span></div><button onClick={()=>navigate('settings')}>Set up cloud <ArrowRight size={14}/></button></div>}
      {currentView==='dashboard' && <Dashboard students={students} assessments={assessments} onNavigate={navigate} onConfirm={confirmAssessment} />}
      {currentView==='review' && <NewReview students={students} onAddStudent={addStudent} onSave={saveAssessment} configured={Boolean(hasSupabaseConfig && session)} onNavigate={navigate} />}
      {currentView==='students' && <StudentsPage students={students} assessments={assessments} onAddStudent={addStudent} onNavigate={navigate} />}
      {currentView==='history' && <HistoryPage assessments={assessments} onConfirm={confirmAssessment} />}
      {currentView==='programs' && <ProgramsPage onReview={(code)=>{ window.history.replaceState({},'','#review-'+code); navigate('review'); }} />}
      {currentView==='settings' && <SettingsPage configured={Boolean(hasSupabaseConfig)} authenticated={Boolean(session)} />}
      <footer className="footer"><span>SIBĀQ Review Studio <span className="footer-sep">·</span> Aliyah X & O programmes only</span><span>AI-assisted review, human-confirmed marks</span></footer>
    </main>
  </div>
}

function Brand() {
  return <div className="brand"><div className="brand-mark">S</div><div className="brand-copy"><strong>SIBĀQ <span>Review Studio</span></strong><small>ALIYAH · 2026</small></div></div>
}

function Dashboard({students, assessments, onNavigate, onConfirm}:{students:Student[];assessments:Assessment[];onNavigate:(v:View)=>void;onConfirm:(a:Assessment)=>void}) {
  const thisWeek = assessments.filter(a=>isThisWeek(a.created_at))
  const eligible = assessments.filter(a=>!a.team_assessment)
  const average = assessments.length ? Math.round(assessments.reduce((s,a)=>s+scoreOf(a),0)/assessments.length) : 0
  const currentWeekStudents = useMemo(() => {
    const map = new Map<string,{name:string; scores:number[]; last:string}>()
    thisWeek.filter(a=>!a.team_assessment).forEach(a=>{
      const key=a.student_id; const item=map.get(key) ?? {name:a.student_name,scores:[],last:a.created_at}; item.scores.push(scoreOf(a)); if(new Date(a.created_at)>new Date(item.last)) item.last=a.created_at; map.set(key,item)
    })
    return [...map.entries()].map(([id,x])=>({id,...x,avg:Math.round(x.scores.reduce((s,v)=>s+v,0)/x.scores.length),count:x.scores.length})).sort((a,b)=>b.avg-a.avg || b.count-a.count)
  },[assessments])
  const highPerformers = useMemo(() => {
    const map = new Map<string,{name:string;scores:number[];count:number;last:string}>()
    eligible.forEach(a=>{const key=a.student_id; const item=map.get(key)??{name:a.student_name,scores:[],count:0,last:a.created_at};item.scores.push(scoreOf(a));item.count++;if(new Date(a.created_at)>new Date(item.last))item.last=a.created_at;map.set(key,item)})
    return [...map.entries()].map(([id,x])=>({id,...x,avg:Math.round(x.scores.reduce((s,v)=>s+v,0)/x.scores.length)})).sort((a,b)=>b.avg-a.avg).slice(0,5)
  },[assessments])
  const recent = assessments.slice(0,5)
  return <div className="page-content">
    <section className="page-heading"><div><div className="eyebrow">YOUR REVIEW WORKSPACE</div><h1>Overview <span className="heading-period">/ This week</span></h1><p>Track submissions, marks and the students progressing fastest.</p></div><button className="btn primary" onClick={()=>onNavigate('review')}><Plus size={17}/> Start a review</button></section>
    <section className="stat-grid">
      <StatCard label="Students tracked" value={students.length} detail="Active Aliyah students" icon={Users} color="blue" />
      <StatCard label="Reviews this week" value={thisWeek.length} detail="Monday–Sunday" icon={ClipboardCheck} color="purple" />
      <StatCard label="Average mark" value={assessments.length ? `${average}/100` : '—'} detail="Across saved reviews" icon={Gauge} color="green" />
      <StatCard label="Programmes" value="12" detail="10 X-category · 2 O-category" icon={Target} color="orange" />
    </section>
    <div className="dashboard-grid">
      <section className="panel weekly-panel"><div className="panel-heading"><div><div className="eyebrow">WEEKLY LEADERBOARD</div><h2>Star performer</h2><p>Individual results recorded since Monday.</p></div><span className="week-chip">This week</span></div>
        {currentWeekStudents.length ? <><div className="winner-card"><div className="winner-trophy"><Trophy size={25}/></div><div className="winner-meta"><span>TOP AVERAGE THIS WEEK</span><strong>{currentWeekStudents[0].name}</strong><small>{currentWeekStudents[0].count} review{currentWeekStudents[0].count===1?'':'s'} recorded</small></div><div className="winner-score"><strong>{currentWeekStudents[0].avg}</strong><span>/100</span></div></div><div className="leader-list">{currentWeekStudents.slice(1,5).map((s,i)=><div className="leader-row" key={s.id}><span className="leader-rank">{i+2}</span><span className="mini-avatar">{initials(s.name)}</span><strong>{s.name}</strong><span className="leader-count">{s.count} review{s.count===1?'':'s'}</span><span className={`leader-mark ${scoreTone(s.avg)}`}>{s.avg}</span></div>)}</div><p className="panel-footnote">This is a performance estimate from recorded review scores, not an official SIBĀQ ranking. Team submissions are excluded from individual ranks.</p></> : <EmptyState icon={Trophy} title="No weekly leader yet" message="Save the first evaluation to start the weekly leaderboard." action="Start first review" onClick={()=>onNavigate('review')} />}
      </section>
      <section className="panel performance-panel"><div className="panel-heading"><div><div className="eyebrow">ALL-TIME PERFORMANCE</div><h2>High performers</h2><p>Ranked by average individual score.</p></div><button className="small-link" onClick={()=>onNavigate('students')}>All students <ArrowRight size={14}/></button></div>
        {highPerformers.length ? <div className="performer-list">{highPerformers.map((s,i)=><div className="performer-row" key={s.id}><div className={`performer-rank rank-${i+1}`}>{i+1}</div><div className="performer-info"><strong>{s.name}</strong><span>{s.count} saved review{s.count===1?'':'s'} · last {fmtDate(s.last)}</span><div className="meter"><span style={{width:`${Math.min(100,s.avg)}%`}}/></div></div><strong className={`performer-score ${scoreTone(s.avg)}`}>{s.avg}</strong></div>)}</div> : <EmptyState icon={Award} title="Results appear here" message="Create student profiles and save reviewed work to compare progress." action="Add a student" onClick={()=>onNavigate('students')} />}
      </section>
    </div>
    <section className="panel recent-panel"><div className="panel-heading"><div><div className="eyebrow">RECENT ACTIVITY</div><h2>Latest reviews</h2></div><button className="small-link" onClick={()=>onNavigate('history')}>Full history <ArrowRight size={14}/></button></div>
      {recent.length ? <div className="table-wrap"><table><thead><tr><th>Student / team</th><th>Programme</th><th>Date</th><th>AI mark</th><th>Status</th><th></th></tr></thead><tbody>{recent.map(a=><tr key={a.id}><td><div className="student-cell"><span className="mini-avatar">{initials(a.student_name)}</span><strong>{a.student_name}</strong></div></td><td><span className="programme-cell"><span className={`category-dot ${a.category.toLowerCase()}`}>{a.category}</span>{a.program_name}</span></td><td className="muted-cell">{fmtDate(a.created_at)}</td><td><span className={`table-score ${scoreTone(scoreOf(a))}`}>{scoreOf(a)}<small>/100</small></span></td><td><span className={`status-label ${a.review_status==='Confirmed'?'confirmed':'pending'}`}>{a.review_status}</span></td><td>{a.review_status!=='Confirmed' && <button className="confirm-button" onClick={()=>onConfirm(a)} title="Confirm this AI mark"><Check size={14}/> Confirm</button>}</td></tr>)}</tbody></table></div> : <EmptyState icon={ClipboardCheck} title="Nothing reviewed yet" message="Your saved assessments will appear here, with source-linked breakdowns and score history." action="Start a review" onClick={()=>onNavigate('review')} />}
    </section>
    <section className="quick-start"><div className="quick-icon"><Zap size={20}/></div><div><strong>Keep marks defensible.</strong><p>Attach the task or question when needed, review the evidence flags, and confirm AI suggestions manually.</p></div><button className="btn secondary" onClick={()=>onNavigate('programs')}>Explore programmes <ArrowRight size={15}/></button></section>
  </div>
}
function StatCard({label,value,detail,icon:Icon,color}:{label:string;value:string|number;detail:string;icon:any;color:string}) { return <div className="stat-card"><div className={`stat-icon ${color}`}><Icon size={19}/></div><div className="stat-main"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div><div className="stat-spark"><ArrowDownRight size={15}/></div></div> }
function EmptyState({icon:Icon,title,message,action,onClick}:{icon:any;title:string;message:string;action?:string;onClick?:()=>void}) { return <div className="empty-state"><div className="empty-icon"><Icon size={23}/></div><strong>{title}</strong><p>{message}</p>{action&&onClick&&<button className="small-link" onClick={onClick}>{action} <ArrowRight size={14}/></button>}</div> }

function NewReview({students,onAddStudent,onSave,configured,onNavigate}:{students:Student[];onAddStudent:(n:string,a:string,c:string)=>Promise<void>;onSave:(p:{studentIds:string[];program:Program;topic:string;result:EvaluationResult;files:File[];reviewerNotes:string;evidencePaths:string[];assessmentId:string})=>Promise<Assessment>;configured:boolean;onNavigate:(v:View)=>void}) {
  const [programCode,setProgramCode] = useState(()=>window.location.hash.startsWith('#review-')?window.location.hash.slice(8):'')
  const [studentIds,setStudentIds] = useState<string[]>([])
  const [topic,setTopic] = useState('')
  const [answerKey,setAnswerKey] = useState('')
  const [reviewerNotes,setReviewerNotes] = useState('')
  const [files,setFiles] = useState<File[]>([])
  const [analyzing,setAnalyzing] = useState(false)
  const [saving,setSaving] = useState(false)
  const [error,setError] = useState('')
  const [result,setResult] = useState<EvaluationResult|null>(null)
  const [showNewStudent,setShowNewStudent] = useState(false)
  const [newName,setNewName] = useState('')
  const [newAdmission,setNewAdmission] = useState('')
  const [newClass,setNewClass] = useState('Aliyah')
  const [savedAssessment,setSavedAssessment] = useState<Assessment|null>(null)
  const [pendingEvidencePaths,setPendingEvidencePaths] = useState<string[]>([])
  const [pendingReviewId,setPendingReviewId] = useState('')
  const [categoryFilter,setCategoryFilter] = useState<'all'|'X'|'O'>('all')
  const fileInput = useRef<HTMLInputElement>(null)
  const cameraInput = useRef<HTMLInputElement>(null)
  const program = getProgram(programCode)
  const visiblePrograms = PROGRAMS.filter(p=>categoryFilter==='all'||p.category===categoryFilter)
  useEffect(()=>{ if(students.length===1 && studentIds.length===0) setStudentIds([students[0].id]) },[students,studentIds.length])
  useEffect(()=>{ if(window.location.hash.startsWith('#review-')){const code=window.location.hash.slice(8); if(getProgram(code)) setProgramCode(code)} },[])
  const toggleStudent = (id:string) => setStudentIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id])
  const createStudent = async (event:FormEvent) => { event.preventDefault(); setError(''); try { await onAddStudent(newName,newAdmission,newClass); setNewName('');setNewAdmission('');setNewClass('Aliyah');setShowNewStudent(false) } catch(e) {setError(e instanceof Error?e.message:'Could not create student.')} }
  const onFiles = (newFiles:FileList|null) => { if(!newFiles) return; setError(''); setResult(null); setSavedAssessment(null); const next=[...files,...Array.from(newFiles)]; const errorMsg=validateFiles(next); if(errorMsg && errorMsg!=='Upload at least one piece of evidence before requesting an analysis.') {setError(errorMsg); return} setFiles(next) }
  const runAI = async () => {
    setError('');setResult(null);setSavedAssessment(null)
    if(!program) {setError('Choose a programme first.');return}
    if(students.length===0){setError('Create at least one student before reviewing work.');return}
    if(studentIds.length===0){setError('Select a student.');return}
    if(program.type==='individual'&&studentIds.length>1){setError('This is an individual programme. Select one student only.');return}
    if(program.type==='team'&&studentIds.length!==5){setError('This is a five-person team programme. Select all five participating students before continuing.');return}
    const fileErr=validateFiles(files);if(fileErr){setError(fileErr);return}
    if(!configured || !supabase){setError('AI scoring is disabled in local preview mode. Configure Supabase, add GEMINI_API_KEY as an Edge Function secret, deploy the included evaluate-submission function, then sign in. No mock marks will be generated.');return}
    setAnalyzing(true)
    let uploadedNow: string[] = []
    const reviewId = localId()
    try {
      // Upload the evidence first and pass short-lived signed URLs to the Edge Function.
      // This keeps large image/PDF payloads out of the function invocation body.
      if (pendingEvidencePaths.length > 0) {
        await supabase.storage.from('review-evidence').remove(pendingEvidencePaths)
        setPendingEvidencePaths([])
      }
      const evidence=[] as Array<{name:string;mimeType:string;signedUrl:string;sizeBytes:number}>
      for (const file of files) {
        const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `${session.user.id}/${reviewId}/${Date.now()}-${sanitized}`
        const uploaded = await supabase.storage.from('review-evidence').upload(path, file, { contentType: inferredMimeType(file), upsert: false })
        if (uploaded.error) throw new Error(`Evidence upload failed (${file.name}): ${uploaded.error.message}`)
        uploadedNow.push(path)
        const signed = await supabase.storage.from('review-evidence').createSignedUrl(path, 600)
        if (signed.error || !signed.data?.signedUrl) throw new Error(`Could not create a temporary private link for ${file.name}.`)
        evidence.push({name:file.name,mimeType:inferredMimeType(file),signedUrl:signed.data.signedUrl,sizeBytes:file.size})
      }
      setPendingEvidencePaths(uploadedNow)
      setPendingReviewId(reviewId)
      const response=await supabase.functions.invoke('evaluate-submission',{body:{program_code:program.code,student_names:studentIds.map(id=>students.find(s=>s.id===id)?.full_name).filter(Boolean),topic,answer_key:answerKey,reviewer_notes:reviewerNotes,evidence}})
      if(response.error) throw new Error(response.error.message)
      if(response.data?.error) throw new Error(response.data.error)
      const r=response.data as EvaluationResult
      if(!Array.isArray(r.criterion_breakdown)||typeof r.total_score!=='number') throw new Error('The AI response did not match the required score format. Try again or inspect the Edge Function logs.')
      const sum=r.criterion_breakdown.reduce((n,c)=>n+Number(c.score||0),0)
      r.total_score=Math.max(0,Math.min(100,Math.round(sum)))
      setResult(r)
    } catch(e) {
      if (uploadedNow.length) { await supabase.storage.from('review-evidence').remove(uploadedNow); setPendingEvidencePaths([]); setPendingReviewId('') }
      setError(e instanceof Error?e.message:'Analysis failed. Check your connection and configuration.')
    } finally {setAnalyzing(false)}
  }
  const save = async () => {
    if(!program||!result)return
    setSaving(true);setError('')
    try {const saved=await onSave({studentIds,program,topic,result,files,reviewerNotes,evidencePaths:pendingEvidencePaths,assessmentId:pendingReviewId});setSavedAssessment(saved);setResult(null);setFiles([]);setPendingEvidencePaths([]);setPendingReviewId('');setTopic('');setAnswerKey('');setReviewerNotes('');setProgramCode('');setStudentIds(students.length===1?[students[0].id]:[]);window.history.replaceState({},'','#review');}
    catch(e){setError(e instanceof Error?e.message:'Could not save this review.')}finally{setSaving(false)}
  }
  return <div className="page-content review-page">
    <section className="page-heading"><div><div className="eyebrow">EVIDENCE-BASED ASSESSMENT</div><h1>New review</h1><p>Select an Aliyah X/O programme, identify the student, upload evidence, then analyse and save the result.</p></div><a className="btn secondary" href="/docs/sibaq-26-concept-note.pdf" target="_blank" rel="noreferrer"><BookOpen size={16}/> Open concept note</a></section>
    {savedAssessment && <div className="saved-banner"><CheckCircle2 size={21}/><div><strong>Review saved successfully</strong><span>{savedAssessment.student_name} · {savedAssessment.program_name} · {savedAssessment.ai_score}/100 AI suggested mark</span></div><button className="btn secondary" onClick={()=>onNavigate('history')}>View history <ArrowRight size={14}/></button></div>}
    <div className="review-layout"><div className="review-main-column">
      <section className="panel review-panel"><div className="section-head"><div className="step-number">01</div><div><h2>Choose programme</h2><p>Only Aliyah X and O category events from the official concept note are available.</p></div><span className="section-step">STEP 1 OF 4</span></div>
        <div className="filter-row"><div className="segmented">{([{id:'all',label:'All 12'},{id:'X',label:'X category · 10'},{id:'O',label:'O category · 2'}] as const).map(c=><button key={c.id} className={categoryFilter===c.id?'selected':''} onClick={()=>setCategoryFilter(c.id)}>{c.label}</button>)}</div><span className="mini-source"><ShieldCheck size={13}/> Source linked</span></div>
        <div className="program-picker">{visiblePrograms.map(p=><button key={p.code} className={`program-option ${programCode===p.code?'selected':''}`} onClick={()=>{setProgramCode(p.code);setResult(null);setSavedAssessment(null);setError('')}}><div className={`program-badge ${p.category.toLowerCase()}`}>{p.code}</div><div className="program-option-body"><strong>{p.name}</strong><span>{p.skill} · {p.durationMinutes} min</span></div>{programCode===p.code?<CheckCircle2 className="program-check" size={17}/>:<ChevronRight className="program-chevron" size={16}/>}</button>)}</div>
        {program && <div className="selected-program-detail"><div className="detail-title"><div><span className={`category-pill ${program.category.toLowerCase()}`}>{program.category} CATEGORY</span><h3>{program.name}</h3></div><span className="duration"><Clock3 size={15}/>{program.durationMinutes} min</span></div><p>{program.description}</p><div className="source-line"><BookOpen size={14}/><span>{program.sourcePage}</span><span className="source-dot">·</span><span>{program.type==='team'?program.candidates:'Individual event'}</span></div><div className="evidence-tip"><Sparkles size={16}/><div><strong>Evidence checklist</strong><span>{program.inputHint}</span></div></div></div>}
      </section>
      <section className="panel review-panel"><div className="section-head"><div className="step-number">02</div><div><h2>Student details</h2><p>One student is selected automatically when there is only one profile.</p></div><span className="section-step">STEP 2 OF 4</span></div>
        {students.length===0 ? <div className="no-students"><div className="empty-icon"><Users size={22}/></div><div><strong>No student profiles yet</strong><span>Create a student profile first. It will then be available for every programme review.</span></div><button className="btn primary" onClick={()=>setShowNewStudent(true)}><Plus size={15}/> Add student</button></div> : <><div className="field-row"><label className="field-label" htmlFor="student-select">Student {program?.type==='team'&&<span className="required-note">· team event, select all members</span>}</label>{program?.type==='team'?<span className="selected-count">{studentIds.length} selected</span>:null}</div>{program?.type==='team'?<div className="team-student-grid">{students.map(s=><label key={s.id} className={`student-choice ${studentIds.includes(s.id)?'selected':''}`}><input type="checkbox" checked={studentIds.includes(s.id)} onChange={()=>toggleStudent(s.id)}/><span className="mini-avatar">{initials(s.full_name)}</span><span><strong>{s.full_name}</strong><small>{s.admission_no||s.class_name||'Aliyah'}</small></span></label>)}</div>:<div className="select-with-add"><select id="student-select" value={studentIds[0]||''} onChange={e=>setStudentIds(e.target.value?[e.target.value]:[])}><option value="">Select a student…</option>{students.map(s=><option key={s.id} value={s.id}>{s.full_name}{s.admission_no?` · ${s.admission_no}`:''}</option>)}</select><button className="btn secondary" onClick={()=>setShowNewStudent(!showNewStudent)}><Plus size={15}/> Add student</button></div>}
        {showNewStudent && <form className="inline-create-student" onSubmit={createStudent}><div className="inline-form-heading"><strong>New student profile</strong><button type="button" className="icon-button" onClick={()=>setShowNewStudent(false)}><X size={16}/></button></div><div className="inline-form-fields"><label>Full name *<input required value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Student's full name" autoFocus/></label><label>Admission no.<input value={newAdmission} onChange={e=>setNewAdmission(e.target.value)} placeholder="Optional ID"/></label><label>Class / group<input value={newClass} onChange={e=>setNewClass(e.target.value)} placeholder="Aliyah"/></label><button className="btn primary" type="submit"><Check size={15}/> Save profile</button></div></form>}</>}
      </section>
      <section className="panel review-panel"><div className="section-head"><div className="step-number">03</div><div><h2>Upload submission evidence</h2><p>Upload the complete answer, artwork, screen export or other evidence relevant to the event.</p></div><span className="section-step">STEP 3 OF 4</span></div>
        <label className="field-label" htmlFor="topic-field">Assigned topic / question / task brief <span className="optional-note">Recommended</span></label><textarea id="topic-field" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Paste the exact question, topic, task instructions or assessment brief here…" rows={3}/>
        <label className="field-label answer-key-label" htmlFor="answer-key">Official answer key / expected answer <span className="optional-note">Especially important for Civic Quest and factual tests</span></label><textarea id="answer-key" value={answerKey} onChange={e=>setAnswerKey(e.target.value)} placeholder="Paste the accepted answer, rubric or marking scheme if available…" rows={2}/>
        <div className="upload-zone" role="button" tabIndex={0} onClick={()=>fileInput.current?.click()} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')fileInput.current?.click()}} onDragOver={e=>{e.preventDefault();e.currentTarget.classList.add('dragging')}} onDragLeave={e=>e.currentTarget.classList.remove('dragging')} onDrop={e=>{e.preventDefault();e.currentTarget.classList.remove('dragging');onFiles(e.dataTransfer.files)}}><input ref={fileInput} type="file" multiple hidden accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,text/markdown,application/json,text/javascript,application/javascript,text/html,text/css,video/mp4,video/quicktime,.js,.mjs,.ts,.txt,.md,.html,.css,.json,.mp4,.mov" onChange={e=>onFiles(e.target.files)}/><div className="upload-icon"><Upload size={21}/></div><strong>Drop evidence files here, or <span>browse</span></strong><p>Photos and scans · PDF · code files · screenshots · short MP4/MOV videos</p><small>Up to 8 files · 10 MB per file · 18 MB total</small></div><input ref={cameraInput} type="file" hidden accept="image/*" capture="environment" onChange={e=>onFiles(e.target.files)}/><div className="upload-quick-actions"><button type="button" className="btn secondary" onClick={()=>cameraInput.current?.click()}><Camera size={15}/> Take a photo</button><button type="button" className="btn secondary" onClick={()=>fileInput.current?.click()}><Upload size={15}/> Browse files</button></div>
        {files.length>0&&<div className="uploaded-files">{files.map((f,i)=><div key={`${f.name}-${i}`} className="file-row"><div className="file-icon">{f.type.startsWith('image/')?<FileImage size={17}/>:f.type.startsWith('video/')?<Camera size={17}/>:<FileText size={17}/>}</div><div className="file-meta"><strong>{f.name}</strong><span>{(f.size/1024).toFixed(0)} KB · {f.type||'document'}</span></div><button className="icon-button remove-file" title="Remove file" onClick={()=>{setFiles(prev=>prev.filter((_,idx)=>idx!==i));setResult(null)}}><X size={15}/></button></div>)}</div>}
        <label className="field-label reviewer-notes-label" htmlFor="reviewer-notes">Reviewer notes <span className="optional-note">Optional</span></label><textarea id="reviewer-notes" value={reviewerNotes} onChange={e=>setReviewerNotes(e.target.value)} placeholder="Any context for the evaluator, e.g. page order, group submission, or special instructions…" rows={2}/>
      </section>
      <section className="review-actions"><div className="privacy-note"><ShieldCheck size={17}/><span>Evidence should be assessed only against the selected programme's rubric. Student work is private to signed-in reviewers in the configured database.</span></div><button className="btn primary analyze-btn" onClick={()=>void runAI()} disabled={analyzing||saving||!programCode||!studentIds.length||files.length===0}>{analyzing?<><span className="spinner tiny"/> Analysing submission…</>:<><WandSparkles size={17}/> Analyse with AI <ArrowRight size={15}/></>}</button></section>
      {error && <div className="notice error"><X size={16}/><span>{error}</span></div>}
      {result && program && <EvaluationResultCard result={result} program={program} studentNames={studentIds.map(id=>students.find(s=>s.id===id)?.full_name||'Student')} saving={saving} onSave={()=>void save()} onDiscard={()=>{setResult(null);if(supabase&&pendingEvidencePaths.length)void supabase.storage.from('review-evidence').remove(pendingEvidencePaths);setPendingEvidencePaths([]);setPendingReviewId('')}} />}
    </div>
    <aside className="review-side-column"><section className="side-panel sticky-panel"><div className="side-panel-title"><div className="side-panel-icon"><ShieldCheck size={17}/></div><div><strong>Scoring standard</strong><span>Source-grounded assessment</span></div></div><p>The official concept note lists event skills and evaluation areas. Where it does not publish numeric weights, this app uses a transparent, provisional 100-point coaching rubric.</p><div className="side-divider"/><div className="side-check-list"><div><CheckCircle2 size={16}/><span>Programme-specific criteria</span></div><div><CheckCircle2 size={16}/><span>Marks with visible reasoning</span></div><div><CheckCircle2 size={16}/><span>Evidence gaps called out</span></div><div><CheckCircle2 size={16}/><span>Human confirmation before final mark</span></div></div><div className="side-warning"><strong>Not an official jury score</strong><span>AI can misread handwriting or miss context. Verify every mark before using it for formal ranking.</span></div></section>
      {program && <section className="side-panel rubric-preview"><div className="eyebrow">ACTIVE RUBRIC</div><h3>{program.name}</h3><p>{program.criteria.length} criteria · Total 100 points</p><div className="mini-rubric">{program.criteria.map(c=><div key={c.name}><span title={c.name}>{c.name}</span><b>{c.maxPoints}</b></div>)}</div><a href="/docs/sibaq-26-concept-note.pdf" target="_blank" rel="noreferrer" className="source-link">View source document <ArrowRight size={14}/></a></section>}
      <section className="side-panel help-panel"><div className="help-icon"><Sparkles size={17}/></div><strong>Get a more reliable score</strong><p>Photograph paper flat, keep every page in frame, avoid shadows, and include the question paper for factual tasks.</p></section>
    </aside></div>
  </div>
}

function EvaluationResultCard({result,program,studentNames,saving,onSave,onDiscard}:{result:EvaluationResult;program:Program;studentNames:string[];saving:boolean;onSave:()=>void;onDiscard:()=>void}) {
  const score=Math.round(result.criterion_breakdown.reduce((s,c)=>s+Number(c.score||0),0))
  return <section className="panel evaluation-panel"><div className="evaluation-header"><div><div className="eyebrow">AI REVIEW COMPLETE</div><h2>Assessment result</h2><p>{studentNames.join(', ')} · {program.name}</p></div><button className="icon-button" title="Discard result" onClick={onDiscard}><X size={17}/></button></div>
    <div className="result-overview"><div className={`result-score ${scoreTone(score)}`}><span className="score-number">{score}</span><span className="score-denominator">/100</span><span className="score-label">AI suggested mark</span></div><div className="result-summary"><div className="result-badges"><span className={`confidence ${result.confidence}`}><span/> {result.confidence} confidence</span><span className={`status-label ${result.needs_more_evidence?'pending':'confirmed'}`}>{result.needs_more_evidence?'More evidence needed':'Evidence reviewed'}</span></div><p>{result.summary}</p><small>Numeric weights are provisional coaching weights derived from the concept note, not official organiser weights.</small></div></div>
    {result.missing_evidence.length>0 && <div className="result-alert"><strong><ShieldCheck size={16}/> Evidence limitations</strong><ul>{result.missing_evidence.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
    <div className="breakdown-heading"><h3>Detailed score breakdown</h3><span>Points awarded by criterion</span></div><div className="criterion-list">{result.criterion_breakdown.map((c,i)=><div className="criterion-row" key={`${c.name}-${i}`}><div className="criterion-top"><strong>{c.name}</strong><span><b>{c.score}</b> / {c.max_points}</span></div><div className="criterion-meter"><span style={{width:`${Math.max(0,Math.min(100,c.score/Math.max(1,c.max_points)*100))}%`}}/></div><p>{c.justification}</p>{c.evidence_refs?.length ? <small className="evidence-ref">Evidence: {c.evidence_refs.join(', ')}</small>:null}</div>)}</div>
    <div className="feedback-grid"><div className="feedback-card strength"><h4><CheckCircle2 size={16}/> What worked</h4><ul>{result.strengths.map((x,i)=><li key={i}>{x}</li>)}</ul></div><div className="feedback-card improve"><h4><Target size={16}/> Priorities to improve</h4><ul>{result.improvements.map((x,i)=><li key={i}>{x}</li>)}</ul></div></div>
    {result.evidence_flags.length>0&&<div className="evidence-flags"><strong>Reading and verification notes</strong><ul>{result.evidence_flags.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
    <div className="save-result-row"><span><ShieldCheck size={15}/> Saving creates a permanent record in the configured database.</span><div><button className="btn secondary" onClick={onDiscard}>Discard</button><button className="btn primary" onClick={onSave} disabled={saving}>{saving?'Saving…':<><Check size={16}/> Save review</>}</button></div></div>
  </section>
}

function StudentsPage({students,assessments,onAddStudent,onNavigate}:{students:Student[];assessments:Assessment[];onAddStudent:(n:string,a:string,c:string)=>Promise<void>;onNavigate:(v:View)=>void}) {
  const [search,setSearch]=useState(''); const [showForm,setShowForm]=useState(false);const [name,setName]=useState('');const [admission,setAdmission]=useState('');const [className,setClassName]=useState('Aliyah');const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [selectedStudentId,setSelectedStudentId]=useState('')
  const filtered=students.filter(s=>`${s.full_name} ${s.admission_no||''} ${s.class_name||''}`.toLowerCase().includes(search.toLowerCase()))
  const selectedStudent=students.find(s=>s.id===selectedStudentId)
  const selectedRecords=assessments.filter(a=>(a.student_ids??[a.student_id]).includes(selectedStudentId)).sort((a,b)=>b.created_at.localeCompare(a.created_at))
  const selectedAverage=selectedRecords.length?Math.round(selectedRecords.reduce((n,a)=>n+scoreOf(a),0)/selectedRecords.length):null
  const selectedBest=selectedRecords.length?Math.max(...selectedRecords.map(scoreOf)):null
  const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setError('');try{await onAddStudent(name,admission,className);setName('');setAdmission('');setClassName('Aliyah');setShowForm(false)}catch(ex){setError(ex instanceof Error?ex.message:'Could not add student.')}finally{setBusy(false)}}
  return <div className="page-content"><section className="page-heading"><div><div className="eyebrow">STUDENT RECORDS</div><h1>Students</h1><p>Create each student once, then reuse their profile across all twelve programmes.</p></div><button className="btn primary" onClick={()=>setShowForm(!showForm)}><Plus size={17}/> Add student</button></section>
    {showForm&&<section className="panel add-student-panel"><div className="panel-heading"><div><h2>New student profile</h2><p>Name and admission number help avoid duplicate records.</p></div><button className="icon-button" onClick={()=>setShowForm(false)}><X size={17}/></button></div><form onSubmit={submit} className="student-form"><label>Full name *<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Student's full name" /></label><label>Admission number<input value={admission} onChange={e=>setAdmission(e.target.value)} placeholder="Optional"/></label><label>Class / group<input value={className} onChange={e=>setClassName(e.target.value)} placeholder="Aliyah"/></label><button className="btn primary" disabled={busy}>{busy?'Saving…':<><Check size={15}/> Save student</>}</button></form>{error&&<div className="notice error">{error}</div>}</section>}
    {selectedStudent&&<section className="panel student-profile-panel"><div className="student-profile-head"><div className="student-profile-identity"><div className="profile-avatar">{initials(selectedStudent.full_name)}</div><div><div className="eyebrow">STUDENT PERFORMANCE PROFILE</div><h2>{selectedStudent.full_name}</h2><p>{selectedStudent.admission_no?`Admission ${selectedStudent.admission_no} · `:''}{selectedStudent.class_name||'Aliyah'}</p></div></div><button className="icon-button" onClick={()=>setSelectedStudentId('')} title="Close student profile"><X size={17}/></button></div><div className="profile-stat-grid"><div><span>Reviews</span><strong>{selectedRecords.length}</strong></div><div><span>Average</span><strong>{selectedAverage===null?'—':`${selectedAverage}/100`}</strong></div><div><span>Best mark</span><strong>{selectedBest===null?'—':`${selectedBest}/100`}</strong></div></div><div className="student-profile-history"><div className="student-profile-history-title"><strong>Assessment history</strong><span>Most recent first</span></div>{selectedRecords.length?selectedRecords.map(a=><div className="profile-result-row" key={a.id}><div className={`profile-result-code ${a.category.toLowerCase()}`}>{a.program_code}</div><div className="profile-result-body"><strong>{a.program_name}{a.team_assessment?' · Team result':''}</strong><span>{fmtDate(a.created_at)} · {a.review_status}</span><div className="meter"><span style={{width:`${Math.max(0,Math.min(100,scoreOf(a)))}%`}}/></div></div><strong className={`profile-result-score ${scoreTone(scoreOf(a))}`}>{scoreOf(a)}<small>/100</small></strong></div>):<p className="profile-empty">No saved assessments for this student yet.</p>}</div></section>}
    <section className="stat-grid compact-stats"><StatCard label="Active profiles" value={students.length} detail="Saved student records" icon={Users} color="blue"/><StatCard label="Students reviewed" value={new Set(assessments.flatMap(a=>a.student_ids??[a.student_id])).size} detail="With at least one result" icon={ClipboardCheck} color="green"/><StatCard label="Average mark" value={assessments.length?`${Math.round(assessments.reduce((s,a)=>s+scoreOf(a),0)/assessments.length)}/100`:'—'} detail="All saved reviews" icon={Gauge} color="purple"/><StatCard label="Reviews saved" value={assessments.length} detail="Across X/O events" icon={BookOpen} color="orange"/></section>
    <section className="panel student-directory"><div className="panel-heading"><div><h2>Student directory</h2><p>Profiles, assessment count and average marks.</p></div><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students…"/></div></div>{filtered.length?<div className="table-wrap"><table><thead><tr><th>Student</th><th>Admission no.</th><th>Class / group</th><th>Reviews</th><th>Average mark</th><th>Latest activity</th><th></th></tr></thead><tbody>{filtered.map(s=>{const records=assessments.filter(a=>(a.student_ids??[a.student_id]).includes(s.id));const avg=records.length?Math.round(records.reduce((n,a)=>n+scoreOf(a),0)/records.length):null;const latest=records.sort((a,b)=>b.created_at.localeCompare(a.created_at))[0];return <tr key={s.id}><td><div className="student-cell"><span className="mini-avatar">{initials(s.full_name)}</span><strong>{s.full_name}</strong></div></td><td className="muted-cell">{s.admission_no||'—'}</td><td>{s.class_name||'Aliyah'}</td><td>{records.length}</td><td>{avg===null?<span className="muted-cell">No marks</span>:<span className={`table-score ${scoreTone(avg)}`}>{avg}<small>/100</small></span>}</td><td className="muted-cell">{latest?fmtDate(latest.created_at):'—'}</td><td><div className="row-actions"><button className="small-link" onClick={()=>setSelectedStudentId(s.id)}>View profile</button><button className="small-link" onClick={()=>onNavigate('review')}>Review work <ArrowRight size={13}/></button></div></td></tr>})}</tbody></table></div>:<EmptyState icon={Users} title={students.length?'No matching students':'No students added'} message={students.length?'Try another name or admission number.':'Add student profiles so every assessment is saved to a consistent record.'} action={students.length?undefined:'Add the first student'} onClick={()=>setShowForm(true)}/>}</section>
  </div>
}

function HistoryPage({assessments,onConfirm}:{assessments:Assessment[];onConfirm:(a:Assessment, score?:number)=>void}) {
  const [query,setQuery]=useState('');const [filter,setFilter]=useState<'all'|'pending'|'confirmed'>('all');const [category,setCategory]=useState<'all'|'X'|'O'>('all')
  const filtered=assessments.filter(a=>`${a.student_name} ${a.program_name} ${a.program_code}`.toLowerCase().includes(query.toLowerCase())).filter(a=>filter==='all'||(filter==='confirmed'?a.review_status==='Confirmed':a.review_status!=='Confirmed')).filter(a=>category==='all'||a.category===category)
  return <div className="page-content"><section className="page-heading"><div><div className="eyebrow">SAVED ASSESSMENTS</div><h1>Review history</h1><p>Every saved score includes its rubric breakdown, evidence flags and reviewer status.</p></div><span className="count-pill">{assessments.length} total reviews</span></section><section className="panel history-panel"><div className="history-toolbar"><div className="search-box wide"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by student, programme or code…"/></div><select value={filter} onChange={e=>setFilter(e.target.value as any)}><option value="all">All statuses</option><option value="pending">Needs confirmation</option><option value="confirmed">Confirmed</option></select><select value={category} onChange={e=>setCategory(e.target.value as any)}><option value="all">X and O</option><option value="X">X category</option><option value="O">O category</option></select></div>{filtered.length?<div className="history-list">{filtered.map(a=><AssessmentHistoryCard key={a.id} a={a} onConfirm={onConfirm}/>)}</div>:<EmptyState icon={ClipboardCheck} title="No saved reviews match" message={assessments.length?'Change the filters or search term.':'Analysed submissions will appear here after you save them.'}/>}</section></div>
}
function AssessmentHistoryCard({a,onConfirm}:{a:Assessment;onConfirm:(a:Assessment, score?:number)=>void}) {
  const [expanded,setExpanded]=useState(false);const [finalScore,setFinalScore]=useState(String(a.final_score ?? a.ai_score));const program=getProgram(a.program_code);const breakdown=a.breakdown??[]
  return <div className="history-card"><button className="history-card-head" onClick={()=>setExpanded(!expanded)}><div className="history-avatar">{initials(a.student_name)}</div><div className="history-main"><strong>{a.student_name}</strong><span><span className={`category-dot ${a.category.toLowerCase()}`}>{a.category}</span> {a.program_code} · {a.program_name} · {fmtDate(a.created_at)}</span></div><div className="history-score"><strong className={scoreTone(scoreOf(a))}>{scoreOf(a)}</strong><span>/100</span></div><span className={`status-label ${a.review_status==='Confirmed'?'confirmed':'pending'}`}>{a.review_status}</span>{expanded?<ChevronDown size={16}/>:<ChevronRight size={16}/>}</button>{expanded&&<div className="history-detail"><p>{a.summary}</p><div className="history-breakdown">{breakdown.map((c,i)=><div key={i}><span>{c.name}</span><strong>{c.score}/{c.max_points}</strong></div>)}</div><div className="history-feedback-grid"><div><strong>Strengths</strong><ul>{(a.strengths||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div><div><strong>Improvements</strong><ul>{(a.improvements||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div></div>{(a.evidence_flags||[]).length>0&&<p className="muted-cell">Evidence notes: {a.evidence_flags.join(' · ')}</p>}<div className="history-detail-bottom"><span className="confidence small-confidence">Confidence: {a.confidence}</span>{a.review_status!=='Confirmed'&&<div className="confirm-score-controls"><label>Final mark<input type="number" min={0} max={100} step={1} value={finalScore} onChange={e=>setFinalScore(e.target.value)} aria-label="Human-confirmed final mark out of 100"/></label><button className="btn primary small-btn" onClick={()=>{const n=Number(finalScore);if(finalScore.trim()!==''&&Number.isInteger(n)&&n>=0&&n<=100)onConfirm(a,n)}}><Check size={14}/> Confirm mark</button></div>}</div></div>}</div>
}

function ProgramsPage({onReview}:{onReview:(code:string)=>void}) {
  const [category,setCategory]=useState<'all'|'X'|'O'>('all');const [search,setSearch]=useState('')
  const filtered=PROGRAMS.filter(p=>(category==='all'||p.category===category)&&`${p.name} ${p.code} ${p.skill} ${p.description}`.toLowerCase().includes(search.toLowerCase()))
  return <div className="page-content"><section className="page-heading"><div><div className="eyebrow">OFFICIAL PROGRAMME CATALOGUE</div><h1>Programme library</h1><p>Aliyah X/O programme requirements extracted from the SIBĀQ ’26 General Concept Note.</p></div><a href="/docs/sibaq-26-concept-note.pdf" target="_blank" rel="noreferrer" className="btn secondary"><BookOpen size={16}/> Read PDF <ArrowRight size={14}/></a></section><div className="programme-library-toolbar"><div className="search-box wide"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a programme…"/></div><div className="segmented">{([{id:'all',label:'All 12'},{id:'X',label:'X · 10'},{id:'O',label:'O · 2'}] as const).map(c=><button key={c.id} onClick={()=>setCategory(c.id)} className={category===c.id?'selected':''}>{c.label}</button>)}</div></div><div className="programme-library-grid">{filtered.map(p=><ProgramLibraryCard key={p.code} program={p} onReview={()=>onReview(p.code)}/>)}</div><div className="source-caveat"><ShieldCheck size={18}/><div><strong>Scoring weights are not stated numerically in the source.</strong><p>The rubrics in this app translate the concept note’s named evaluation areas into transparent 100-point coaching weights. They are editable/app-defined, not official judging weights issued by SIBĀQ.</p></div></div></div>
}
function ProgramLibraryCard({program,onReview}:{program:Program;onReview:()=>void}) { return <section className="panel program-library-card"><div className="program-library-top"><div className={`program-badge ${program.category.toLowerCase()}`}>{program.code}</div><span className={`category-pill ${program.category.toLowerCase()}`}>{program.category}</span></div><h3>{program.name}</h3><div className="programme-meta"><span><Clock3 size={14}/>{program.durationMinutes} min</span><span><GraduationCap size={14}/>{program.skill}</span></div><p>{program.description}</p><div className="rubric-mini-title">Scoring areas</div><div className="program-criteria">{program.criteria.slice(0,4).map(c=><span key={c.name}>{c.name} <b>{c.maxPoints}</b></span>)}{program.criteria.length>4&&<small>+ {program.criteria.length-4} more criteria</small>}</div><div className="program-card-footer"><small>{program.sourcePage}</small><button className="btn secondary small-btn" onClick={onReview}>Review this programme <ArrowRight size={14}/></button></div></section> }

function SettingsPage({configured,authenticated}:{configured:boolean;authenticated:boolean}) {
  const [copied,setCopied]=useState(false)
  const sql=`-- Replace the email with the first reviewer account you created.\nupdate public.profiles set approved = true, role = 'admin' where email = 'YOUR-ADMIN-EMAIL';\n\n-- Run this after each additional reviewer's profile exists.\nupdate public.profiles set approved = true, role = 'reviewer' where email = 'REVIEWER-EMAIL';`
  return <div className="page-content"><section className="page-heading"><div><div className="eyebrow">WORKSPACE CONFIGURATION</div><h1>Settings</h1><p>Configure the database and AI provider before evaluating real student submissions.</p></div><span className={`mode-pill ${configured&&authenticated?'connected':'preview'}`}><span className="status-dot"/>{configured&&authenticated?'Connected':'Setup required'}</span></section><div className="setup-grid"><section className="panel setup-panel"><div className="setup-step"><span>01</span><div><h2>Supabase database</h2><p>Student profiles, review records, confirmed scores and private evidence files are stored in Supabase.</p></div></div><div className="setup-status-row"><span className={`setup-check ${configured?'complete':''}`}>{configured?<Check size={14}/>:<span>1</span>}</span><div><strong>{configured?'Supabase variables detected':'Create a Supabase project'}</strong><small>{configured?'The frontend found VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.':'Add the project URL and publishable/anon key to .env.local.'}</small></div></div><div className="setup-status-row"><span className={`setup-check ${configured?'complete':''}`}>{configured?<Check size={14}/>:<span>2</span>}</span><div><strong>Apply the SQL migration</strong><small>Run supabase/migrations/001_init.sql in the Supabase SQL editor. It enables row-level security and creates a private evidence bucket.</small></div></div><div className="setup-status-row"><span className={`setup-check ${authenticated?'complete':''}`}>{authenticated?<Check size={14}/>:<span>3</span>}</span><div><strong>{authenticated?'Reviewer signed in':'Create a reviewer account'}</strong><small>Create the first account, confirm its email, then approve it in Supabase SQL Editor using the SQL shown below. Approve each additional reviewer before disabling public sign-ups.</small></div></div><a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="btn primary full">Open Supabase dashboard <ArrowRight size={15}/></a></section><section className="panel setup-panel"><div className="setup-step"><span>02</span><div><h2>Gemini evaluation</h2><p>AI keys are kept server-side in a Supabase Edge Function, never in browser code.</p></div></div><div className="setup-status-row"><span className="setup-check"><span>1</span></span><div><strong>Set the Edge Function secrets</strong><small>In Supabase → Edge Functions → Secrets, add GEMINI_API_KEY and GEMINI_MODEL=gemini-3.8-flash (or another currently supported multimodal model).</small></div></div><div className="setup-status-row"><span className="setup-check"><span>2</span></span><div><strong>Deploy evaluate-submission</strong><small>Deploy supabase/functions/evaluate-submission/index.ts. The function sends evidence and the canonical programme rubric to Gemini and expects structured JSON.</small></div></div><div className="setup-status-row"><span className="setup-check"><span>3</span></span><div><strong>Test with a non-sensitive sample</strong><small>Check scan readability, rubric totals, evidence flags, and saved score history before reviewing actual students.</small></div></div><a href="https://ai.google.dev/gemini-api/docs/models" target="_blank" rel="noreferrer" className="btn secondary full">Check supported Gemini models <ArrowRight size={15}/></a></section></div><section className="panel security-panel"><div className="security-heading"><div className="security-badge"><ShieldCheck size={18}/></div><div><h2>Privacy and scoring safeguards</h2><p>Important before storing student records.</p></div></div><div className="safeguard-grid"><div><strong>Private evidence bucket</strong><p>Uploaded work is stored under a private Supabase Storage bucket. Use authenticated, expiring access rather than public links.</p></div><div><strong>No API key in the frontend</strong><p>Only the Supabase publishable key belongs in Vite configuration. GEMINI_API_KEY and any service-role secret stay in Edge Function secrets.</p></div><div><strong>Human review is mandatory</strong><p>All generated scores begin as AI suggestions. The reviewer confirms them after checking the work and any evidence warnings.</p></div><div><strong>Keep data access limited</strong><p>Use only approved reviewer accounts. Avoid student personal data beyond what the assessment record needs.</p></div></div><div className="sql-hint"><code>{sql}</code><button className="icon-button" onClick={()=>{void navigator.clipboard?.writeText(sql);setCopied(true);setTimeout(()=>setCopied(false),1600)}} title="Copy setup note">{copied?<Check size={15}/>:<Download size={15}/>}</button></div></section></div>
}
