import {Link} from "react-router-dom";
import {ArrowUpRight,ChevronDown,FileCode2,FolderGit2} from "lucide-react";
import Tag from "../ui/SeverityTag";
import "./ProjectFindingsAccordion.css";

export default function ProjectFindingsAccordion({analyses=[],alerts=[],onSelect}){
 const groups=analyses.map(analysis=>({
   ...analysis,
   files:alerts.filter(alert=>alert.repository_id===analysis.repository_id)
 })).filter(group=>group.files.length);
 if(!groups.length)return <p className="metric-no-results">Nenhum arquivo identificado nos dados disponíveis.</p>;
 return <div className="project-findings-accordion">{groups.map((group,index)=>
  <details className="project-findings-group" key={group.id} open={index===0}>
   <summary>
    <span className="project-findings-summary"><FolderGit2 size={18}/><span><strong>{group.repo_name||group.name||group.id}</strong><small>{group.files.length} {group.files.length===1?"arquivo identificado":"arquivos identificados"}</small></span></span>
    <ChevronDown size={18} className="project-findings-chevron"/>
   </summary>
   <div className="project-findings-rows">
    {group.files.map(alert=><Link to={"/analysis/"+group.id+"?file="+encodeURIComponent(alert.file)} onClick={onSelect} className="project-finding-row" key={alert.id}>
     <FileCode2 size={17} className="project-finding-file-icon"/>
     <span className="project-finding-file"><strong>{alert.file}</strong><small>{alert.title}</small></span>
     <Tag name={alert.severity}/>
     <ArrowUpRight size={16} className="project-finding-arrow"/>
    </Link>)}
   </div>
  </details>
 )}<p className="metric-data-note">Arquivos identificados nas ocorrências disponíveis. O total de vulnerabilidades pode incluir outros achados.</p></div>
}
