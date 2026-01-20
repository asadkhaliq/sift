-- Sift Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Todos table
create table public.todos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  pane text not null check (pane in ('today', 'work', 'personal', 'waiting')),
  position integer not null default 0,
  waiting_for text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- User context table (for AI personalization)
create table public.user_context (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  content text default '' not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index todos_user_id_idx on public.todos(user_id);
create index todos_pane_idx on public.todos(user_id, pane);
create index user_context_user_id_idx on public.user_context(user_id);

-- Row Level Security (RLS)
alter table public.todos enable row level security;
alter table public.user_context enable row level security;

-- Todos policies: users can only access their own todos
create policy "Users can view their own todos"
  on public.todos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own todos"
  on public.todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own todos"
  on public.todos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own todos"
  on public.todos for delete
  using (auth.uid() = user_id);

-- User context policies: users can only access their own context
create policy "Users can view their own context"
  on public.user_context for select
  using (auth.uid() = user_id);

create policy "Users can insert their own context"
  on public.user_context for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own context"
  on public.user_context for update
  using (auth.uid() = user_id);

-- Function to create user context on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.user_context (user_id, content)
  values (new.id, '');
  return new;
end;
$$;

-- Trigger to create user context when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
