import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle(){
  const [theme,setTheme]=useState(()=>document.documentElement.dataset.aresTheme || "dark");
  function toggle(){
    const next=theme==="dark"?"light":"dark";
    document.documentElement.dataset.aresTheme=next;
    try{localStorage.setItem("ares-theme",next);}catch{}
    setTheme(next);
  }
  return <button type="button" className="theme-switch" role="switch" aria-checked={theme==="dark"} aria-label="Tema escuro" title={theme==="dark"?"Ativar tema claro":"Ativar tema escuro"} onClick={toggle}>
    <span className="theme-switch-thumb" aria-hidden="true"/>
    <Sun size={16} aria-hidden="true"/><Moon size={16} aria-hidden="true"/>
  </button>;
}
