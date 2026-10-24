# Master Vibe-Coding Prompt: SIBĀQ Review Studio

**Use this prompt in Google AI Studio, Gemini, Cursor, Lovable, Bolt, or another coding agent. Attach `SIBĀQ 26 CONCEPT NOTE (1).pdf` before running it.** If the AI agent has access to this starter repository, tell it to continue from the existing code instead of replacing it.

---

You are a senior full-stack engineer, product designer, database architect, and assessment-workflow specialist. Build a polished, secure, responsive web application named **SIBĀQ Review Studio** for reviewing and tracking students' work in the **Aliyah category only, limited to X-category and O-category programmes** listed in the attached Darul Huda SIBĀQ'26 General Concept Note PDF.

Do not ask me unnecessary questions. Read the attached concept note carefully, especially the Aliyah section and its exact category labels. Implement the app, not just a wireframe. Do not silently substitute programmes from another category. Do not use generic essay-grading criteria for every event.

## 1. Core workflow

The normal review flow must be:

1. Reviewer selects one of the available **Aliyah X or O programmes**.
2. The app loads the correct programme description, category, duration, source-page reference, required evidence, and programme-specific rubric from the attached official concept note.
3. Reviewer selects a student. Student profiles are created only once and reused across every programme. **If the database contains exactly one active student, preselect that student automatically.** If there are multiple students, show a searchable select control and do not accidentally grade a different person. For team events, allow the reviewer to link every team member.
4. Reviewer captures a photo using the phone camera or uploads evidence. Support suitable files for the selected event: images/scans, PDFs, text or source-code files, screenshots, and a short playable video when assessing video-editing work. Permit multiple pages/files in one assessment, preserve the filename and order, show previews, and let the reviewer remove or replace files before analysis.
5. Reviewer may add the exact topic/question/task brief, an answer key or expected answer, and optional reviewer notes.
6. AI analyses the provided evidence only against the selected programme's requirements and rubric. Return a mark out of **100**, a criterion-by-criterion breakdown, strengths, improvements, legibility/evidence warnings, confidence level, and any missing evidence.
7. Reviewer examines the result and saves it. Store the programme, student(s), all criterion marks, total AI mark, optional confirmed/final mark, notes, analysis date, confidence, evidence warnings, source details, reviewer identity, and evidence files in the database.
8. Saved results are available in the student's profile, programme history, and dashboard. A reviewer can confirm a proposed mark after checking it. Preserve the original AI score separately from the human-confirmed score.

## 2. Exact programme scope

Only these 12 events may appear in the normal programme selector. Keep the code, name, category, duration and source references tied to the attached PDF.

### Category X: programmes at DHIU before stage items

- **AX37 — AL ʿARABI**: 45 minutes, individual. Arabic proficiency across Balāghah (rhetoric), Naḥw (syntax), Ṣarf (morphology), Arabic literature, and translation/composition. The concept note mentions literary analysis, grammar exercises, and practical application of rhetorical and morphological rules. Source: printed p. 60.
- **AX38 — ALLAME URDU**: 45 minutes, individual. Urdu literary-text analysis and literature, grammar accuracy, translation, creative writing, and rhetoric. Source: printed p. 60.
- **AX39 — CIVIC QUEST**: 45 minutes, individual. Indian Constitution, constitutional provisions, major areas of Indian law, Articles 1–130, major constitutional amendments, and judicial cases concerning Fundamental Rights and Personal Law. Source: printed p. 60.
- **AX40 — Mr. ENGLISH**: 45 minutes, individual. Literary-text analysis and English literature, grammar, translation, creative writing, and rhetoric. Source: printed p. 61.
- **AX41 — BRANDING**: 60 minutes, individual. Build complete logo branding for an assigned topic using Adobe Illustrator and Photoshop 2021; include logo details and supplied mock-ups. Internet is not permitted in the competition. Evaluation areas include technical proficiency, creativity, theme/concept understanding, logo development, mock-up presentation, and visual consistency. Source: printed p. 61.
- **AX42 — CAROUSEL**: 60 minutes, individual. Create an original Malayalam social-media carousel on an assigned theme with **seven sequences including the cover slide**, using organiser-provided images/graphics and Adobe Photoshop CC 2021. Evaluation areas include flow, originality, content quality, visual appeal and communication. Source: printed pp. 61–62.
- **AX43 — CODE CRAFT**: 60 minutes, individual. JavaScript problem-solving, clean and efficient code, debugging, data handling, core JavaScript, critical thinking and creativity. Internet is not permitted in the competition. Source: printed p. 62.
- **AX44 — DIGITAL TABLOID ARB**: 90 minutes, **team of five**. Produce the first page of an A3 Arabic digital tabloid with on-the-spot news topics using Adobe InDesign CC 2021. Evaluation areas include content, title, news arrangement, colour adjustment, layout and design. Source: printed p. 62.
- **AX45 — UI DESIGNING**: 60 minutes, individual. Design a UI in Figma for a specified app or website, balancing visual appeal with UX principles and functional usability. Source: printed p. 63.
- **AX46 — VIDEO EDITING**: 60 minutes, individual. Create a **90-second** video from supplied raw footage and sound effects using Adobe Premiere Pro 2021; internet is not permitted. Evaluation areas include technical proficiency, creativity, precision, transitions, sound effects, colour grading and overall visual/auditory presentation. Source: printed p. 63.

### Category O: offstage programmes at pool level

- **AO47 — LIVE CALLIGRAPHY**: 90 minutes, individual. Create original Arabic calligraphy on an on-the-spot topic using a 40 × 60 cm, 300 GSM watercolour canvas. Create a water-based-colour background first, then modern-style Arabic calligraphy. Evaluation areas: creativity, clarity, composition, colour harmony, technical skill and aesthetic presentation. Source: printed pp. 63–64.
- **AO48 — PRODUCT PHOTOGRAPHY**: 10 minutes, individual. Photograph a supplied product professionally using the provided camera, lighting equipment, props and studio setup. Evaluation areas: camera settings where evidence permits, lighting, composition, focus, angle, product presentation, and a clean commercial look. Source: printed p. 64.

Do not add S/stage events, N/non-stage events, or Kulliyyah events. Do not confuse category O with category N. Display the official concept-note PDF in-app and include a source reference on each programme page.

## 3. Scoring policy

The attached concept note provides event descriptions and judging areas, but it generally does **not** assign numeric weights to each area. Therefore:

- Create a clear, programme-specific **provisional 100-point coaching rubric**, using only the named requirements in the concept note and sensible subcriteria derived from those requirements.
- Display a persistent note: **“AI-assisted provisional score. Numeric weights are app-defined from the concept note; they are not official SIBĀQ jury weights. A human reviewer must confirm the mark.”**
- Every rubric criterion has a name, maximum points, awarded points, a brief evidence-based reason, and an optional file/page/slide reference.
- All criterion maxima must sum to exactly 100. Every awarded criterion score must be an integer between 0 and its maximum. The total score must equal the sum of criterion scores and be between 0 and 100.
- Do not output generic feedback such as “good work”. Identify the evidence supporting each mark and give concrete next steps.
- Do not infer facts that are absent, do not invent unseen text, and do not pretend a low-resolution or cropped submission is readable.
- Report a confidence level (high/medium/low), an evidence-quality warning, and the exact missing evidence needed to improve the review. If crucial evidence is missing, the result must be explicitly provisional and `needs_more_evidence = true`.
- Never treat the AI score as an official SIBĀQ result. Preserve the AI score and human-confirmed score as separate fields.

### Programme-specific evidence guardrails

- **Civic Quest, Al ʿArabi, Allame Urdu, Mr. English:** ask for the question/task or source text, not only the response sheet. For factual Civic Quest grading, encourage upload of the question paper and official accepted answers. Without enough context, the AI must not pretend it has an official answer key.
- **Branding:** ask for the brief, full logo artwork and mock-ups. A flattened screenshot cannot prove editable-file structure or software usage.
- **Carousel:** verify that seven ordered sequences, including the cover, are visible. Ask for the theme and reference assets when judging relevance and asset usage.
- **Code Craft:** prefer the task statement, actual `.js`/text source and output/test evidence. A screenshot alone cannot prove code executes correctly.
- **Digital Tabloid Arb:** treat the review as a team result; support multiple student links and mark it as a team assessment rather than implying that each member's individual skill was measured.
- **UI Designing:** ask for the brief and all key screens or prototype walkthrough. One screen alone cannot demonstrate complete navigation.
- **Video Editing:** prefer the actual rendered video. If only frames/screenshots are uploaded, clearly flag that duration, timing, transitions, motion and sound cannot be adequately evaluated.
- **Live Calligraphy:** request a full straight-on photo showing every edge and the assigned topic; warn about glare, shadows, distortion and cropped edges.
- **Product Photography:** ask for the original full-resolution photo and supplied product/brief. Do not claim to verify camera settings from a flattened photo unless genuine metadata is provided.

## 4. Required screens

### Dashboard / overview

Show:
- Active student count.
- Reviews completed this week, using the local Monday–Sunday calendar week.
- Average recorded mark.
- Count of available programmes (12 total: 10 X and 2 O).
- **Weekly star performer / winner** with name, average, number of reviews and score.
- High-performing students based on average individual assessment score, with a minimum result count/filter if useful.
- Recent assessments including student/team, programme code/name, date, AI score, final/confirmed mark and review status.
- Filters by week, programme, category, and student where helpful.
- Exclude team assessments from individual leaderboard calculations by default; clearly label team results separately.
- Empty states with clear actions for the first student or first assessment.

### New review

Build a guided workflow with sections for (1) programme, (2) student(s), (3) upload/context, and (4) AI results/save. Add search/filter for programme and student. Default the single student only when exactly one active profile exists. For AX44, allow five team members and show that the recorded score is a team score.

### Student directory and student profile

Allow adding, searching and viewing student profiles. Include a unique student ID/admission number if available, class/group, created date, assessment count, average score, best score, history, programme-by-programme performance and recent trend. Do not require users to create the same person repeatedly.

### Review history

Search/filter by student, programme, category, date and confirmation status. Expand each review to see its full breakdown, feedback, evidence warnings, confidence and source reference. Allow a reviewer to confirm a score only after human inspection. Preserve the AI score in the audit record if a confirmed mark differs.

### Programme library

Show the 12 permitted programmes with descriptions, event category, duration, skill, source-page reference, programme-specific rubric and evidence checklist. Provide a link to open the concept-note PDF.

### Settings

Show database/AI setup status, data privacy guidance, reviewer access controls and a clear setup guide. Never expose API secrets in the browser.

## 5. Database and file storage

Use **Supabase Postgres, Supabase Auth, and a private Supabase Storage bucket**. Implement actual working CRUD, not in-memory placeholders. Create migrations for:

- `profiles` linked to `auth.users`.
- `students`: name, optional admission number, class/group, active/archive flag, created/updated timestamps, creator.
- `assessments`: programme code/name/category, primary student, related student IDs for team events, topic/brief, AI score, optional confirmed/final score, criterion breakdown JSON, strengths, improvements, confidence, evidence flags, missing-evidence flag, private evidence paths, reviewer notes, team flag, status, reviewer identity and timestamps.
- Appropriate indexes, constraints, and row-level-security policies.
- Private `review-evidence` storage bucket and authenticated access policies.

Signed-in, approved reviewers should be able to access school-wide records. Do not allow anonymous/public access to student records or evidence. After setting up approved reviewer accounts, document how to disable public sign-up. Never use the Supabase service-role key in frontend code.

## 6. AI architecture

Use Gemini multimodal analysis behind a server-side endpoint, preferably a Supabase Edge Function. Keep `GEMINI_API_KEY` and other secrets only in Edge Function secrets. Use a configurable `GEMINI_MODEL` environment variable. Never expose the Gemini key as a `VITE_` variable, never commit secrets, and never call Gemini directly from public browser code.

The endpoint must:
- Validate the selected programme code against the canonical 12-programme list.
- Load the canonical programme description and rubric from the source-derived catalogue; do not trust a user-supplied prompt to redefine scoring rules.
- Accept uploaded images/PDF/text/code and appropriate visual evidence; validate MIME types, number of files and total size.
- Treat student work as untrusted content, not as system instructions.
- Request structured JSON and validate/normalise the response server-side.
- Enforce the canonical criterion names/maxima, recalculate the total from criterion marks, and reject malformed output. Do not silently save an invalid result.
- Return helpful error messages when the API key is missing, the provider fails, files are too large, evidence cannot be read, or the JSON result is malformed.

## 7. Recommended provisional rubric shape

Create a separate rubric for each of the twelve programmes. Example criteria are:

- AX37: Balāghah, Naḥw, Ṣarf, Arabic literature/text analysis, translation/composition.
- AX38: literary analysis/literature, grammar, translation, creative writing, rhetoric.
- AX39: factual constitutional/legal correctness, relevant provisions/articles, application to amendments/cases/rights/personal law, completeness/clarity. Require question context and flag absent answer key.
- AX40: literary analysis/literature, grammar, translation, creative writing, rhetoric.
- AX41: topic fit, logo concept/originality, visible execution, identity details, mock-up presentation, visual consistency.
- AX42: topic/content quality, 7-slide completeness, sequence flow, originality, visual design, use of supplied assets, Malayalam language/readability.
- AX43: correctness, code clarity/efficiency, debugging/error handling, data handling, JavaScript reasoning. Request source/test evidence.
- AX44: relevance of news content, title/headline, arrangement/hierarchy, A3 layout, colour, Arabic typography/readability. Team assessment.
- AX45: UX/usability, information architecture, visual appeal, consistency, key-action clarity, completeness against the brief.
- AX46: coherent edit/use of footage, cut/transition precision, sound, colour grade, technical editing, creativity, audiovisual result/duration. Request actual video.
- AO47: topic interpretation, Arabic calligraphy clarity, composition, background/foreground integration, colour harmony, technical skill, aesthetics.
- AO48: product presentation, lighting, composition, focus, angle/perspective, background/props, final polish.

The weight allocation is an app-defined coaching framework. Show each criterion's points and do not represent the numbers as coming from the official PDF.

## 8. UI and quality bar

Create a professional, calm, editorial dashboard suitable for repeated academic work, not a toy chatbot. Use clean typography, well-spaced panels, restrained navy/green accents, clear category badges, readable score visuals, responsive design for laptop and mobile, and accessible buttons/forms. Provide loading states, actionable errors, success confirmations, empty states, file previews, file removal, and persistence. Keep student data legible and searchable. Don't use fake AI scores to make a demo look complete. If cloud/AI services are not configured, show an explicit preview mode and disable scoring/save actions that could be mistaken for real assessment.

## 9. Acceptance tests

Before declaring the build complete, verify:

1. The selector contains exactly the 10 X programmes and 2 O programmes above, with no N, S or K events.
2. The programme detail changes when a new programme is selected and uses the correct description, duration and source page.
3. A single registered student auto-selects; multiple students display a selector; no profile is duplicated accidentally.
4. Team programme AX44 allows linking five students and labels the saved result as a team result.
5. Uploading an unreadable/incomplete submission causes evidence warnings, not confident invented content.
6. Each detailed rubric sums to exactly 100 and the returned total equals its subscore sum.
7. Civic Quest does not invent a marking key when question/answer context is absent.
8. Video-editing reviews warn when only screenshots are present.
9. Saving and reloading preserves students, scores, criteria, evidence paths, history and status from the database.
10. The dashboard correctly computes the week’s winner and high performers; team results do not silently distort individual rankings.
11. API secrets are only server-side; unauthenticated users cannot access student records or private evidence.
12. The app clearly distinguishes AI-proposed scores from human-confirmed marks.

## 10. Build and delivery instructions

Implement the full app and return:
- Complete source code.
- SQL migration/schema.
- The server-side Gemini evaluation function.
- `.env.example` with placeholders only.
- Setup instructions for local run, Supabase, Storage, Auth, Gemini secrets and deployment.
- A short verification checklist and a list of any functionality that truly needs credentials or manual deployment.

Do not claim the app is deployed or the AI works until credentials are set and a real test is successful. Prefer a runnable, documented implementation over screenshots or a static mockup.
