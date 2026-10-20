export function AboutPage() {
  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / About</p>
      <h1>A listening station</h1>
      <p className="lede">Don't just track satellites. Listen to them.</p>
      <article className="pass">
        <h2>What this site does</h2>
        <p>DarksideRF predicts when a satellite is above your horizon and shows the frequency, mode, and the result you should expect: a waterfall check, an SSTV image, a weather picture, voice, a packet, or Morse.</p>
        <p>A pass is geometry from the current orbit. Hearing the signal is a separate fact. Without an account, the logbook, watchlist, and station stay in this browser. An account copies that station so another device can use it.</p>
      </article>
      <article className="pass">
        <h2>Where the numbers come from</h2>
        <p>The trackable list is an active SatNOGS downlink joined to a CelesTrak orbit. AMSAT status reports mark satellites listeners have heard in the last 30 days. JE9PEL is compared beside that list. A published frequency that has no current orbit is not added to the pass search.</p>
        <p>Bandwidth and step on a card are the usual SDR settings for that mode, unless a published passband gives a measured span.</p>
      </article>
    </section>
  );
}
