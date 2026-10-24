# SIBĀQ Review Studio — Aliyah X/O Programme Reviewer

A React + TypeScript starter for reviewing work for the 12 Aliyah X/O category programmes from the Darul Huda SIBĀQ'26 General Concept Note. It includes the source PDF, source-linked programme descriptions, provisional 100-point rubrics, responsive dashboard UI, student profiles, review history, a Supabase migration and a Gemini multimodal Edge Function.

## Important scoring note

The concept note specifies programme expectations and judging areas but does not generally provide numerical weights. The rubrics in `src/lib/programs.ts` translate those areas into a **provisional coaching rubric**, not official SIBĀQ mark allocations. Every result should be human-checked and confirmed. The app preserves the original AI score separately from a confirmed score.

## Local preview

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Without `.env.local`, the app opens in local preview mode. Student profiles are stored in that browser's local storage. This mode deliberately disables real AI scoring and database saving; do not use it to create real marks.

## Configure Supabase

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and set:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

   The publishable/anon key is intended for the browser when row-level security is enabled. **Never add the Gemini API key or a service-role key to a `VITE_` variable.**

3. Run `supabase/migrations/001_init.sql` in the Supabase SQL Editor.
4. Create your first reviewer account in the app, then confirm its email. In the Supabase SQL Editor, approve that account as the admin (replace the email):

   ```sql
   update public.profiles set approved = true, role = 'admin' where email = 'YOUR-ADMIN-EMAIL';
   ```

   Sign in again and use the approval screen's **Check access again** control. To approve each additional reviewer after their account exists and email is confirmed, run:

   ```sql
   update public.profiles set approved = true, role = 'reviewer' where email = 'REVIEWER-EMAIL';
   ```

   Reviewer access is intentionally approval-gated. Once the needed accounts are approved, disable public sign-ups in Supabase Auth settings.
5. Install/use the Supabase CLI, then add the Gemini key and model to the Edge Function secrets:

   ```bash
   supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY GEMINI_MODEL=gemini-3.8-flash
   ```

   Select a currently supported multimodal Gemini model available to your API project. The model name is configurable; model access can vary by account and may change over time.

6. Deploy the evaluation function:

   ```bash
   supabase functions deploy evaluate-submission
   ```

7. Ensure JWT verification remains enabled for `evaluate-submission`. Sign in to the app, create a test student, upload a non-sensitive sample, include the exact task prompt and try a review. Check the Edge Function logs and stored record before using real student work.

## What is persisted

When connected, the app stores student profiles, each review's AI score, per-criterion marks, feedback, source/evidence warnings, optional confirmed score, status and private evidence paths in Supabase Postgres and the private `review-evidence` bucket. Team event AX44 can link multiple participants and is labelled as a team result.

## Evidence guidance

- Paper-based language tasks: upload the prompt/source text and all answer pages in correct order.
- Civic Quest: upload the question sheet and accepted answer key whenever possible; otherwise the score must be low-confidence/provisional if facts cannot be verified.
- Branding/carousel/UI: upload the task brief and all necessary screens/mockups. Seven carousel slides must be present.
- Code Craft: upload the task statement, actual `.js` file and output/test evidence.
- Video Editing: upload the actual short video. Still frames cannot prove timing, motion or sound quality.
- Live Calligraphy/Product Photography: use full-resolution, straight-on images without glare or cropped edges.

## Source and files

- `public/docs/sibaq-26-concept-note.pdf`: uploaded official concept note copy.
- `src/lib/programs.ts`: extracted Aliyah X/O programme data and the 12 programme-specific coaching rubrics.
- `supabase/functions/_shared/programs.ts`: canonical copy of the programme catalogue used by the AI endpoint.
- `supabase/functions/evaluate-submission/index.ts`: server-side Gemini scoring endpoint.
- `supabase/migrations/001_init.sql`: database, RLS and private Storage bucket setup.
- `MASTER_VIBE_CODE_PROMPT.md`: comprehensive prompt for using an AI coding tool to extend or recreate the app.

## Current implementation status

The source tree and configuration are prepared, but this container did not complete `npm install`, so I could not run a production build here. Supabase and Gemini are not connected or deployed from this session. A working deployed service requires your own credentials, migration execution, Edge Function deployment and a real test. Keep all keys private.
