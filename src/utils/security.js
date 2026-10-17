export const level = {
  critical: { label: "Crítica", color: "#E5484D", rank: 5 },
  high: { label: "Alta", color: "#F0734A", rank: 4 },
  medium: { label: "Média", color: "#E2C14B", rank: 3 },
  low: { label: "Baixa", color: "#6E8BB5", rank: 2 },
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
