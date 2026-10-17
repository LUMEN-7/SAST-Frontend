import { Link } from "react-router-dom";
export default function Brand(){
  return <Link to="/" className="brand ares-brand ares-wordmark" aria-label="Ares — Lumen Security">
    <span><b>ares<span className="ares-brand-registered">.</span></b><small>LUMEN SECURITY</small></span>
  </Link>;
}