import { useState } from "react";
import { Link } from "react-router-dom";
import { MissionBadge } from "../components/MissionBadge";
import { antennaById, receiverById } from "../data/equipment";
import { useAccount } from "../hooks/useAccount";
import { useLogbook } from "../hooks/useStore";
import { achievementsFor, collectedSatelliteIds } from "../lib/collection";

export function AccountPage() {
  const { configured, email, pending, notice, signIn, signOut } = useAccount();
  const { store, syncState, syncDetail } = useLogbook();
  const [address, setAddress] = useState("");
  const achievements = achievementsFor(store.logs);
  const collected = collectedSatelliteIds(store.logs);
  const antenna = antennaById(store.profile.antennaId);
  const receivers = store.profile.receiverIds.map((id) => receiverById(id)?.name).filter(Boolean);

  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Account</p>
      <h1>Account</h1>

      <article className="pass profile-overview-card">
        <p className="eyebrow">Your station</p>
        <h2>{store.profile.locationName}</h2>
        <p>
          {store.profile.latitude.toFixed(4)}, {store.profile.longitude.toFixed(4)} · {store.profile.timeZone}
        </p>
        <p className="muted">
          {receivers.join(", ") || "No receivers"} · {antenna?.name ?? "Antenna"} · min elevation {store.profile.minElevation}°
        </p>
        <div className="row">
          <Link to="/my-equipment">Edit station</Link>
          <Link to="/settings/alerts">Alert preferences</Link>
          <Link to="/collection">{collected.length} satellite{collected.length === 1 ? "" : "s"} logged</Link>
        </div>
      </article>

      <div className="section-line" id="missions">
        <div>
          <h2>Mission badges</h2>
          <p className="muted mission-lede">
            {achievements.filter((item) => item.earned).length}/{achievements.length} complete. Earned from your logbook.
          </p>
        </div>
        <Link to="/collection#missions">Open mission board</Link>
      </div>
      <div className="mission-grid">
        {achievements.map((item) => (
          <MissionBadge key={item.slug} achievement={item} size="md" />
        ))}
      </div>

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
            <button type="button" className="ghost" onClick={() => void signOut()} disabled={pending}>Sign out</button>
          </div>
        </>
      )}
      {notice && <p>{notice}</p>}
    </section>
  );
}
