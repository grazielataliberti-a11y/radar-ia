"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase, supabaseEnvError, type CasoIa } from "@/lib/supabase";

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

const FORMULARIO_VAZIO = {
  aluno: "",
  area: "",
  problema: "",
  solucao_ia: "",
};

function formatarData(iso: string) {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function rotuloContagem(total: number) {
  if (total === 1) return "1 caso publicado";
  return `${total} casos publicados`;
}

async function buscarCasos(): Promise<{ casos: CasoIa[]; erro: string | null }> {
  if (!supabase) return { casos: [], erro: null };

  const { data, error } = await supabase
    .from("casos_ia")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { casos: [], erro: error.message };
  return { casos: (data ?? []) as CasoIa[], erro: null };
}

export function Mural() {
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [casos, setCasos] = useState<CasoIa[]>([]);
  const [carregando, setCarregando] = useState(Boolean(supabase));
  const [enviando, setEnviando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    let ativo = true;

    void buscarCasos().then((resultado) => {
      if (!ativo) return;
      setErroLista(resultado.erro);
      setCasos(resultado.casos);
      setCarregando(false);
    });

    return () => {
      ativo = false;
    };
  }, []);

  function atualizarCampo(campo: keyof typeof FORMULARIO_VAZIO, valor: string) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
    setErroFormulario(null);
    setConfirmacao(null);
  }

  async function publicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const aluno = formulario.aluno.trim();
    const area = formulario.area.trim();
    const problema = formulario.problema.trim();
    const solucaoIa = formulario.solucao_ia.trim();

    if (!aluno || !area || !problema || !solucaoIa) {
      setConfirmacao(null);
      setErroFormulario("Preencha nome, área, problema e como a IA ajuda.");
      return;
    }

    if (!supabase) {
      setConfirmacao(null);
      setErroFormulario(supabaseEnvError ?? "Cliente do Supabase indisponível.");
      return;
    }

    setEnviando(true);
    setErroFormulario(null);
    setConfirmacao(null);

    const { error } = await supabase.from("casos_ia").insert({
      aluno,
      area,
      problema,
      solucao_ia: solucaoIa,
    });

    if (error) {
      setEnviando(false);
      setErroFormulario(error.message);
      return;
    }

    setFormulario(FORMULARIO_VAZIO);
    setConfirmacao("Caso publicado no mural.");
    setEnviando(false);

    const resultado = await buscarCasos();
    setErroLista(resultado.erro);
    setCasos(resultado.casos);
    setCarregando(false);
  }

  const listaPronta = Boolean(supabase) && !carregando && !erroLista;

  return (
    <div className="pagina">
      <header className="cabecalho">
        <h1>Radar de Casos de Uso de IA</h1>
        <p className="subtitulo">
          Mural da turma — o que a inteligência artificial já resolve (ou pode resolver) no seu ofício
        </p>
      </header>

      {supabaseEnvError ? (
        <p className="aviso" role="alert">
          {supabaseEnvError}
        </p>
      ) : null}

      <section className="painel" aria-labelledby="titulo-formulario">
        <h2 id="titulo-formulario">Publicar um caso</h2>
        <form className="formulario" onSubmit={publicar} noValidate>
          <label htmlFor="aluno">
            Nome
            <input
              id="aluno"
              name="aluno"
              type="text"
              autoComplete="name"
              value={formulario.aluno}
              onChange={(event) => atualizarCampo("aluno", event.target.value)}
            />
          </label>

          <label htmlFor="area">
            Área
            <select
              id="area"
              name="area"
              value={formulario.area}
              onChange={(event) => atualizarCampo("area", event.target.value)}
            >
              <option value="">Selecione a área</option>
              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </label>

          <div className="campo">
            <div className="campo-topo">
              <label htmlFor="problema">Problema do dia a dia</label>
              <span className="limite">{formulario.problema.length}/280</span>
            </div>
            <textarea
              id="problema"
              name="problema"
              maxLength={280}
              rows={4}
              value={formulario.problema}
              onChange={(event) => atualizarCampo("problema", event.target.value)}
            />
          </div>

          <div className="campo">
            <div className="campo-topo">
              <label htmlFor="solucao">Como a IA ajuda</label>
              <span className="limite">{formulario.solucao_ia.length}/280</span>
            </div>
            <textarea
              id="solucao"
              name="solucao_ia"
              maxLength={280}
              rows={4}
              value={formulario.solucao_ia}
              onChange={(event) => atualizarCampo("solucao_ia", event.target.value)}
            />
          </div>

          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Publicar caso"}
          </button>

          {erroFormulario ? (
            <p className="erro" role="alert">
              {erroFormulario}
            </p>
          ) : null}
          {confirmacao ? (
            <p className="confirmacao" role="status">
              {confirmacao}
            </p>
          ) : null}
        </form>
      </section>

      <section className="lista" aria-labelledby="titulo-lista">
        <h2 id="titulo-lista">
          {carregando ? "Carregando casos..." : listaPronta ? rotuloContagem(casos.length) : "Casos publicados"}
        </h2>

        {erroLista ? (
          <p className="erro" role="alert">
            Não foi possível carregar o mural. {erroLista}
          </p>
        ) : null}

        {listaPronta && casos.length === 0 ? (
          <p className="vazio">Nenhum caso publicado ainda. Seja o primeiro.</p>
        ) : null}

        {listaPronta
          ? casos.map((caso) => (
              <article key={caso.id} className="cartao">
                <div className="cartao-topo">
                  <h3>{caso.aluno}</h3>
                  <span className="etiqueta">{caso.area}</span>
                  <time className="quando" dateTime={caso.created_at}>
                    {formatarData(caso.created_at)}
                  </time>
                </div>
                <p className="rotulo">Problema</p>
                <p className="texto">{caso.problema}</p>
                <p className="rotulo">Solução</p>
                <p className="texto">{caso.solucao_ia}</p>
              </article>
            ))
          : null}
      </section>

      <footer className="rodape">Exercício de aula · Cursor + Supabase + Vercel</footer>
    </div>
  );
}
