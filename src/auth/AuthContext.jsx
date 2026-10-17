import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { clearSessionCache, endSession } from "./session";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [loggingOut, setLoggingOut] = useState(false);
  async function logout() {
    setLoggingOut(true);
    try {
      await endSession({
        signOut: () => signOut(auth),
        clear: () => clearSessionCache(),
        redirect: () => window.location.replace("/login"),
      });
    } finally { setLoggingOut(false); }
  }
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (next) => { setUser(next); setLoading(false); }, () => setLoading(false));
  }, []);
  return <AuthContext.Provider value={{ user, loading: loading || loggingOut, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
