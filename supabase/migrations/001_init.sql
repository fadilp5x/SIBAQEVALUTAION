-- SIBĀQ Review Studio - first migration
-- Run this in the Supabase SQL editor for a new project.
-- RLS restricts student records to authenticated reviewers. Disable public sign-ups after
-- the approved reviewer accounts have been created in Supabase Auth.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'reviewer' check (role in ('admin', 'reviewer')),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  admission_no text,
  class_name text not null default 'Aliyah',
  active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists students_admission_no_unique
  on public.students (admission_no) where admission_no is not null and admission_no <> '';
create index if not exists students_name_index on public.students (full_name);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  student_ids uuid[] not null default '{}',
  student_name text not null,
  program_code text not null check (program_code in ('AX37','AX38','AX39','AX40','AX41','AX42','AX43','AX44','AX45','AX46','AO47','AO48')),
  program_name text not null,
  category text not null check (category in ('X','O')),
  topic text,
  ai_score integer not null check (ai_score between 0 and 100),
  final_score integer check (final_score between 0 and 100),
  confidence text not null default 'low' check (confidence in ('high','medium','low')),
  summary text not null default '',
  breakdown jsonb not null default '[]'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  improvements jsonb not null default '[]'::jsonb,
  evidence_flags jsonb not null default '[]'::jsonb,
  needs_more_evidence boolean not null default false,
  evidence_paths text[] not null default '{}',
  reviewer_notes text,
  review_status text not null default 'AI suggested' check (review_status in ('AI suggested','Confirmed')),
  team_assessment boolean not null default false,
  created_by uuid not null references auth.users(id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists assessments_created_at_index on public.assessments (created_at desc);
create index if not exists assessments_program_index on public.assessments (program_code, created_at desc);
create index if not exists assessments_student_index on public.assessments (student_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at before update on public.students for each row execute procedure public.set_updated_at();
drop trigger if exists assessments_set_updated_at on public.assessments;
create trigger assessments_set_updated_at before update on public.assessments for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.assessments enable row level security;

drop policy if exists "Reviewer can read own profile" on public.profiles;
create policy "Reviewer can read own profile" on public.profiles for select to authenticated using (id = auth.uid());
-- Profile approval and role are changed by an administrator in the SQL editor, not by the user.

create or replace function public.is_approved_reviewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and approved = true);
$$;
revoke all on function public.is_approved_reviewer() from public;
grant execute on function public.is_approved_reviewer() to authenticated;

drop policy if exists "Authenticated reviewers can read students" on public.students;
create policy "Authenticated reviewers can read students" on public.students for select to authenticated using (public.is_approved_reviewer());
drop policy if exists "Authenticated reviewers can add students" on public.students;
create policy "Authenticated reviewers can add students" on public.students for insert to authenticated with check (created_by = auth.uid() and public.is_approved_reviewer());
drop policy if exists "Authenticated reviewers can update students" on public.students;
create policy "Authenticated reviewers can update students" on public.students for update to authenticated using (public.is_approved_reviewer()) with check (public.is_approved_reviewer());
drop policy if exists "Authenticated reviewers can archive students" on public.students;
create policy "Authenticated reviewers can archive students" on public.students for delete to authenticated using (public.is_approved_reviewer());

drop policy if exists "Authenticated reviewers can read assessments" on public.assessments;
create policy "Authenticated reviewers can read assessments" on public.assessments for select to authenticated using (public.is_approved_reviewer());
drop policy if exists "Authenticated reviewers can add assessments" on public.assessments;
create policy "Authenticated reviewers can add assessments" on public.assessments for insert to authenticated with check (created_by = auth.uid() and public.is_approved_reviewer());
drop policy if exists "Authenticated reviewers can confirm assessments" on public.assessments;
create policy "Authenticated reviewers can confirm assessments" on public.assessments for update to authenticated using (public.is_approved_reviewer()) with check (public.is_approved_reviewer());

-- Private bucket for uploaded student work.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-evidence', 'review-evidence', false, 10485760,
  array['image/jpeg','image/png','image/webp','application/pdf','text/plain','text/markdown','application/json','text/javascript','application/javascript','text/html','text/css','video/mp4','video/quicktime']
)
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Reviewers can view private evidence" on storage.objects;
create policy "Reviewers can view private evidence" on storage.objects for select to authenticated using (bucket_id = 'review-evidence' and public.is_approved_reviewer());
drop policy if exists "Reviewers can upload own evidence folder" on storage.objects;
create policy "Reviewers can upload own evidence folder" on storage.objects for insert to authenticated with check (bucket_id = 'review-evidence' and (storage.foldername(name))[1] = auth.uid()::text and public.is_approved_reviewer());
drop policy if exists "Reviewers can update own evidence folder" on storage.objects;
create policy "Reviewers can update own evidence folder" on storage.objects for update to authenticated using (bucket_id = 'review-evidence' and (storage.foldername(name))[1] = auth.uid()::text and public.is_approved_reviewer()) with check (bucket_id = 'review-evidence' and (storage.foldername(name))[1] = auth.uid()::text and public.is_approved_reviewer());
drop policy if exists "Reviewers can delete own evidence folder" on storage.objects;
create policy "Reviewers can delete own evidence folder" on storage.objects for delete to authenticated using (bucket_id = 'review-evidence' and (storage.foldername(name))[1] = auth.uid()::text and public.is_approved_reviewer());
