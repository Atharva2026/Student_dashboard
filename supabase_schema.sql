-- Supabase schema for Student Dashboard App

-- 1. Students Table
create table students (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  middle_name text,
  last_name text not null,
  email text not null unique,
  roll_number text not null,
  prn_number text not null unique,
  date_of_birth date not null,
  branch text not null,
  division text not null,
  gender text not null,
  address text not null,
  sgpa_sem1 text,
  sgpa_sem2 text,
  profile_photo text,
  registration_date timestamp with time zone default now(),
  is_paid boolean default false,
  mentor text
);

-- 2. Sessions Table
create table sessions (
  id text primary key, -- e.g. 'DYS1'
  name text not null,
  description text,
  date date not null,
  time text not null,
  venue text not null,
  status text not null check (status in ('upcoming', 'active', 'completed')),
  type text not null check (type in ('Assessment', 'Test', 'Quiz', 'Workshop')),
  duration text not null,
  test_link text
);

-- 3. Tests Table
create table tests (
  id uuid primary key default gen_random_uuid(),
  session_id text references sessions(id) on delete cascade,
  title text not null,
  created_at timestamp with time zone default now()
);

-- 4. Questions Table
create table questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references tests(id) on delete cascade,
  question text not null,
  options jsonb not null, -- array of strings
  correct_answer integer not null
);

-- 5. Attendance Table
create table attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  session_id text references sessions(id) on delete cascade,
  status text not null check (status in ('present', 'absent', 'not-attempted')),
  unique (student_id, session_id)
);

-- 6. Test Scores Table
create table test_scores (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  session_id text references sessions(id) on delete cascade,
  score integer not null,
  answers jsonb not null, -- array of integers (selected options)
  unique (student_id, session_id)
);

-- 7. Admins Table (optional)
create table admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null
); 