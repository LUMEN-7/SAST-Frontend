export const repositoryCodes = {
  not_admin: "Precisa ser admin do repo.",
  plan_required: "Repo privado em plano Free: branch protection indisponível. O webhook funciona, mas o merge não será bloqueado.",
  existing_protection: "A branch já tem proteção. Você pode sobrescrever a configuração existente ou adicionar o check sast manualmente.",
  sso_required: "Autorize o token na organização no GitHub (SAML SSO) e tente novamente.",
  unauthorized: "Sua autorização do GitHub expirou. Refaça o login.",
  not_found: "Repo vazio, sem a branch padrão ainda. Crie a branch no GitHub antes de conectar.",
  rate_limited: "Limite de requisições do GitHub atingido. Tente novamente em instantes.",
  archived: "Repo arquivado, não dá para conectar.",
};
export const repositoryError = error => repositoryCodes[error?.code] || error?.message || "Não foi possível configurar o repositório.";
export const protectionWarning = result => {
  const detail = result?.protection_error;
  return detail ? repositoryError(typeof detail === "string" ? { code: detail, message: detail } : detail) : "";
};
export function initialProtection(repo) {
  if (typeof repo.protection_enabled === "boolean") return repo.protection_enabled;
  if (typeof repo.protection === "boolean") return repo.protection;
  if (typeof repo.protection?.enabled === "boolean") return repo.protection.enabled;
  if (["created", "updated", "modified"].includes(repo.protection_state)) return true;
  if (["disabled", "none"].includes(repo.protection_state)) return false;
  return null;
}
export const manualCheckInstructions = "No GitHub, abra Settings → Branches (ou Rules) → proteção da branch padrão. Em required status checks, adicione o contexto sast e salve. A plataforma não sobrescreveu a proteção existente.";
