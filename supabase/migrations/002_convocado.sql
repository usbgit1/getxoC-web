-- Nuevo parametro "convocado" por jugador y partido.
-- Pega en Supabase > SQL Editor > Run.

-- Los registros que ya existen son de jugadores que jugaron, asi que quedan convocados.
alter table match_players add column if not exists convocado boolean not null default true;

-- A partir de ahora, por defecto no convocado.
alter table match_players alter column convocado set default false;
