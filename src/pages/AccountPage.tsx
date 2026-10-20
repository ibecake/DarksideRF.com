import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "../hooks/useAccount";
import { useLogbook } from "../hooks/useStore";

export function AccountPage() {
  const { configured, email, pending, notice, signIn, signOut } = useAccount();
  const { syncState, syncDetail } = useLogbook();
  const [address, setAddress] = useState("");

  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Account</p>
      <h1>Account</h1>
      {!configured && (
        <>
          <p className="lede">Listening, passes, and this browser’s logbook work without an account. Sign-in is waiting on a Supabase project.</p>
          <article className="pass">
            <h2>What to connect</h2>
            <p>Create a Supabase project, run <code>supabase/schema.sql</code> in its SQL editor, then set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>. Add this site’s <code>/account</code> address to the email redirect allow list.</p>
            <p className="muted">The anon key is public. Row policies are what keep a logbook private. Do not put the service role key in the site.</p>
          </article>
        </>
      )}
      {configured && !email && (
        <>
          <p className="lede">An account keeps the station, watchlist, reminders, and logbook with you. This browser keeps a copy either way.</p>
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              void signIn(address.trim());
            }}
          >
            <label>
              Email
              <input type="email" required autoComplete="email" value={address} onChange={(event) => setAddress(event.target.value)} />
            </label>
            <button type="submit" disabled={pending}>{pending ? "Sending…" : "Email me a sign-in link"}</button>
          </form>
        </>
      )}
      {configured && email && (
        <>
          <p className="lede">Signed in as {email}.</p>
          <p>{syncState === "saved" ? "The logbook on this account matches this browser." : syncState === "error" ? syncDetail : "Checking the account copy."}</p>
          <p className="muted">The first sign-in copies this browser into an empty account. A second device loads that account and keeps its own offline copy.</p>
          <div className="row">
            <Link to="/settings/alerts">Alert preferences</Link>
            <button type="button" className="ghost" onClick={() => void signOut()} disabled={pending}>Sign out</button>
          </div>
        </>
      )}
      {notice && <p>{notice}</p>}
    </section>
  );
}
