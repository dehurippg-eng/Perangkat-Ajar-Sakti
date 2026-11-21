import { useEffect, useState } from "react";
import { LoginView } from "./components/LoginView";
import { ModulWorkspace } from "./components/ModulWorkspace";
import type { TeacherUser } from "./types/modul";

interface SessionState {
  user: TeacherUser;
  token: string;
}

export default function App() {
  const [session, setSession] = useState<SessionState | null>(null);

  useEffect(() => {
    if (session && window.location.pathname === "/") {
      window.history.replaceState(null, "", "/modul");
    } else if (!session && window.location.pathname !== "/") {
      window.history.replaceState(null, "", "/");
    }
  }, [session]);

  function handleLoginSuccess(user: TeacherUser, token: string) {
    setSession({ user, token });
    window.history.pushState(null, "", "/modul");
  }

  function handleLogout() {
    setSession(null);
    window.history.pushState(null, "", "/");
  }

  if (!session) {
    return <LoginView onSuccess={handleLoginSuccess} />;
  }

  return <ModulWorkspace user={session.user} token={session.token} onLogout={handleLogout} />;
}
