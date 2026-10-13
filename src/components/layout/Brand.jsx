import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Link,NavLink,useNavigate,useParams,useLocation} from 'react-router-dom';
import {Activity,ArrowDownToLine,ArrowLeft,ArrowRight,ArrowUpRight,BookOpen,Check,CheckCircle2,ChevronDown,Clock3,CloudUpload,Code2,ExternalLink,FileArchive,FileCode2,FolderGit2,Github,GitBranch,LayoutDashboard,LockKeyhole,Menu,Search,Shield,ShieldAlert,ShieldCheck,ShieldQuestion,Terminal,TriangleAlert,UploadCloud,X} from 'lucide-react';
import {ResponsiveContainer,AreaChart,Area,CartesianGrid,XAxis,YAxis,Tooltip,BarChart,Bar,Cell} from 'recharts';
function Brand(){return <Link className="brand" to="/"><span className="brand-mark"><ShieldCheck size={22}/></span><span><b>LUMEN<span className="brand-accent">.</span>SAST</b><small>SECURITY INTELLIGENCE</small></span></Link>}
export default Brand;
