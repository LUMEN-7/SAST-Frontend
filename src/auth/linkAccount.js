// Confirm ownership of the original account before attaching the OAuth credential.
export async function completeAccountLink(user, pending, { link, logout }) {
  if (!pending) return;
  if (user.email?.trim().toLowerCase() !== pending.email.trim().toLowerCase()) {
    await logout();
    throw { code: "auth/link-email-mismatch" };
  }
  const providerId = pending.credential.providerId;
  if (user.providerData?.some(provider => provider.providerId === providerId)) return;
  try {
    return await link(user, pending.credential);
  } catch (error) {
    // Firebase may have completed linking in another tab or an earlier attempt.
    if (error.code !== "auth/provider-already-linked") throw error;
  }
}
