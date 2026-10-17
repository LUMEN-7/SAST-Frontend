import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import { api, saveRecent } from "../../api";

export default function ZipUpload({ repositoryId = "" }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function send(event) {
    event.preventDefault();
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      setError("O zip passa de 100 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const created = await api.submit(file, repositoryId || undefined);
      saveRecent({
        id: created.job_id,
        name: file.name,
        status: created.status,
        repository_id: repositoryId || null,
      });
      navigate(`/analysis/${created.job_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel" onSubmit={send}>
      <div className="panel-head">
        <div>
          <h2>Enviar zip</h2>
          <p>Manda o código compactado para a API varrer. ZIP até 100 MB.</p>
        </div>
      </div>
      <label className="search-field">
        <UploadCloud size={17} />
        <input
          type="file"
          accept=".zip,application/zip"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
      </label>
      {error && <div className="notice error">{error}</div>}
      <button className="btn btn-primary" type="submit" disabled={!file || busy}>
        {busy ? "Enviando…" : "Analisar"}
      </button>
    </form>
  );
}
