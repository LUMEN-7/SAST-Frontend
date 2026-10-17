import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export default function Brand() {
  return (
    <Link className="brand ares-brand" to="/" aria-label="Ares by Lumen Security — Visão geral">
      <span className="brand-mark ares-brand-mark" aria-hidden="true">
        <Shield size={23} strokeWidth={1.8} />
        <span className="ares-mark-core">A</span>
      </span>
      <span className="ares-brand-copy">
        <b>ARES<span className="ares-brand-registered">.</span></b>
        <small>BY LUMEN SECURITY</small>
      </span>
    </Link>
  );
}
