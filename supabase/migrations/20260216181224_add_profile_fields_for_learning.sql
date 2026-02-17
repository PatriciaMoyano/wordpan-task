-- Add fields to profiles table for personalized language learning
alter table public.profiles
  add column full_name text,
  add column language_level text default 'intermediate',
  add column learning_goal text default 'general language learning';

-- Add comments for documentation
comment on column public.profiles.full_name is 'User''s full name for personalization';
comment on column public.profiles.language_level is 'Current language proficiency level (e.g., beginner, intermediate, advanced)';
comment on column public.profiles.learning_goal is 'User''s language learning objective';
