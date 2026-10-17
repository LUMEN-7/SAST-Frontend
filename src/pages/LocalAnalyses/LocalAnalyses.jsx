import { useEffect, useRef, useState } from "react";
import { FileCode2, LockKeyhole, Trash2, Download } from "lucide-react";
import Layout from "../../components/layout/AppLayout";
import Tag from "../../components/ui/SeverityTag";
import { validateFiles } from "../../services/localScanner";
import "./LocalAnalyses.css";
export default function LocalAnalyses() {
  const [files, setFiles] = useState([]), [results, setResults] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const worker = useRef(null), input = useRef(null);
  useEffect(() => () => worker.current?.terminate(), []);
  function clear() {
    worker.current?.terminate(); worker.current = null;
    setFiles([]); setResults(null); setBusy(false); setError("");
    if (input.current) input.current.value = "";
  }
  function analyze(event) {
    event.preventDefault(); setError(""); setResults(null);
    try {
      validateFiles(files); setBusy(true);
      worker.current?.terminate();
      const next = new Worker(new URL("./scanner.worker.js", import.meta.url), { type: "module" });
      worker.current = next;
      next.onmessage = ({ data }) => { setBusy(false); if (data.error) setError(data.error); else setResults(data.results); next.terminate(); worker.current = null; };
      next.onerror = () => { setBusy(false); setError("Não foi possível analisar estes arquivos no navegador."); next.terminate(); worker.current = null; };
      next.postMessage(files);
    } catch (err) { setBusy(false); setError(err.message); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ mode: "local", engine: "Verificação por padrões; sem execução do código", results }, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "analise-local.json"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const total = results?.reduce((sum, result) => sum + result.findings.length, 0) || 0;
  return <Layout><main className="container page local-page">
    <div className="page-heading"><div><span className="section-kicker">NO SEU NAVEGADOR</span><h1>Análises locais</h1><p>Inspecione arquivos sem enviá-los para um servidor.</p></div><span className="local-badge"><LockKeyhole size={15} /> Processamento local</span></div>
    <section className="local-privacy"><LockKeyhole size={24} /><div><h2>Seu código fica com você</h2><p>Os arquivos, seus nomes e os resultados desta análise não são enviados à API, ao Firebase ou a terceiros. Não são incluídos no perfil, dashboard, alertas ou histórico da plataforma. Ficam apenas na memória desta página e são descartados ao sair dela ou recarregar. O relatório só é salvo se você escolher baixá-lo.</p><small>A autenticação do aplicativo continua usando Firebase; o conteúdo desta análise não é compartilhado com ele.</small></div></section>
    <form className="panel local-form" onSubmit={analyze}><h2>Selecione seu código</h2><p>Arquivos de código ou texto, até 2 MB cada e 10 MB no total. Até 50 arquivos; ZIP não é suportado.</p><label className="local-file-picker"><FileCode2 size={24} /><span>Escolher arquivos para análise</span><input ref={input} aria-label="Escolher arquivos locais" type="file" multiple disabled={busy} onChange={event => { setFiles(Array.from(event.target.files || [])); setResults(null); setError(""); }} /></label>
    {!!files.length && <ul className="local-file-list">{files.map((file, i) => <li key={i}>{file.name} <small>{Math.ceil(file.size / 1024)} KB</small></li>)}</ul>}
    {error && <div role="alert" className="notice error">{error}</div>}<div className="local-actions"><button type="submit" className="btn btn-primary" disabled={!files.length || busy}>{busy ? "Analisando no navegador…" : "Analisar localmente"}</button><button type="button" className="btn btn-outline" onClick={clear} disabled={!files.length && !results}><Trash2 size={16} />{busy ? "Cancelar e limpar" : "Limpar arquivos e resultados"}</button></div></form>
    <p className="local-limits">Esta verificação procura padrões de risco, como execução dinâmica, chaves privadas e TLS desativado. Não executa seu código, não usa IA e não substitui uma análise SAST completa. Pode gerar falsos positivos e deixar vulnerabilidades passar.</p>
    {results && <section className="panel" aria-live="polite"><div className="panel-head"><div><h2>Resultado local</h2><p>{results.length} arquivos verificados · {total} possíveis riscos</p></div><button type="button" className="btn btn-outline" onClick={download}><Download size={16} /> Baixar relatório local</button></div>{total === 0 && <p>Nenhum padrão de risco foi encontrado pelas regras disponíveis. Isso não garante que o código esteja seguro.</p>}{results.map((result, index) => <article key={index} className="local-result"><h3>{result.name}</h3>{result.truncated && <p>Limite de 500 achados atingido neste arquivo. O resultado está incompleto.</p>}{result.findings.map(finding => <div className="local-finding" key={finding.id}><Tag name={finding.severity} /><div><b>{finding.title}</b><small>Linha {finding.line} · {finding.rule}</small><p>{finding.advice}</p></div></div>)}{!result.findings.length && <p>Nenhum padrão identificado neste arquivo.</p>}</article>)}</section>}
  </main></Layout>;
}
