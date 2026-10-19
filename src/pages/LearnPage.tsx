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
        <h2>How to listen</h2>
        <p>Each pass card names an expected result. Match the radio to that result.</p>
      </article>
      <article className="pass">
        <h2>Voice</h2>
        <p>Use narrow FM, about 15 kHz wide, with a 5 kHz step. Let the signal drift with Doppler as the satellite crosses the sky. Speech is there while that transmitter is in voice mode.</p>
      </article>
      <article className="pass">
        <h2>SSTV image</h2>
        <p>Use the same narrow FM settings as voice, then an SSTV decoder. Use Robot 36 or Martin when the transmitter record names that mode. Wait for a full frame before judging the pass. SSDV is the same idea as picture packets that assemble into an image.</p>
      </article>
      <article className="pass">
        <h2>Packet decode</h2>
        <p>Packet downlinks are usually narrow FM with 1200 baud AFSK. The modem tones are audible on their own. Frames appear when a packet decoder locks.</p>
      </article>
      <article className="pass">
        <h2>Morse and single sideband</h2>
        <p>Listen in SSB with a narrow filter. A CW beacon is a tone or a series of dits. A linear transponder carries voice or Morse somewhere in the passband, so search across it in USB or LSB.</p>
      </article>
      <article className="pass">
        <h2>Weather picture</h2>
        <p>APT is a wide FM signal, about 40 kHz, and LRPT is wider still, about 150 kHz. Both need a picture decoder. HRPT is a wide L-band recording and needs a dish plus a receiver that can take that bandwidth.</p>
      </article>
      <article className="pass">
        <h2>Waterfall check</h2>
        <p>Many catalogue entries are a carrier, a burst, or telemetry. Confirm energy at the published frequency. A matching decoder for that satellite can turn the same recording into frames. LoRa needs the spreading factor and bandwidth from the record. Digital video needs a DVB-S2 receiver on that frequency.</p>
      </article>
      <article className="pass">
        <h2>Repeaters</h2>
        <p>A CTCSS figure in the catalogue describes how transmitting stations open a repeater. The downlink is audible without entering that tone.</p>
      </article>
      <article className="pass">
        <h2>The collection</h2>
        <p>You caught the signal. It stays in the logbook even if the satellite later goes quiet or re-enters. The log is private to this browser and self-reported. It is not a verified observation.</p>
      </article>
    </section>
  );
}
