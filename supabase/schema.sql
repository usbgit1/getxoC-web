-- Getxo C: seguimiento de jugadores y partidos.
-- Pega este archivo entero en Supabase > SQL Editor > Run.

create extension if not exists "pgcrypto";

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  dorsal int unique,
  nombre text not null,
  posicion text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  jornada int not null unique,
  fecha date,
  hora text,
  rival text,
  es_local boolean not null default true,
  goles_getxo int check (goles_getxo >= 0),
  goles_rival int check (goles_rival >= 0),
  jugado boolean not null default false,
  created_at timestamptz not null default now()
);

-- Participacion de cada jugador en un partido.
create table if not exists match_players (
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  titular boolean not null default false,
  minutos int not null default 0 check (minutos between 0 and 150),
  goles int not null default 0 check (goles >= 0),
  primary key (match_id, player_id)
);

-- Acceso abierto: cualquiera con la clave anon puede leer y editar.
-- Para cerrarlo mas adelante, sustituye estas politicas por otras con auth.
alter table players enable row level security;
alter table matches enable row level security;
alter table match_players enable row level security;

do $$
declare t text;
begin
  foreach t in array array['players','matches','match_players'] loop
    execute format('drop policy if exists "acceso abierto" on %I', t);
    execute format('create policy "acceso abierto" on %I for all to anon using (true) with check (true)', t);
  end loop;
end $$;
