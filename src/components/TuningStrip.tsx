import { formatDial, formatFrequency, formatSpan } from "../lib/format";
import { expectedOutcome } from "../lib/outcome";
import { suggestedTuning } from "../lib/tuning";
import type { Transmitter } from "../types";

function cellClass(label: string): string | undefined {
  if (label === "Frequency") return "tune-span tune-main";
  if (label === "Dial") return "tune-span";
  return undefined;
}

export function TuningStrip({ transmitter, dialHz }: { transmitter: Transmitter; dialHz?: number | null }) {
  const tuning = suggestedTuning(transmitter);
  const outcome = expectedOutcome(transmitter);
  const cells: { label: string; value: string }[] = [
    { label: "Frequency", value: formatFrequency(transmitter.downlinkHz) },
    { label: "Mode", value: transmitter.mode ?? "—" },
    { label: "Modulation", value: tuning.modulation ?? "—" },
    { label: "Bandwidth", value: tuning.bandwidthHz ? formatSpan(tuning.bandwidthHz) : "—" },
    { label: "Step", value: tuning.stepHz ? formatSpan(tuning.stepHz) : "—" },
  ];
  if (transmitter.baud) cells.push({ label: "Baud", value: transmitter.baud.toLocaleString("en-IE") });
  if (dialHz) cells.push({ label: "Dial", value: formatDial(dialHz) });

  return (
    <div className="tune-wrap">
      <div className="expect">
        <span>Expected result</span>
        <strong>{outcome.label}</strong>
        <p>{outcome.detail}</p>
      </div>
      <dl className="tune">
        {cells.map((cell) => (
          <div key={cell.label} className={cellClass(cell.label)}>
            <dt>{cell.label}</dt>
            <dd>{cell.value}</dd>
          </div>
        ))}
      </dl>
      <p className="muted tune-note">
        {tuning.fromPassband
          ? "Bandwidth is the published passband. The other settings are the usual SDR choices for this mode."
          : tuning.modulation
            ? "Modulation, bandwidth, and step are the usual SDR settings for this mode."
            : "SatNOGS recorded the frequency without a mode, so there is no suggested filter."}
      </p>
    </div>
  );
}
