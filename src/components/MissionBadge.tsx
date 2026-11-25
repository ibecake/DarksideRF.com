import type { Achievement } from "../lib/collection";

const art: Record<string, { ring: string; fill: string; ink: string; glow: string }> = {
  "first-contact": { ring: "#5a8f6a", fill: "#0f2418", ink: "#3ddc84", glow: "#1a3d28" },
  "signal-hunter": { ring: "#8a9a4a", fill: "#1c2210", ink: "#d4e24a", glow: "#2a3218" },
  "orbital-explorer": { ring: "#5a7a9a", fill: "#0f1c2a", ink: "#6eb6ff", glow: "#182838" },
  "picture-perfect": { ring: "#8a6a9a", fill: "#1c1028", ink: "#d4a0ff", glow: "#2a1838" },
  "zombie-hunter": { ring: "#9a6a5a", fill: "#241410", ink: "#ff9a6e", glow: "#321c14" },
  decoder: { ring: "#5a9a8a", fill: "#0f2420", ink: "#5dffc8", glow: "#183830" },
};

function Glyph({ slug }: { slug: string }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (slug) {
    case "first-contact":
      return (
        <>
          <circle cx="32" cy="34" r="4.5" fill="currentColor" stroke="none" />
          <path {...stroke} d="M23 34a9 9 0 0 1 9-9M41 34a9 9 0 0 0-9-9" />
          <path {...stroke} d="M17 34a15 15 0 0 1 15-15M47 34a15 15 0 0 0-15-15" />
          <path {...stroke} d="M32 42v6" />
        </>
      );
    case "signal-hunter":
      return (
        <>
          <circle {...stroke} cx="32" cy="32" r="9" />
          <circle cx="32" cy="32" r="2.4" fill="currentColor" stroke="none" />
          <path {...stroke} d="M32 17v4.5M32 42.5V47M17 32h4.5M42.5 32H47" />
          <path {...stroke} d="M22 22l3 3M42 22l-3 3M22 42l3-3M42 42l-3-3" />
        </>
      );
    case "orbital-explorer":
      return (
        <>
          <ellipse {...stroke} cx="32" cy="32" rx="17" ry="7.5" transform="rotate(-28 32 32)" />
          <ellipse {...stroke} cx="32" cy="32" rx="17" ry="7.5" transform="rotate(42 32 32)" />
          <circle cx="32" cy="32" r="4" fill="currentColor" stroke="none" />
          <circle cx="46" cy="25" r="2.2" fill="currentColor" stroke="none" />
        </>
      );
    case "picture-perfect":
      return (
        <>
          <rect {...stroke} x="17" y="19" width="30" height="24" rx="3" />
          <path {...stroke} d="M17 38l9-8 7 6 6-8 8 10" />
          <circle cx="25" cy="27" r="2.3" fill="currentColor" stroke="none" />
          <path {...stroke} d="M40 19v-3h7v7" />
        </>
      );
    case "zombie-hunter":
      return (
        <>
          <ellipse {...stroke} cx="32" cy="33" rx="16" ry="6.5" transform="rotate(-18 32 33)" />
          <rect {...stroke} x="25" y="25" width="14" height="14" rx="2" />
          <path {...stroke} d="M25 29l-8-6M39 29l8-6M25 37l-7 7M39 37l7 7" opacity="0.75" />
          <path {...stroke} d="M29 31h6M29 35h6" opacity="0.85" />
        </>
      );
    case "decoder":
      return (
        <>
          <path {...stroke} d="M16 22h10M16 32h16M16 42h12" />
          <path {...stroke} d="M38 20v24M43 24v16M48 28v8" />
          <circle cx="21" cy="22" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="24" cy="32" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="22" cy="42" r="1.6" fill="currentColor" stroke="none" />
        </>
      );
    default:
      return <circle {...stroke} cx="32" cy="32" r="10" />;
  }
}

/** Flat-top hexagon — reads as a mission patch, not a circle. */
const HEX = "32,4 54,17 54,47 32,60 10,47 10,17";
const HEX_INNER = "32,11 48,20 48,44 32,53 16,44 16,20";

function PatchFace({ slug, earned }: { slug: string; earned: boolean }) {
  const palette = art[slug] ?? { ring: "#6a6a6a", fill: "#1a1a1a", ink: "#cfcfcf", glow: "#222" };
  const glowId = `glow-${slug}`;
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id={glowId} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={palette.glow} />
          <stop offset="100%" stopColor={palette.fill} />
        </radialGradient>
      </defs>
      <polygon points={HEX} fill={`url(#${glowId})`} stroke={palette.ring} strokeWidth="2.6" strokeLinejoin="round" />
      <polygon points={HEX_INNER} fill="none" stroke={palette.ring} strokeWidth="1" opacity="0.7" />
      <g style={{ color: palette.ink }} opacity={earned ? 1 : 0.42}>
        <Glyph slug={slug} />
      </g>
      {!earned && <polygon points={HEX} fill="rgba(0,0,0,0.5)" />}
    </svg>
  );
}

export function MissionBadge({
  achievement,
  size = "md",
  showLabel = true,
}: {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  return (
    <figure className={`mission-badge ${achievement.earned ? "earned" : "locked"} size-${size}`}>
      <div className="mission-patch">
        <PatchFace slug={achievement.slug} earned={achievement.earned} />
      </div>
      {showLabel && (
        <figcaption>
          <strong>{achievement.title}</strong>
          <span>{achievement.earned ? "Mission complete" : achievement.description}</span>
        </figcaption>
      )}
    </figure>
  );
}

export function MissionBadgeStrip({
  achievements,
  compact = false,
}: {
  achievements: Achievement[];
  compact?: boolean;
}) {
  const earned = achievements.filter((item) => item.earned).length;
  return (
    <div className={`mission-strip ${compact ? "compact" : ""}`}>
      <div className="mission-strip-head">
        <p className="eyebrow">Missions</p>
        <strong>
          {earned}/{achievements.length} complete
        </strong>
      </div>
      <ul className="mission-strip-badges">
        {achievements.map((item) => (
          <li key={item.slug} title={`${item.title}: ${item.description}`}>
            <MissionBadge achievement={item} size="sm" showLabel={false} />
            {!compact && <span className="mission-strip-label">{item.title}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
