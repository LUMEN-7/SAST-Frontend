export const onboardingKey = uid => "ares-onboarding-complete:"+uid;
export function needsOnboarding(user,storage) {
  if (!user) return false;
  try { if (storage?.getItem(onboardingKey(user.uid)) === "1") return false; } catch {}
  const created = Date.parse(user.metadata?.creationTime);
  const signedIn = Date.parse(user.metadata?.lastSignInTime);
  return Number.isFinite(created) && Number.isFinite(signedIn) && Math.abs(signedIn-created) < 2000;
}
