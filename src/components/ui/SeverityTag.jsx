import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Link,NavLink,useNavigate,useParams,useLocation} from 'react-router-dom';
import {Activity,ArrowDownToLine,ArrowLeft,ArrowRight,ArrowUpRight,BookOpen,Check,CheckCircle2,ChevronDown,Clock3,CloudUpload,Code2,ExternalLink,FileArchive,FileCode2,FolderGit2,Github,GitBranch,LayoutDashboard,LockKeyhole,Menu,Search,Shield,ShieldAlert,ShieldCheck,ShieldQuestion,Terminal,TriangleAlert,UploadCloud,X} from 'lucide-react';
import {ResponsiveContainer,AreaChart,Area,CartesianGrid,XAxis,YAxis,Tooltip,BarChart,Bar,Cell} from 'recharts';
import {severity} from '../../utils/security';
function Tag({name}){const v=severity(name);return <span className="severity" style={{'--sev':v.color}}><span className="severity-dot"/>{v.label}</span>}
export default Tag;
