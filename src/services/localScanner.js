const RULES = [
  { id: "dynamic-eval", severity: "high", title: "Execução dinâmica de código", pattern: /\b(?:eval|exec)\s*\(/, advice: "Evite executar strings como código. Valide e interprete os dados explicitamente." },
  { id: "unsafe-html", severity: "medium", title: "Inserção de HTML potencialmente insegura", pattern: /(?:\.innerHTML\s*=|dangerouslySetInnerHTML\s*=|document\.write\s*\()/, advice: "Prefira conteúdo textual ou sanitize o HTML com uma biblioteca apropriada." },
  { id: "shell-command", severity: "high", title: "Execução de comando do sistema", pattern: /(?:\b(?:os\.system|subprocess\.(?:run|Popen|call)|child_process\.exec)\s*\(|shell\s*=\s*True)/, advice: "Confira a origem dos argumentos e evite o shell ao executar comandos." },
  { id: "private-key", severity: "critical", title: "Possível chave privada no arquivo", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, advice: "Remova a chave do código. Se foi exposta, revogue e substitua a credencial." },
  { id: "embedded-secret", severity: "high", title: "Possível segredo definido no código", pattern: /\b(?:password|passwd|api_key|apiKey|client_secret|access_token)\s*[:=]\s*["'][^"'\s]{8,}["']/i, advice: "Confirme se é uma credencial real. Mova segredos para um gerenciador e revogue valores expostos." },
  { id: "disabled-tls", severity: "high", title: "Verificação TLS desativada", pattern: /(?:verify\s*=\s*False|rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*["']?0)/, advice: "Ative a validação dos certificados TLS." },
];
export const SUPPORTED = /\.(?:js|jsx|ts|tsx|mjs|cjs|py|php|java|go|rb|cs|sql|html|htm|json|ya?ml|toml|ini|env|txt|sh)$/i;
export function scanText(text, name) {
  if (text.includes("\0")) throw new Error("Arquivo binário não suportado.");
  const findings = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    for (const rule of RULES) {
      if (rule.pattern.test(line)) findings.push({ id: `${name}:${index + 1}:${rule.id}`, file: name, line: index + 1, rule: rule.id, severity: rule.severity, title: rule.title, advice: rule.advice });
      if (findings.length >= 500) return { findings, truncated: true };
    }
  }
  return { findings, truncated: false };
}
export function validateFiles(files) {
  if (!files.length) throw new Error("Selecione ao menos um arquivo de código ou texto.");
  if (files.length > 50) throw new Error("Selecione no máximo 50 arquivos por análise.");
  if (files.reduce((total, file) => total + file.size, 0) > 10 * 1024 * 1024) throw new Error("O total deve ser de até 10 MB.");
  for (const file of files) {
    if (!SUPPORTED.test(file.name) && file.name !== ".env") throw new Error(`Formato não suportado: ${file.name}. Selecione arquivos de código ou texto, sem ZIP.`);
    if (file.size > 2 * 1024 * 1024) throw new Error(`O arquivo ${file.name} excede 2 MB.`);
  }
}
