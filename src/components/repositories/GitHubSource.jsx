import GitHubIcon from "../ui/GitHubIcon";
import { useEffect, useState } from "react";

import { api, readToken } from "../../api";
import "./GitHubSource.css";

export default function GitHubSource() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!readToken()) return;
    api.me().then(setUser).catch(() => setUser(null));
  }, []);

  const logged = user?.authenticated && !user.anonymous;
  if (logged) return null;

  return (
    <div className="github-source">
      <a className="btn btn-primary" href={api.githubUrl()}>
        <GitHubIcon size={16} /> Conectar repositório
      </a>
      <p>Autorize o acesso ao GitHub para listar os repositórios disponíveis.</p>
    </div>
  );
}
