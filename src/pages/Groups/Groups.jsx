import { useEffect, useState } from "react";
import Layout from "../../components/layout/AppLayout";
import { api } from "../../api";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [repos, setRepos] = useState([]);
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setGroups(await api.groups());
    const data = await api.repos();
    setRepos(data.repos || []);
  }

  useEffect(() => { load().catch((error) => setMessage(error.message)); }, []);

  async function create(event) {
    event.preventDefault();
    const group = await api.createGroup(name);
    setName("");
    setSelected(group.id);
    setMessage(`Grupo ${group.name} criado. Você é o admin.`);
    load();
  }

  async function addRepo(repositoryId) {
    await api.addGroupRepo(selected, repositoryId);
    setMessage("Repositório entrou no grupo.");
  }

  async function addMember(role) {
    await api.addGroupMember(selected, email, role);
    setMessage(`${email} entrou como ${role}.`);
    setEmail("");
  }

  return (
    <Layout>
      <main className="container page">
        <h1>Grupos</h1>
        <form onSubmit={create} className="panel">
          <h2>Novo grupo</h2>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do grupo" required />
          <button className="btn btn-primary" type="submit">Criar</button>
        </form>
        <section className="panel">
          <h2>Meus grupos</h2>
          {groups.map((group) => (
            <button key={group.id} type="button" onClick={() => setSelected(group.id)}>
              {group.name} · {group.role}
            </button>
          ))}
        </section>
        {selected && (
          <section className="panel">
            <h2>Repos da conta</h2>
            {repos.map((repo) => (
              <button key={repo.id} type="button" onClick={() => addRepo(repo.id)}>{repo.full_name}</button>
            ))}
            <h2>Membros</h2>
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email do usuário" />
            <button type="button" onClick={() => addMember("member")}>Adicionar membro</button>
            <button type="button" onClick={() => addMember("admin")}>Tornar admin</button>
          </section>
        )}
        {message && <p>{message}</p>}
      </main>
    </Layout>
  );
}
