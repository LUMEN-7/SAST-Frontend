export const level = {
  critical: { label: "Crítica", color: "#f15b73", rank: 5 },
  high: { label: "Alta", color: "#fb9466", rank: 4 },
  medium: { label: "Média", color: "#e8b45d", rank: 3 },
  low: { label: "Baixa", color: "#55b8d2", rank: 2 },
  info: { label: "Info", color: "#92a8d4", rank: 1 },
};
export const statuses = {
  queued: "Na fila",
  pending: "Pendente",
  running: "Processando",
  processing: "Processando",
  completed: "Concluída",
  failed: "Falhou",
};
export const date = (s) => (s ? new Date(s).toLocaleString("pt-BR") : "—");
export const severity = (s) =>
  level[String(s || "").toLowerCase()] || level.info;
