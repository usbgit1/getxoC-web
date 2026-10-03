-- Lista de equipos para el desplegable de la pestaña Registrar.
-- Pega en Supabase > SQL Editor > Run.

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  created_at timestamptz not null default now()
);

alter table teams enable row level security;
drop policy if exists "acceso abierto" on teams;
create policy "acceso abierto" on teams for all to anon using (true) with check (true);

insert into teams (nombre) values
  ('Getxo C'),
  ('Santurtzi'),
  ('Sporting de Lutxana'),
  ('Galea A'),
  ('Moraza A'),
  ('Astrabuduako'),
  ('Gallarta A'),
  ('Ikhoba A'),
  ('La Merced A'),
  ('Otxarkoaga A'),
  ('Portugalete C'),
  ('Urdaneta'),
  ('Sopuerta'),
  ('Balmaseda B'),
  ('Peña Athletic'),
  ('Astileku A')
on conflict (nombre) do nothing;

-- Debe devolver 16.
select count(*) as equipos from teams;
