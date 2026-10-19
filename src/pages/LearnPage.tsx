export function LearnPage() {
  return (
    <section className="panel">
      <p className="eyebrow">Darkside RF / Learn</p>
      <h1>Listening notes</h1>
      <article className="pass">
        <h2>A pass is not a transmission</h2>
        <p>Orbital elements tell you when a satellite is above the horizon. They do not tell you that a beacon, repeater or SSTV transmitter is switched on. DarksideRF keeps those as separate facts.</p>
      </article>
      <article className="pass">
        <h2>Doppler</h2>
        <p>As the satellite approaches, the downlink sounds higher. As it leaves, it sounds lower. On 2 m the shift is a few kilohertz. On 70 cm it is larger. The figure on a pass card is an estimate at the highest point.</p>
      </article>
      <article className="pass">
        <h2>What you are hearing</h2>
        <p>FM voice is speech. SSTV is a whistling frame that becomes a picture only after decoding. CW is Morse or a beacon tone. Weather APT and LRPT need a wider bandwidth and a decoder. Hearing the carrier is a reception. A picture or decoded packet is a decode.</p>
      </article>
      <article className="pass">
        <h2>The collection</h2>
        <p>You caught the signal. It stays in the logbook even if the satellite later goes quiet or re-enters. The log is private to this browser and self-reported. It is not a verified observation.</p>
      </article>
    </section>
  );
}
