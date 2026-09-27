create table if not exists radar.casos_ia (
  id uuid primary key default gen_random_uuid(),
  aluno text not null,
  area text not null,
  problema text not null,
  solucao_ia text not null,
  created_at timestamptz not null default now()
);

alter table radar.casos_ia enable row level security;

drop policy if exists casos_ia_leitura on radar.casos_ia;
create policy casos_ia_leitura
  on radar.casos_ia
  for select
  to anon, authenticated
  using (true);

drop policy if exists casos_ia_insercao on radar.casos_ia;
create policy casos_ia_insercao
  on radar.casos_ia
  for insert
  to anon, authenticated
  with check (true);

grant usage on schema radar to anon, authenticated;
grant select, insert on table radar.casos_ia to anon, authenticated;
