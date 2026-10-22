-- Campusly MVP starter schema. Review and harden policies before production.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  name text not null,
  slug text not null,
  unique(university_id, slug)
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  degree_type text
);

create table public.program_versions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  regulation_year integer not null,
  unique(program_id, regulation_year)
);

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  program_version_id uuid not null references public.program_versions(id) on delete cascade,
  semester_number integer not null check (semester_number between 1 and 16),
  unique(program_version_id, semester_number)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text,
  title text not null,
  description text
);

create table public.course_offerings (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.semesters(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  academic_year text not null,
  status text not null default 'active' check (status in ('active','archived')),
  unique(semester_id, subject_id, academic_year)
);

create table public.syllabus_units (
  id uuid primary key default gen_random_uuid(),
  course_offering_id uuid not null references public.course_offerings(id) on delete cascade,
  title text not null,
  position integer not null default 1,
  unique(course_offering_id, position)
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  syllabus_unit_id uuid not null references public.syllabus_units(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 1,
  unique(syllabus_unit_id, position)
);

create table public.university_memberships (
  user_id uuid not null references public.profiles(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  role text not null check (role in ('student','faculty','university_admin')),
  status text not null default 'active' check (status in ('active','suspended')),
  primary key(user_id, university_id)
);

create table public.course_enrollments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_offering_id uuid not null references public.course_offerings(id) on delete cascade,
  primary key(user_id, course_offering_id)
);

create table public.faculty_assignments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_offering_id uuid not null references public.course_offerings(id) on delete cascade,
  primary key(user_id, course_offering_id)
);

create table public.platform_admins (
  user_id uuid primary key references public.profiles(id) on delete cascade
);

create table public.lectures (
  id uuid primary key default gen_random_uuid(),
  course_offering_id uuid not null references public.course_offerings(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete restrict,
  title text not null,
  lecture_date date,
  notes text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete restrict,
  uploader_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  description text,
  resource_type text not null check (resource_type in ('pdf','ppt','document','link')),
  external_url text,
  storage_path text,
  visibility text not null default 'public' check (visibility in ('public','restricted')),
  review_status text not null default 'pending' check (review_status in ('pending','published','rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((resource_type = 'link' and external_url is not null and storage_path is null)
      or (resource_type <> 'link' and storage_path is not null and external_url is null))
);

create table public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, resource_id)
);

create table public.topic_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  updated_at timestamptz not null default now(),
  primary key(user_id, topic_id)
);

create table public.resource_reports (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz not null default now(),
  unique(resource_id, reporter_id)
);

create index idx_departments_university on public.departments(university_id);
create index idx_programs_department on public.programs(department_id);
create index idx_offerings_semester on public.course_offerings(semester_id);
create index idx_units_offering_position on public.syllabus_units(course_offering_id, position);
create index idx_topics_unit_position on public.topics(syllabus_unit_id, position);
create index idx_resources_topic_review on public.resources(topic_id, review_status, visibility);
create index idx_resources_uploader on public.resources(uploader_id);

-- Enable RLS on every application table.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','universities','departments','programs','program_versions',
    'semesters','subjects','course_offerings','syllabus_units','topics',
    'university_memberships','course_enrollments','faculty_assignments',
    'platform_admins','lectures','resources','bookmarks','topic_progress','resource_reports'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Minimal read-only catalogue policies. Catalogue writes are intentionally
-- left to trusted operators until an admin workflow is implemented.
create policy "active universities are public" on public.universities
  for select to anon, authenticated using (status = 'active');
create policy "departments of active universities are public" on public.departments
  for select to anon, authenticated using (exists (
    select 1 from public.universities u where u.id = university_id and u.status = 'active'
  ));
create policy "programmes are public" on public.programs
  for select to anon, authenticated using (true);
create policy "program versions are public" on public.program_versions
  for select to anon, authenticated using (true);
create policy "semesters are public" on public.semesters
  for select to anon, authenticated using (true);
create policy "subjects are public" on public.subjects
  for select to anon, authenticated using (true);
create policy "active offerings are public" on public.course_offerings
  for select to anon, authenticated using (status = 'active');
create policy "units are public" on public.syllabus_units
  for select to anon, authenticated using (true);
create policy "topics are public" on public.topics
  for select to anon, authenticated using (true);

-- Resource reads: published public resources, or uploader's own submissions.
create policy "published public resources are readable" on public.resources
  for select to anon, authenticated using (
    review_status = 'published' and visibility = 'public'
  );
create policy "uploaders can read own resources" on public.resources
  for select to authenticated using (uploader_id = (select auth.uid()));

-- User-owned records.
create policy "profile owner reads profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profile owner updates profile" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
create policy "membership owner reads membership" on public.university_memberships
  for select to authenticated using (user_id = (select auth.uid()));
create policy "enrollment owner reads enrollment" on public.course_enrollments
  for select to authenticated using (user_id = (select auth.uid()));
create policy "faculty owner reads assignment" on public.faculty_assignments
  for select to authenticated using (user_id = (select auth.uid()));
create policy "bookmark owner access" on public.bookmarks
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "progress owner access" on public.topic_progress
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "reporter creates report" on public.resource_reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "reporter reads report" on public.resource_reports
  for select to authenticated using (reporter_id = (select auth.uid()));

-- No client write policies are created for memberships, assignments,
-- platform admins, catalogue, lectures, or resource moderation yet.
-- Add narrow server-side actions/RPCs and policies before connecting those features.

grant select on public.universities, public.departments, public.programs,
  public.program_versions, public.semesters, public.subjects,
  public.course_offerings, public.syllabus_units, public.topics,
  public.resources to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.university_memberships, public.course_enrollments,
  public.faculty_assignments to authenticated;
grant select, insert, delete on public.bookmarks to authenticated;
grant select, insert, update, delete on public.topic_progress to authenticated;
grant select, insert on public.resource_reports to authenticated;
