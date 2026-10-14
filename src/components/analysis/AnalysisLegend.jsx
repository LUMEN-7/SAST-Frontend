import "./AnalysisLegend.css";
const execution=[
 {label:"Concluída",tone:"success",description:"A verificação terminou e os resultados estão disponíveis."},
 {label:"Processando",tone:"info",description:"O código está sendo analisado neste momento."},
 {label:"Na fila",tone:"neutral",description:"A execução aguarda sua vez para começar."},
 {label:"Falhou",tone:"danger",description:"Ocorreu um erro na execução da análise."}
];
const security=[
 {label:"Aprovada",tone:"success",description:"Nenhuma vulnerabilidade ultrapassou o limite definido."},
 {label:"Reprovada",tone:"danger",description:"Foram encontrados riscos que bloqueiam a aprovação."},
 {label:"Pendente",tone:"neutral",description:"A avaliação não terminou ou ainda não tem dados suficientes."}
];
export default function AnalysisLegend(){
 return <div className="analysis-legend" aria-label="Legenda dos indicadores de análise">
  <section className="analysis-legend-section"><div className="analysis-legend-heading"><h3>Status da execução</h3><p>Etapa de processamento da verificação</p></div><div className="analysis-legend-grid">{execution.map(item=><div className="analysis-legend-item" key={item.label}><span className={"analysis-legend-badge legend-"+item.tone}><span className="legend-dot"/>{item.label}</span><p>{item.description}</p></div>)}</div></section>
  <section className="analysis-legend-section"><div className="analysis-legend-heading"><h3>Resultado de segurança</h3><p>Avaliação do Security Gate</p></div><div className="analysis-legend-grid">{security.map(item=><div className="analysis-legend-item" key={item.label}><span className={"analysis-legend-badge legend-"+item.tone}><span className="legend-dot"/>{item.label}</span><p>{item.description}</p></div>)}</div></section>
 </div>;
}