export function authError(error) {
  return ({
    "auth/link-email-mismatch": "Entre com a conta que usa o mesmo e-mail exibido para concluir a vinculação.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/email-already-in-use": "Este e-mail já está cadastrado. Entre na sua conta.",
    "auth/weak-password": "Escolha uma senha mais forte, com pelo menos 6 caracteres.",
    "auth/password-does-not-meet-requirements": "A senha não atende à política de segurança do projeto.",
    "auth/invalid-email": "Informe um e-mail válido.",
    "auth/popup-closed-by-user": "A janela foi fechada. Tente novamente para continuar.",
    "auth/popup-blocked": "Permita pop-ups neste navegador para continuar.",
    "auth/cancelled-popup-request": "Outra tentativa de acesso foi iniciada. Tente novamente.",
    "auth/account-exists-with-different-credential": "Este e-mail já usa outro método de acesso. Entre com esse método e vincule a nova conta em Minha conta.",
    "auth/credential-already-in-use": "Esta conta já está vinculada a outro usuário.",
    "auth/provider-already-linked": "Este provedor já está vinculado à sua conta.",
    "auth/requires-recent-login": "Entre novamente antes de realizar esta alteração.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
    "auth/unauthorized-domain": "Este domínio precisa ser autorizado no Firebase Authentication.",
    "auth/operation-not-allowed": "Este método de acesso precisa ser ativado no Firebase Authentication.",
    "auth/user-disabled": "Esta conta foi desativada. Entre em contato com o administrador.",
  })[error.code] || "Não foi possível concluir. Tente novamente.";
}
