import "./AnalysisLegend.css";
export default function AnalysisLegend(){
 return <div className="analysis-legend" aria-label="Legenda dos indicadores de análise">
  <div><strong>Status da execução</strong><p><b>Concluída</b>: verificação finalizada · <b>Processando</b>: em andamento · <b>Na fila</b>: aguardando · <b>Falhou</b>: erro na execução.</p></div>
  <div><strong>Resultado de segurança</strong><p><b>Aprovada</b>: nenhum risco acima do limite · <b>Reprovada</b>: há riscos bloqueantes · <b>Pendente</b>: resultado indisponível ou análise não concluída.</p></div>
 </div>;
}