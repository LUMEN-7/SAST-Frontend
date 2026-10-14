import {Bell,ShieldCheck,Info} from "lucide-react";
import Layout from "../../components/layout/AppLayout";
import Empty from "../../components/ui/EmptyState";
import "./Alerts.css";
export default function Alerts(){return <Layout><main className="container page alerts-page"><div className="page-heading"><div><h1>Alertas</h1><p>Acompanhe eventos que precisam de atenção.</p></div></div>
<div className="alerts-overview"><section className="panel"><div className="panel-head"><div><h2>Alertas de segurança</h2><p>Notificações geradas por verificações de segurança.</p></div></div><Empty icon={Bell} title="Nenhum alerta disponível">O backend ainda não oferece um endpoint de notificações. Nenhum alerta foi simulado.</Empty></section>
<section className="panel alerts-context"><ShieldCheck size={22}/><h2>Monitoramento</h2><p>Quando a integração com repositórios e GitHub Actions estiver disponível, esta área poderá reunir alertas por projeto e severidade.</p><div className="feature-note"><Info size={15}/>Apenas dados reais serão apresentados.</div></section></div>
</main></Layout>}
