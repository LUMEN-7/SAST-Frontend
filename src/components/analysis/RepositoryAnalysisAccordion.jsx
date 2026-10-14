import {Link} from "react-router-dom";
import {ArrowUpRight,ChevronDown,FolderGit2} from "lucide-react";
import Status from "../ui/AnalysisStatus";
import SecurityResult from "../ui/SecurityResult";
import {date} from "../../utils/security";
import "./RepositoryAnalysisAccordion.css";

export default function RepositoryAnalysisAccordion({groups}){
 return <div className="repo-analysis-groups">
  {groups.map((group,index)=><details key={group.id} className="repo-analysis-group" open={index===0}>
   <summary><span className="repo-analysis-title"><FolderGit2 size={19}/><span><b>{group.name}</b><small>{group.analyses.length} {group.analyses.length===1?"análise":"análises"}</small></span></span><ChevronDown size={18} className="repo-analysis-chevron"/></summary>
   <div className="repo-analysis-table"><table><thead><tr><th>Execução</th><th>Data e hora</th><th>Commit</th><th>Achados</th><th>Status</th><th>Resultado</th><th></th></tr></thead><tbody>
    {group.analyses.map((analysis,index)=><tr key={analysis.id}><td><Link className="repo-analysis-link" to={"/analysis/"+encodeURIComponent(analysis.id)}>Análise #{group.analyses.length-index}</Link><small className="repo-analysis-branch">{analysis.branch||"Branch não informada"}</small></td><td>{date(analysis.created_at||analysis.at)}</td><td className="mono">{analysis.commit||"—"}</td><td>{analysis.total_findings??"—"}</td><td><Status value={analysis.status}/></td><td><SecurityResult analysis={analysis}/></td><td><Link className="repo-analysis-open" to={"/analysis/"+encodeURIComponent(analysis.id)} aria-label={"Abrir dashboard da análise "+analysis.id}><ArrowUpRight size={17}/></Link></td></tr>)}
   </tbody></table></div>
  </details>)}
 </div>
}
