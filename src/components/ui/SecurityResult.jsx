import "./SecurityResult.css";

// Limiar de aprovação: high (mesmo padrão do Security Gate).
// O resultado não é inferido do total de achados nem do status "concluída".
export function getSecurityResult(analysis) {
  if (!analysis || String(analysis.status || "").toLowerCase() !== "completed")
    return "pending";
  const explicit =
    analysis.gate?.gate ||
    analysis.security_gate?.gate ||
    analysis.gate_result ||
    analysis.security_result;
  if (explicit === "pass" || explicit === "approved") return "approved";
  if (explicit === "fail" || explicit === "rejected") return "rejected";
  if (
    typeof analysis.critical === "number" &&
    typeof analysis.high === "number"
  ) {
    return analysis.critical + analysis.high > 0 ? "rejected" : "approved";
  }
  return "pending";
}
const labels = {
  approved: "Aprovada",
  rejected: "Reprovada",
  pending: "Pendente",
};
export default function SecurityResult({ analysis }) {
  const status = getSecurityResult(analysis);
  return (
    <span
      className={"security-result security-result-" + status}
      title={
        status === "pending"
          ? "Resultado de segurança ainda não disponível"
          : "Resultado do Security Gate (limiar alto)"
      }
    >
      <span className="security-result-dot" />
      {labels[status]}
    </span>
  );
}
