import "./SecurityResult.css";

import { getSecurityResult } from "../../services/analysisData";
export { getSecurityResult };
const labels = {
  approved: "Aprovada",
  rejected: "Reprovada",
  pending: "Pendente",
  unavailable: "Não informado",
};
export default function SecurityResult({ analysis }) {
  const status = getSecurityResult(analysis);
  return (
    <span
      className={"security-result security-result-" + status}
      title={
        status === "unavailable"
          ? "A execução terminou, mas a API não forneceu o resultado de segurança"
          : status === "pending"
          ? "Resultado de segurança ainda não disponível"
          : "Resultado do Security Gate (limiar alto)"
      }
    >
      <span className="security-result-dot" />
      {labels[status]}
    </span>
  );
}
