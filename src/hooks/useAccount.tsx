import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { accountRedirect, supabase } from "../lib/supabase";

interface AccountApi {
  client: SupabaseClient | null;
  configured: boolean;
  email: string | null;
  userId: string | null;
  pending: boolean;
  notice: string;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AccountContext = createContext<AccountApi | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => supabase(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!client);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!client) return;
    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });
    const { data } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  const api = useMemo<AccountApi>(() => ({
    client: ready ? client : null,
    configured: Boolean(client),
    email: session?.user.email ?? null,
    userId: ready ? session?.user.id ?? null : null,
    pending,
    notice,
    signIn: async (email) => {
      if (!client) return;
      setPending(true);
      setNotice("");
      const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: accountRedirect() } });
      setPending(false);
      setNotice(error ? error.message : `A sign-in link is on its way to ${email}.`);
    },
    signOut: async () => {
      if (!client) return;
      setPending(true);
      await client.auth.signOut();
      setPending(false);
      setNotice("Signed out. This browser still has its copy of the logbook.");
    },
  }), [client, notice, pending, ready, session]);

  return <AccountContext.Provider value={api}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountApi {
  const value = useContext(AccountContext);
  if (!value) throw new Error("Account missing");
  return value;
}
