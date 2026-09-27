"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabase, supabaseConfigError } from "@/lib/supabase";

const AREAS = [
  "Saúde",
  "Educação",
  "Jurídico",
  "Gestão",
  "Engenharia",
  "Finanças",
  "Marketing",
  "Outra",
] as const;

const LIMITE = 280;

type Caso = {
  id: string;
  aluno: string;
  area: string;
  problema: string;
  solucao_ia: string;
  created_at: string;
};

const vazio = {
  aluno: "",
  area: "",
  problema: "",
  solucao_ia: "",
};

function formatarData(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function Home() {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [form, setForm] = useState(vazio);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(supabaseConfigError);
  const [aviso, setAviso] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!supabase) {
      setCarregando(false);
      setErro(supabaseConfigError);
      return;
    }

    setCarregando(true);
    const { data, error } = await supabase
      .from("casos_ia")
      .select("id, aluno, area, problema, solucao_ia, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setErro(error.message);
      setCasos([]);
    } else {
      setErro(null);
      setCasos(data ?? []);
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void carregar();
    }, 0);
    return () => window.clearTimeout(id);
  }, [carregar]);

  async function publicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAviso(null);

    const registro = {
      aluno: form.aluno.trim(),
      area: form.area.trim(),
      problema: form.problema.trim(),
      solucao_ia: form.solucao_ia.trim(),
    };

    if (!registro.aluno || !registro.area || !registro.problema || !registro.solucao_ia) {
      setErro("Preencha nome, área, problema e como a IA ajuda.");
      return;
    }

    if (!supabase) {
      setErro(supabaseConfigError);
      return;
    }

    setEnviando(true);
    setErro(null);

    const { error } = await supabase.from("casos_ia").insert(registro);

    if (error) {
      setErro(error.message);
      setEnviando(false);
      return;
    }

    setForm(vazio);
    setAviso("Caso publicado.");
    setEnviando(false);
    await carregar();
  }

  const total = casos.length;
  const contador = total === 1 ? "1 caso publicado" : `${total} casos publicados`;

  return (
    <main className="page">
      <p className="kicker">Pós-graduação</p>
      <h1>Radar de Casos de Uso de IA</h1>
      <p className="lead">
        Mural da turma — o que a inteligência artificial já resolve (ou pode resolver) no seu ofício
      </p>

      {erro ? <p className="banner error">{erro}</p> : null}
      {aviso ? <p className="banner ok">{aviso}</p> : null}

      <section className="panel">
        <h2>Publicar um caso</h2>
        <form onSubmit={publicar}>
          <label>
            Nome
            <input
              name="aluno"
              autoComplete="name"
              value={form.aluno}
              onChange={(event) => setForm({ ...form, aluno: event.target.value })}
              disabled={enviando || Boolean(supabaseConfigError)}
            />
          </label>

          <label>
            Área
            <select
              name="area"
              value={form.area}
              onChange={(event) => setForm({ ...form, area: event.target.value })}
              disabled={enviando || Boolean(supabaseConfigError)}
            >
              <option value="">Selecione</option>
              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="field-top">
              Problema do dia a dia
              <span className="counter">
                {form.problema.length}/{LIMITE}
              </span>
            </span>
            <textarea
              name="problema"
              maxLength={LIMITE}
              value={form.problema}
              onChange={(event) => setForm({ ...form, problema: event.target.value })}
              disabled={enviando || Boolean(supabaseConfigError)}
            />
          </label>

          <label>
            <span className="field-top">
              Como a IA ajuda
              <span className="counter">
                {form.solucao_ia.length}/{LIMITE}
              </span>
            </span>
            <textarea
              name="solucao_ia"
              maxLength={LIMITE}
              value={form.solucao_ia}
              onChange={(event) => setForm({ ...form, solucao_ia: event.target.value })}
              disabled={enviando || Boolean(supabaseConfigError)}
            />
          </label>

          <button type="submit" disabled={enviando || Boolean(supabaseConfigError)}>
            {enviando ? "Enviando..." : "Publicar caso"}
          </button>
        </form>
      </section>

      <div className="list-head">
        <h2>Casos da turma</h2>
        <p className="count">{contador}</p>
      </div>

      {carregando ? <p className="loading">Carregando casos...</p> : null}

      {!carregando && casos.length === 0 ? (
        <p className="empty">Nenhum caso publicado ainda. Seja o primeiro.</p>
      ) : null}

      <div className="stack">
        {casos.map((caso) => (
          <article className="card" key={caso.id}>
            <div className="card-top">
              <h3>{caso.aluno}</h3>
              <time className="when" dateTime={caso.created_at}>
                {formatarData(caso.created_at)}
              </time>
            </div>
            <span className="tag">{caso.area}</span>
            <p>
              <span className="label">Problema</span>
              {caso.problema}
            </p>
            <p>
              <span className="label">Como a IA ajuda</span>
              {caso.solucao_ia}
            </p>
          </article>
        ))}
      </div>

      <footer>Exercício de aula · Cursor + Supabase + Vercel</footer>
    </main>
  );
}
