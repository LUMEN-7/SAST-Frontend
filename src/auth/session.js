export async function clearSessionCache(browser = window) {
  // Firebase clears its persisted credentials through signOut before this runs.
  browser.localStorage.clear();
  browser.sessionStorage.clear();
  if (browser.caches) {
    const names = await browser.caches.keys();
    await Promise.all(names.map(name => browser.caches.delete(name)));
  }
}

export async function endSession({ signOut, clear, redirect }) {
  await signOut();
  await clear();
  // A fresh document drops React state, OAuth credentials and in-memory results.
  redirect();
}
